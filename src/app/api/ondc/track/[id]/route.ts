import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id || "");

    // Look for booking in database
    const booking = await prisma.ondcBooking.findFirst({
      where: {
        OR: [
          { ondcOrderId: cleanId },
          { id: cleanId },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const orderId = booking?.ondcOrderId || cleanId || "ONDC-SRV-2026-896751";
    const serviceDescription = booking?.serviceDescription || "Thermal Servicing, De-Dusting & Hardware Inspection";
    const serviceCategory = booking?.serviceCategory || "PC_HARDWARE_DOORSTEP_REPAIR";
    const customerName = booking?.customerName || "Sarah Chen";
    const customerPhone = booking?.customerPhone || "+91 98765 43210";
    const doorstepAddress = booking?.doorstepAddress || "42 Tech Park Boulevard, Block C, Suite 402, Bangalore";
    const pinCode = booking?.pinCode || "560103";
    const timeSlot = booking?.timeSlot || "Tomorrow, 10:30 AM - 12:00 PM (Express Slot)";
    const totalAmount = booking?.totalAmountUSD || 45.0;
    const passportHash = booking?.passportHash || "e7fc1c5171297dedef5b3d513a3bfb160d24e32e6f1c72a5b7d63b87515e41b1";

    const liveTrackingData = {
      success: true,
      orderId,
      status: "TECHNICIAN_IN_TRANSIT",
      statusBadge: "En Route to Destination",
      protocolVersion: "ONDC-Services v2.0",
      bapId: "reusechain.ondc.bap.org",
      bppId: "services.ondc.bpp.urbancare.net",
      providerName: "UrbanCare Hardware Logistics on ONDC Services Network",
      estimatedArrival: {
        minutesRemaining: 14,
        distanceKm: 2.1,
        etaTimestamp: "10:44 AM",
      },
      technician: {
        name: "Alex Rivera",
        title: "Dell & HP Certified Enterprise Specialist",
        rating: 4.94,
        totalJobs: 348,
        phoneNumber: "+91 98450 11223",
        badge: "ONDC Level 3 Verified Engineer",
        vehicle: "Eco-Electric Mobile Diagnostic Unit #BLR-42",
        currentGps: {
          lat: 12.9784,
          lng: 77.5912,
          locationName: "Indiranagar 100ft Rd, approaching Tech Park Corridor",
        },
      },
      destination: {
        recipient: customerName,
        phone: customerPhone,
        address: doorstepAddress,
        pinCode,
        gps: {
          lat: 12.9716,
          lng: 77.5946,
        },
      },
      serviceDetails: {
        category: serviceCategory,
        description: serviceDescription,
        scheduledSlot: timeSlot,
        preAuthorizedFeeUSD: totalAmount,
        currency: "USD",
        escrowStatus: "BAP_ESCROW_HELD_UNTIL_DIAGNOSIS",
      },
      milestones: [
        {
          id: "m1",
          title: "Service Order Confirmed",
          description: "Order accepted by UrbanCare BPP via ONDC Protocol",
          timestamp: "Today, 10:12 AM",
          completed: true,
          status: "done",
        },
        {
          id: "m2",
          title: "Doorstep Specialist Dispatched",
          description: "Alex Rivera assigned with OEM certified toolkit & thermal testing rig",
          timestamp: "Today, 10:18 AM",
          completed: true,
          status: "done",
        },
        {
          id: "m3",
          title: "Technician In-Transit (Live GPS Active)",
          description: "Navigating via GPS to 42 Tech Park Blvd (2.1 km away)",
          timestamp: "Today, 10:28 AM",
          completed: true,
          current: true,
          status: "in_progress",
        },
        {
          id: "m4",
          title: "Doorstep Hardware Triage & Servicing",
          description: "Live component inspection, disassembly, and servicing",
          timestamp: "Estimated 10:44 AM",
          completed: false,
          status: "pending",
        },
        {
          id: "m5",
          title: "Circularity Passport Verification & Settlement",
          description: "Cryptographic event hash signed to ledger, invoice finalized",
          timestamp: "Estimated 11:30 AM",
          completed: false,
          status: "pending",
        },
      ],
      passportHash,
      trackingUrl: `/track/${orderId}`,
    };

    return NextResponse.json(liveTrackingData);
  } catch (error: any) {
    console.error("ONDC track API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
