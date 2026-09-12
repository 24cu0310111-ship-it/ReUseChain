import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordLearnedResolution } from "@/lib/self-learning-agent";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId") || searchParams.get("id");

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: "ticketId parameter is required" },
        { status: 400 }
      );
    }

    const escalation = await prisma.adminEscalation.findUnique({
      where: { id: ticketId },
    });

    if (!escalation) {
      return NextResponse.json(
        { success: false, error: `Escalation #${ticketId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: escalation.id,
        status: escalation.status,
        adminResponse: escalation.adminResponse,
        learnedRule: escalation.learnedRule,
        resolvedBy: escalation.resolvedBy,
        urgency: escalation.urgency,
        updatedAt: escalation.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Failed to query escalation status:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Quick simulate endpoint for testing Telegram Admin replies
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, escalationId, adminResponse, learnedRule, resolvedBy } = body;
    const targetId = ticketId || escalationId;

    if (!targetId || !adminResponse) {
      return NextResponse.json(
        { success: false, error: "ticketId and adminResponse are required" },
        { status: 400 }
      );
    }

    const result = await recordLearnedResolution({
      escalationId: targetId,
      adminResponse,
      learnedRule: learnedRule || "Verified resolution recorded to self-learning memory.",
      resolvedBy: resolvedBy || "Lead Systems Administrator (via Telegram Bot)",
    });

    return NextResponse.json({
      success: true,
      message: "Admin resolution recorded! Delivered to live user chat and model calibrated.",
      data: result.learnedItem,
      passportHash: result.passportHash,
    });
  } catch (error: any) {
    console.error("Failed to resolve escalation via status route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
