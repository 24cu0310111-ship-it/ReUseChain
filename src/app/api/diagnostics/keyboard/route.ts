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
      deadKeys = [], 
      totalKeysTested = 0, 
      symptomReported = "Keyboard buttons aren't working",
      keyChatterDetected = false,
    } = body;

    const targetTag = assetTag || "ASSET-0142";
    const dev = await prisma.device.findFirst({
      where: { OR: [{ assetTag: targetTag }, { id: targetTag }] },
      include: { components: true },
    });

    const deviceId = dev?.id || (await prisma.device.findFirst())?.id;
    if (!deviceId) {
      return NextResponse.json({ success: false, error: "No target device found" }, { status: 404 });
    }

    // 1. Diagnostic Fault Analysis
    let failureClassification = "Individual Switch Contact Fatigue";
    let severity = "moderate";
    let recommendedAction = "Replace individual switch or keycap assembly.";

    if (deadKeys.length >= 3) {
      failureClassification = "Keyboard Matrix Circuit / Ribbon Cable Trace Fracture";
      severity = "critical";
      recommendedAction = "Full keyboard membrane and ribbon assembly replacement required.";
    } else if (keyChatterDetected) {
      failureClassification = "Membrane Conductive Oxidation or Liquid Contact Short";
      severity = "high";
      recommendedAction = "Ultrasonic cleaning or keyboard module replacement.";
    }

    // 2. Automated Hand-Off to Architecture 3: Execution Agent
    // Dispatches Technician Work Order for physical component repair
    const serviceType = deadKeys.length >= 3 
      ? "OEM Keyboard Assembly & Flex Ribbon Replacement"
      : "Precision Keyboard Switch Servicing";

    const estimatedCost = deadKeys.length >= 3 ? 55.0 : 35.0;

    const booking = await prisma.technicianBooking.create({
      data: {
        deviceId,
        assetTag: targetTag,
        serviceType,
        technicianName: "Alex Rivera (Dell/HP Certified)",
        vendorName: "Campus IT Hardware Depot",
        estimatedCost,
        scheduledDate: new Date(Date.now() + 86400000 * 2), // 2 days
        serviceStatus: "dispatched",
        workOrderNotes: `Physical Component Test Failed. Dead Keys: [${deadKeys.join(", ")}]. Classification: ${failureClassification}. Automatic dispatch via Execution Agent.`,
      },
    });

    // 3. Commit Cryptographic Passport Event
    const lastEvent = await prisma.passportEvent.findFirst({ orderBy: { timestamp: "desc" } });
    const prevHash = lastEvent ? lastEvent.eventHash : "GENESIS_BLOCK_000000000000000000000000000000000000";
    const eventHash = sha256(`KEYBOARD_TEST_DISPATCH:${booking.id}:${deadKeys.join("-")}:${Date.now()}`);

    await prisma.passportEvent.create({
      data: {
        deviceId,
        eventCategory: "custody",
        eventType: "KEYBOARD_HARDWARE_DEFECT_DISPATCHED",
        actor: "Physical Component Diagnostic Engine",
        description: `Automated keyboard test detected ${deadKeys.length} dead keys (${deadKeys.join(", ")}). Dispatched ${serviceType} to ${booking.technicianName}.`,
        eventHash,
        prevHash,
      },
    });

    return NextResponse.json({
      success: true,
      diagnosticResult: {
        assetTag: targetTag,
        totalKeysTested,
        deadKeysCount: deadKeys.length,
        deadKeys,
        failureClassification,
        severity,
        recommendedAction,
      },
      executionHandoff: {
        agent: "Architecture 3: Execution Agent",
        status: "dispatched",
        bookingId: booking.id,
        serviceType: booking.serviceType,
        technician: booking.technicianName,
        vendor: booking.vendorName,
        scheduledDate: booking.scheduledDate,
        estimatedCostUSD: booking.estimatedCost,
        passportHash: eventHash,
      },
      message: `Diagnostic confirmed hardware fault in keyboard matrix. The Execution Agent has autonomously booked technician ${booking.technicianName} for ${serviceType}.`,
    });
  } catch (error: any) {
    console.error("Keyboard diagnostic error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
