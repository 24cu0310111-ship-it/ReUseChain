import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      include: {
        components: true,
        decisionCases: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        passportEvents: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute aggregated metrics
    const totalDevices = devices.length;
    let totalComponents = 0;
    let flaggedCount = 0;
    let healthyCount = 0;
    let repairCount = 0;
    let reuseCount = 0;
    let recycleCount = 0;

    devices.forEach((d) => {
      totalComponents += d.components.length;
      if (d.lifecycleStatus === "flagged" || d.lifecycleStatus === "quarantine") {
        flaggedCount++;
      } else {
        healthyCount++;
      }

      const latestDecision = d.decisionCases[0];
      if (latestDecision) {
        if (latestDecision.recommendedPath === "repair") repairCount++;
        else if (latestDecision.recommendedPath.includes("reuse")) reuseCount++;
        else if (latestDecision.recommendedPath === "recycle") recycleCount++;
      }
    });

    const pendingApprovalsCount = await prisma.approval.count({
      where: { decision: "pending" },
    });

    return NextResponse.json({
      success: true,
      data: devices,
      metrics: {
        totalDevices,
        totalComponents,
        flaggedCount,
        healthyCount,
        pendingApprovalsCount,
        circularityBreakdown: {
          repair: repairCount,
          reuse: reuseCount,
          recycle: recycleCount,
        },
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch devices:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
