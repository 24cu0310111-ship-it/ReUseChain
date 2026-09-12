import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordLearnedResolution } from "@/lib/self-learning-agent";

export async function GET() {
  try {
    const escalations = await prisma.adminEscalation.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: escalations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { escalationId, adminResponse, learnedRule, resolvedBy } = body;

    if (!escalationId || !adminResponse) {
      return NextResponse.json(
        { success: false, error: "escalationId and adminResponse are required" },
        { status: 400 }
      );
    }

    const result = await recordLearnedResolution({
      escalationId,
      adminResponse,
      learnedRule,
      resolvedBy: resolvedBy || "Lead Systems Administrator (via Escalations Hub)",
    });

    const updated = await prisma.adminEscalation.findUnique({ where: { id: escalationId } });

    return NextResponse.json({
      success: true,
      data: updated,
      passportHash: result.passportHash,
      message: "Escalation resolved! Knowledge model calibrated and sealed in Circularity Passport.",
    });
  } catch (error: any) {
    console.error("Escalation resolution error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
