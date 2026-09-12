import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Cognitive parser for single-turn booking prompt
function parseSingleTurnPrompt(prompt: string): {
  detectedIssue: string;
  serviceCategory: string;
  timeSlot: string;
  estimatedCost: number;
} {
  const text = (prompt || "").toLowerCase();

  // 1. Identify Service Category & Cost
  let detectedIssue = "Hardware Preventative Servicing & Diagnostics";
  let serviceCategory = "PC_HARDWARE_DOORSTEP_REPAIR";
  let estimatedCost = 50.0;

  if (text.includes("keyboard") || text.includes("keys") || text.includes("spacebar")) {
    detectedIssue = "OEM Keyboard Assembly & Flex Ribbon Replacement";
    estimatedCost = 55.0;
  } else if (text.includes("battery") || text.includes("drain") || text.includes("charge")) {
    detectedIssue = "OEM Battery Pack Replacement & Power Circuit Calibration";
    estimatedCost = 73.0;
  } else if (text.includes("screen") || text.includes("display") || text.includes("cracked")) {
    detectedIssue = "Display Panel Alignment & Sub-Assembly Inspection";
    estimatedCost = 85.0;
  } else if (text.includes("fan") || text.includes("heat") || text.includes("overheating") || text.includes("thermal")) {
    detectedIssue = "Thermal Re-Pasting, Fan De-Dusting & Heatsink Servicing";
    estimatedCost = 45.0;
  } else if (text.includes("ssd") || text.includes("hard drive") || text.includes("storage") || text.includes("nvme")) {
    detectedIssue = "NVMe SSD Replacement & Clean OS Restoration";
    estimatedCost = 65.0;
  }

  // 2. Identify Time Slot from natural language
  let timeSlot = "Tomorrow, 10:00 AM - 12:00 PM (Express Slot)";
  if (text.includes("10 am") || text.includes("10:00")) {
    timeSlot = text.includes("tomorrow") ? "Tomorrow, 10:00 AM - 12:00 PM" : "Today, 10:00 AM - 12:00 PM";
  } else if (text.includes("11 am") || text.includes("11:00")) {
    timeSlot = text.includes("tomorrow") ? "Tomorrow, 11:00 AM - 01:00 PM" : "Today, 11:00 AM - 01:00 PM";
  } else if (text.includes("2 pm") || text.includes("14:00") || text.includes("afternoon")) {
    timeSlot = text.includes("sunday") 
      ? "Sunday, 02:00 PM - 04:00 PM" 
      : text.includes("saturday") 
      ? "Saturday, 02:00 PM - 04:00 PM" 
      : "Tomorrow, 02:00 PM - 04:00 PM";
  } else if (text.includes("weekend") || text.includes("saturday") || text.includes("sunday")) {
    timeSlot = "This Weekend, 11:00 AM - 01:00 PM (Weekend Priority)";
  }

  return { detectedIssue, serviceCategory, timeSlot, estimatedCost };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      prompt, 
      assetTag = "ASSET-0142", 
      serviceTypeOverride, 
      timeSlotOverride 
    } = body;

    if (!prompt && !serviceTypeOverride) {
      return NextResponse.json(
        { success: false, error: "prompt or serviceTypeOverride is required" },
        { status: 400 }
      );
    }

    // 1. User Authentication & Automation:
    // Automatically retrieve stored user profile to bypass form-filling!
    let profile = await prisma.userProfile.findFirst({
      where: { id: "user_default" },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          id: "user_default",
          fullName: "Sarah Chen",
          email: "sarah.chen@techcorp.io",
          phoneNumber: "+91 98765 43210",
          role: "Lead Fleet Asset Manager",
          addressLine: "42 Tech Park Boulevard, Block C, Suite 402",
          city: "Bangalore",
          state: "Karnataka",
          pinCode: "560103",
          gpsCoordinates: "12.9716, 77.5946",
        },
      });
    }

    // 2. Single-Turn Prompt Parsing
    const parsed = parseSingleTurnPrompt(prompt || serviceTypeOverride);
    const serviceDescription = serviceTypeOverride || parsed.detectedIssue;
    const timeSlot = timeSlotOverride || parsed.timeSlot;
    const totalAmount = parsed.estimatedCost;

    // 3. Resolve Target Device
    const dev = await prisma.device.findFirst({
      where: { OR: [{ assetTag }, { id: assetTag }] },
    });
    const deviceId = dev?.id || (await prisma.device.findFirst())?.id || "GENERIC_DEVICE";
    const targetTag = dev?.assetTag || assetTag;

    // 4. ONDC Services Protocol Lifecycle Simulation:
    // search -> select -> init -> confirm
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const ondcOrderId = `ONDC-SRV-2026-${randomSuffix}`;
    const providerName = "UrbanCare Hardware Logistics on ONDC Services Network (BPP)";
    const providerId = "BPP-UC-BLR-9921";
    const bapId = "reusechain.ondc.bap.org";
    const bppId = "services.ondc.bpp.urbancare.net";
    const trackingUrl = `https://track.ondc.services/order/${ondcOrderId}?gps=${encodeURIComponent(profile.gpsCoordinates)}`;

    // 5. Commit to SQLite via Prisma (OndcBooking & TechnicianBooking)
    const ondcBooking = await prisma.ondcBooking.create({
      data: {
        ondcOrderId,
        deviceId,
        assetTag: targetTag,
        serviceCategory: parsed.serviceCategory,
        serviceDescription,
        timeSlot,
        providerName,
        providerId,
        bapId,
        bppId,
        customerName: profile.fullName,
        customerPhone: profile.phoneNumber,
        doorstepAddress: `${profile.addressLine}, ${profile.city}, ${profile.state}`,
        pinCode: profile.pinCode,
        gpsCoordinates: profile.gpsCoordinates,
        totalAmountUSD: totalAmount,
        orderStatus: "CONFIRMED",
        trackingUrl,
      },
    });

    const technicianBooking = await prisma.technicianBooking.create({
      data: {
        deviceId,
        assetTag: targetTag,
        serviceType: serviceDescription,
        technicianName: "Alex Rivera (Dell/HP Certified)",
        vendorName: providerName,
        estimatedCost: totalAmount,
        scheduledDate: new Date(Date.now() + 86400000), // Next day
        serviceStatus: "dispatched",
        workOrderNotes: `ONDC Services Order: ${ondcOrderId}. Single-turn auto-booking. Doorstep GPS: ${profile.gpsCoordinates}. Slot: ${timeSlot}.`,
      },
    });

    // 6. Cryptographic Circularity Passport Sealing
    const lastEvent = await prisma.passportEvent.findFirst({ orderBy: { timestamp: "desc" } });
    const prevHash = lastEvent ? lastEvent.eventHash : "GENESIS_BLOCK_000000000000000000000000000000000000";
    const eventPayload = `ONDC_BOOKING:${ondcOrderId}:${targetTag}:${serviceDescription}:${Date.now()}`;
    const passportHash = sha256(prevHash + eventPayload);

    await prisma.passportEvent.create({
      data: {
        deviceId,
        eventCategory: "custody",
        eventType: "ONDC_DOORSTEP_TECHNICIAN_CONFIRMED",
        actor: "Autonomous ONDC Services Agent",
        description: `ONDC Doorstep Order Confirmed: ${serviceDescription} (${ondcOrderId}) assigned to Alex Rivera. Destination: ${profile.addressLine}, PIN: ${profile.pinCode} (GPS: ${profile.gpsCoordinates}).`,
        eventHash: passportHash,
        prevHash,
      },
    });

    // Update OndcBooking with passportHash
    await prisma.ondcBooking.update({
      where: { id: ondcBooking.id },
      data: { passportHash },
    });

    return NextResponse.json({
      success: true,
      ondcOrderId,
      status: "CONFIRMED",
      message: `Doorstep technician reserved via ONDC Services Network for ${timeSlot}. Form-filling bypassed using verified profile for ${profile.fullName}.`,
      bookingDetails: {
        orderId: ondcOrderId,
        service: serviceDescription,
        scheduledSlot: timeSlot,
        assignedTechnician: technicianBooking.technicianName,
        provider: providerName,
        doorstepDelivery: {
          recipient: profile.fullName,
          phone: profile.phoneNumber,
          address: `${profile.addressLine}, ${profile.city}`,
          pinCode: profile.pinCode,
          gpsCoordinates: profile.gpsCoordinates,
        },
        pricing: {
          serviceFeeUSD: totalAmount,
          currency: "USD",
          networkProtocol: "ONDC-Services v2.0",
        },
        trackingUrl,
        passportHash,
      },
      userAutomation: {
        formFillingBypassed: true,
        credentialsAutoInjected: ["fullName", "phoneNumber", "addressLine", "pinCode", "gpsCoordinates"],
      },
    });
  } catch (error: any) {
    console.error("ONDC Services booking error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const recentOrders = await prisma.ondcBooking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      service: "ONDC Services API Doorstep Hardware Technician Dispatcher",
      protocolVersion: "ONDC-Services-v2.0",
      activeBAP: "reusechain.ondc.bap.org",
      totalBookings: recentOrders.length,
      recentOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
