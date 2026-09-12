import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let setting = await prisma.autonomySetting.findUnique({
      where: { id: "default" },
    });

    if (!setting) {
      setting = await prisma.autonomySetting.create({
        data: {
          id: "default",
          repairMode: "draft_and_assist",
          repairAutoLimitUSD: 50.0,
          sameRoleReuseMode: "auto_within_policy",
          crossPurposeReuseMode: "draft_and_assist",
          recycleMode: "auto_within_policy",
          requireWipeProof: true,
        },
      });
    }

    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    console.error("Failed to load settings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      repairMode,
      repairAutoLimitUSD,
      sameRoleReuseMode,
      crossPurposeReuseMode,
      recycleMode,
      requireWipeProof,
    } = body;

    const updated = await prisma.autonomySetting.upsert({
      where: { id: "default" },
      update: {
        repairMode: repairMode || undefined,
        repairAutoLimitUSD: repairAutoLimitUSD !== undefined ? parseFloat(repairAutoLimitUSD) : undefined,
        sameRoleReuseMode: sameRoleReuseMode || undefined,
        crossPurposeReuseMode: crossPurposeReuseMode || undefined,
        recycleMode: recycleMode || undefined,
        requireWipeProof: requireWipeProof !== undefined ? Boolean(requireWipeProof) : undefined,
      },
      create: {
        id: "default",
        repairMode: repairMode || "draft_and_assist",
        repairAutoLimitUSD: repairAutoLimitUSD ? parseFloat(repairAutoLimitUSD) : 50.0,
        sameRoleReuseMode: sameRoleReuseMode || "auto_within_policy",
        crossPurposeReuseMode: crossPurposeReuseMode || "draft_and_assist",
        recycleMode: recycleMode || "auto_within_policy",
        requireWipeProof: requireWipeProof !== undefined ? Boolean(requireWipeProof) : true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
