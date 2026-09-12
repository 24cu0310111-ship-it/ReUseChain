import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeComponentTrend } from "@/lib/trend-engine";
import * as crypto from "crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const devices = await prisma.device.findMany({
      include: {
        components: {
          include: {
            healthSamples: {
              orderBy: { timestamp: "desc" },
              take: 15,
            },
          },
        },
      },
    });

    const now = new Date();
    const simulatedDate = new Date(now.getTime() + 24 * 3600 * 1000);
    const notifications: string[] = [];

    for (const dev of devices) {
      for (const comp of dev.components) {
        if (comp.healthPercent <= 0) continue;

        let parsedSpecs: any = {};
        try {
          parsedSpecs = comp.specsJson ? JSON.parse(comp.specsJson) : {};
        } catch (e) {}

        // Determine degradation delta
        let delta = 0.08; // default normal wear
        if (parsedSpecs.degradationSlope) {
          delta = Math.abs(parsedSpecs.degradationSlope);
        } else if (comp.type === "battery") {
          delta = dev.model.includes("MacBook") ? 0.32 : 0.12;
        }

        const newHealth = Math.max(0, comp.healthPercent - (delta * 2));
        const newCapacity = parsedSpecs.fullChargeWh ? Math.max(5, parsedSpecs.fullChargeWh - delta) : undefined;

        // Update component
        await prisma.component.update({
          where: { id: comp.id },
          data: {
            healthPercent: parseFloat(newHealth.toFixed(1)),
            currentStatus: newHealth < 50 ? "critical" : newHealth < 75 ? "declining" : "healthy",
            specsJson: JSON.stringify({
              ...parsedSpecs,
              fullChargeWh: newCapacity ? parseFloat(newCapacity.toFixed(2)) : undefined,
            }),
          },
        });

        // Add sample
        await prisma.healthSample.create({
          data: {
            componentId: comp.id,
            timestamp: simulatedDate,
            metricName: comp.type === "battery" ? "full_charge_capacity_wh" : "health_percent",
            metricValue: newCapacity || newHealth,
            source: "DailyMonitoringSimulator.Agent",
            confidence: "high",
          },
        });

        // Run trend analysis
        const samples = [...comp.healthSamples, { timestamp: simulatedDate, metricValue: newCapacity || newHealth }];
        const trend = analyzeComponentTrend(samples);

        if (trend.isAnomaly && dev.lifecycleStatus === "monitored") {
          await prisma.device.update({
            where: { id: dev.id },
            data: { lifecycleStatus: "flagged" },
          });

          // Commit anomaly alert to Circularity Passport
          const lastEvent = await prisma.passportEvent.findFirst({
            where: { deviceId: dev.id },
            orderBy: { timestamp: "desc" },
          });
          const prevHash = lastEvent ? lastEvent.eventHash : "0000000000000000000000000000000000000000000000000000000000000000";
          const eventHash = sha256(prevHash + `ANOMALY_DETECTED:${comp.id}:${Date.now()}`);

          await prisma.passportEvent.create({
            data: {
              deviceId: dev.id,
              componentId: comp.id,
              eventCategory: "health",
              eventType: "ACCELERATED_DEGRADATION_FLAG",
              actor: "Predictive Monitoring Engine",
              description: `Automated Alert: ${trend.alertReason}`,
              eventHash,
              prevHash,
            },
          });

          notifications.push(`Flagged ${dev.assetTag} (${comp.type}): ${trend.alertReason}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Simulated 1 day fleet telemetry forward to ${simulatedDate.toLocaleDateString()}`,
      notifications,
    });
  } catch (error: any) {
    console.error("Simulation failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
