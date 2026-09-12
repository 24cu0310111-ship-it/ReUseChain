import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      assetTag,
      organisation,
      make,
      model,
      ageMonths,
      currentRole,
      telemetryJson,
    } = body;

    if (!assetTag || !make || !model) {
      return NextResponse.json(
        { success: false, error: "assetTag, make, and model are required" },
        { status: 400 }
      );
    }

    const serialHash = sha256(`${make}-${model}-${assetTag}-${Date.now()}`);

    // Create device record
    const device = await prisma.device.create({
      data: {
        assetTag,
        serialHash,
        organisation: organisation || "Campus General Fleet",
        make,
        model,
        ageMonths: parseInt(ageMonths) || 24,
        currentRole: currentRole || "General Workstation",
        lifecycleStatus: "monitored",
      },
    });

    // Parse telemetry if provided, otherwise initialize default components
    let componentsToCreate: any[] = [];

    if (telemetryJson) {
      try {
        const parsed = typeof telemetryJson === "string" ? JSON.parse(telemetryJson) : telemetryJson;
        if (parsed.components && Array.isArray(parsed.components)) {
          componentsToCreate = parsed.components.map((c: any) => ({
            deviceId: device.id,
            type: c.type || "battery",
            model: c.model || `${make} OEM ${c.type}`,
            healthPercent: parseFloat(c.healthPercent) || (c.fullChargeCapacityWh && c.designCapacityWh ? (c.fullChargeCapacityWh / c.designCapacityWh) * 100 : 85),
            currentStatus: (parseFloat(c.healthPercent) || 85) < 60 ? "declining" : "healthy",
            specsJson: JSON.stringify(c),
          }));
        }
      } catch (e) {
        console.warn("Failed to parse telemetryJson, using fallback components");
      }
    }

    if (componentsToCreate.length === 0) {
      // Create standard default components
      componentsToCreate = [
        {
          deviceId: device.id,
          type: "battery",
          model: `${make} 54Wh Internal Battery`,
          healthPercent: 88.0,
          currentStatus: "healthy",
          specsJson: JSON.stringify({ designWh: 54, fullChargeWh: 47.5, cycles: 210 }),
        },
        {
          deviceId: device.id,
          type: "ssd",
          model: "M.2 NVMe 512GB PCIe SSD",
          healthPercent: 95.0,
          currentStatus: "healthy",
          specsJson: JSON.stringify({ sizeGb: 512, smartWearPercent: 5 }),
        },
        {
          deviceId: device.id,
          type: "ram",
          model: "16GB DDR4-3200 SODIMM",
          healthPercent: 100.0,
          currentStatus: "healthy",
          specsJson: JSON.stringify({ sizeGb: 16 }),
        },
        {
          deviceId: device.id,
          type: "display",
          model: "14-inch FHD IPS Panel",
          healthPercent: 98.0,
          currentStatus: "healthy",
          specsJson: JSON.stringify({ resolution: "1920x1080" }),
        },
      ];
    }

    for (const comp of componentsToCreate) {
      await prisma.component.create({ data: comp });
    }

    // Save diagnostic report record
    const payloadStr = JSON.stringify(telemetryJson || { status: "manual_registration" });
    const payloadChecksum = sha256(payloadStr);

    await prisma.diagnosticReport.create({
      data: {
        deviceId: device.id,
        source: telemetryJson ? "diagnostic_upload" : "manual_registration",
        rawPayload: payloadStr,
        checksum: payloadChecksum,
      },
    });

    // Create Initial Passport Event
    const initialHash = sha256(`00000000000000000000000000000000${device.id}`);
    await prisma.passportEvent.create({
      data: {
        deviceId: device.id,
        eventCategory: "identity",
        eventType: "DEVICE_ENROLLED",
        actor: "IT Asset Intake Portal",
        description: `Device enrolled into ReUseChain management with ${componentsToCreate.length} active hardware sub-components.`,
        eventHash: initialHash,
        prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
      },
    });

    return NextResponse.json({
      success: true,
      deviceId: device.id,
      assetTag: device.assetTag,
      componentsCount: componentsToCreate.length,
    });
  } catch (error: any) {
    console.error("Failed to intake device:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
