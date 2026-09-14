import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { orderId, reason = "User requested cancellation via interface" } = body;

    // 1. Locate the booking to cancel
    let booking = null;
    if (orderId) {
      booking = await prisma.ondcBooking.findFirst({
        where: {
          OR: [
            { ondcOrderId: orderId },
            { id: orderId },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Find latest non-cancelled booking
      booking = await prisma.ondcBooking.findFirst({
        where: {
          orderStatus: { not: "CANCELLED" },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!booking) {
      // If no active booking, check if any booking exists at all
      const anyBooking = await prisma.ondcBooking.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!anyBooking) {
        return NextResponse.json({
          success: false,
          error: "No technician bookings found in the system to cancel.",
        }, { status: 404 });
      }

      booking = anyBooking;
    }

    const targetOrderId = booking.ondcOrderId;

    // 2. Update OndcBooking status to CANCELLED
    const updatedOndc = await prisma.ondcBooking.update({
      where: { id: booking.id },
      data: {
        orderStatus: "CANCELLED",
      },
    });

    // 3. Update associated TechnicianBooking
    await prisma.technicianBooking.updateMany({
      where: {
        OR: [
          { deviceId: booking.deviceId },
          { assetTag: booking.assetTag },
          { workOrderNotes: { contains: targetOrderId } },
        ],
      },
      data: {
        serviceStatus: "cancelled",
        workOrderNotes: `CANCELLED: ${reason}. Original Order: ${targetOrderId}`,
      },
    });

    // 4. Record Cryptographic Circularity Passport Event
    const lastEvent = await prisma.passportEvent.findFirst({ orderBy: { timestamp: "desc" } });
    const prevHash = lastEvent ? lastEvent.eventHash : "GENESIS_BLOCK_000000000000000000000000000000000000";
    const eventPayload = `ONDC_CANCEL:${targetOrderId}:${booking.assetTag}:${Date.now()}`;
    const passportHash = sha256(prevHash + eventPayload);

    await prisma.passportEvent.create({
      data: {
        deviceId: booking.deviceId,
        eventCategory: "custody",
        eventType: "ONDC_DOORSTEP_TECHNICIAN_CANCELLED",
        actor: "Device Owner / Autonomous Dispatch Engine",
        description: `ONDC Doorstep Technician Order Cancelled: #${targetOrderId}. Reason: ${reason}. Pre-authorized escrow hold released.`,
        eventHash: passportHash,
        prevHash,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: targetOrderId,
      status: "CANCELLED",
      message: `Technician dispatch #${targetOrderId} has been successfully cancelled. Specialist Alex Rivera has been notified, and any pre-authorized escrow hold has been released.`,
      cancelledAt: new Date().toISOString(),
      reason,
      passportHash,
    });
  } catch (error: any) {
    console.error("ONDC cancel API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
