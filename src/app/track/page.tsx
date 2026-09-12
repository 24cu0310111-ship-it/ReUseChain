import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TrackIndexPage() {
  // Find most recent ONDC order to track
  const latestOrder = await prisma.ondcBooking.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const orderId = latestOrder?.ondcOrderId || "ONDC-SRV-2026-896751";
  redirect(`/track/${encodeURIComponent(orderId)}`);
}
