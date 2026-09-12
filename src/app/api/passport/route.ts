import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");

    const where = deviceId ? { deviceId } : {};

    const events = await prisma.passportEvent.findMany({
      where,
      include: {
        device: true,
        component: true,
      },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    console.error("Failed to query passport events:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
