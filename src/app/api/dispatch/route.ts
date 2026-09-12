import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionType, assetTag, deviceId, serviceType, notes } = body;

    // Resolve device if needed
    const dev = await prisma.device.findFirst({
      where: { OR: [{ id: deviceId || "" }, { assetTag: assetTag || "" }] },
    });

    const targetId = dev?.id || "GENERIC_ASSET";
    const targetTag = dev?.assetTag || assetTag || "ASSET-UNKNOWN";

    const lastEvent = await prisma.passportEvent.findFirst({ orderBy: { timestamp: "desc" } });
    const prevHash = lastEvent ? lastEvent.eventHash : "GENESIS_BLOCK_000000000000000000000000000000000000";

    if (actionType === "book_technician") {
      const booking = await prisma.technicianBooking.create({
        data: {
          deviceId: targetId,
          assetTag: targetTag,
          serviceType: serviceType || "Hardware Preventative Servicing",
          technicianName: "Alex Rivera (Dell/HP Certified)",
          vendorName: "Campus IT Hardware Depot",
          estimatedCost: 73.0,
          scheduledDate: new Date(Date.now() + 86400000 * 2), // 2 days ahead
          serviceStatus: "dispatched",
          workOrderNotes: notes || "Dispatched via Autonomous Execution Agent.",
        },
      });

      const eventHash = sha256(`TECH_DISPATCH:${booking.id}:${Date.now()}`);
      await prisma.passportEvent.create({
        data: {
          deviceId: dev?.id,
          eventCategory: "custody",
          eventType: "TECHNICIAN_DISPATCHED",
          actor: "Autonomous Execution Agent",
          description: `Work order dispatched: ${booking.serviceType} assigned to ${booking.technicianName}. Estimated: $${booking.estimatedCost.toFixed(2)}.`,
          eventHash,
          prevHash,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Work Order Created: Technician ${booking.technicianName} scheduled for ${new Date(booking.scheduledDate).toLocaleDateString()}.`,
        data: booking,
      });
    }

    if (actionType === "harvest_spares") {
      if (dev) {
        await prisma.device.update({
          where: { id: dev.id },
          data: { lifecycleStatus: "harvested", currentRole: "Harvested to Spares Pool" },
        });
      }

      const eventHash = sha256(`HARVEST_SPARES:${targetId}:${Date.now()}`);
      await prisma.passportEvent.create({
        data: {
          deviceId: dev?.id,
          eventCategory: "custody",
          eventType: "SUB_ASSEMBLIES_HARVESTED",
          actor: "Autonomous Execution Agent",
          description: `Harvested healthy secondary modules (NVMe SSD, RAM) into campus IT spares pool for active fleet maintenance.`,
          eventHash,
          prevHash,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Sub-assemblies successfully harvested and logged into IT Spares Catalog.`,
      });
    }

    if (actionType === "schedule_recycler") {
      const scrap = await prisma.scrapValuation.create({
        data: {
          deviceId: targetId,
          assetTag: targetTag,
          estimatedValueUSD: 18.50,
          preciousMetalsG: 0.28,
          copperG: 45.0,
          recyclerPartner: "GreenEarth E-Waste Solutions (R2v3 Certified)",
          pickupStatus: "scheduled",
        },
      });

      const eventHash = sha256(`RECYCLER_SCHEDULED:${scrap.id}:${Date.now()}`);
      await prisma.passportEvent.create({
        data: {
          deviceId: dev?.id,
          eventCategory: "custody",
          eventType: "CERTIFIED_RECYCLING_SCHEDULED",
          actor: "Autonomous Execution Agent",
          description: `Scheduled certified R2v3 recycler pickup. Material valuation: $${scrap.estimatedValueUSD.toFixed(2)} (Cu & Precious Metals).`,
          eventHash,
          prevHash,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Recycling pickup scheduled with ${scrap.recyclerPartner}. Material recovery value estimated at $${scrap.estimatedValueUSD.toFixed(2)}.`,
        data: scrap,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid actionType" }, { status: 400 });
  } catch (error: any) {
    console.error("Dispatch execution error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
