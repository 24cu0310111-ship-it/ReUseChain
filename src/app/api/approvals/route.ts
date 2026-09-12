import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function GET() {
  try {
    const approvals = await prisma.approval.findMany({
      include: {
        decisionCase: {
          include: {
            device: true,
            component: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: approvals });
  } catch (error: any) {
    console.error("Failed to fetch approvals:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { approvalId, decision, approverRole, approverIdentity, comments } = body;

    if (!approvalId || !decision) {
      return NextResponse.json({ success: false, error: "approvalId and decision (approved/rejected) are required" }, { status: 400 });
    }

    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
      include: { decisionCase: { include: { device: true } } },
    });

    if (!approval) {
      return NextResponse.json({ success: false, error: "Approval not found" }, { status: 404 });
    }

    const updatedApproval = await prisma.approval.update({
      where: { id: approvalId },
      data: {
        decision: decision,
        approverIdentity: approverIdentity || `${approverRole || "Operations Lead"}`,
        comments: comments || (decision === "approved" ? "Action authorized under standard circularity policy." : "Action declined."),
        reviewedAt: new Date(),
      },
    });

    // Update the DecisionCase status
    const newCaseStatus = decision === "approved" ? "approved" : "rejected";
    await prisma.decisionCase.update({
      where: { id: approval.caseId },
      data: { status: newCaseStatus },
    });

    // Append to Circularity Passport
    const deviceId = approval.decisionCase.deviceId;
    const lastEvent = await prisma.passportEvent.findFirst({
      where: { deviceId },
      orderBy: { timestamp: "desc" },
    });

    const prevHash = lastEvent ? lastEvent.eventHash : "0000000000000000000000000000000000000000000000000000000000000000";
    const payload = `APPROVAL_${decision.toUpperCase()}:${approval.id}:${approverRole}:${Date.now()}`;
    const eventHash = sha256(prevHash + payload);

    await prisma.passportEvent.create({
      data: {
        deviceId,
        eventCategory: "control",
        eventType: decision === "approved" ? "APPROVAL_GRANTED" : "APPROVAL_REJECTED",
        actor: approverIdentity || `${approverRole || "Asset Manager"}`,
        description: `Human-in-the-Loop decision: ${decision.toUpperCase()}. Requested action: ${approval.requestedAction}. ${comments ? `Note: ${comments}` : ""}`,
        eventHash,
        prevHash,
      },
    });

    // If approved, create mock outcome for feedback learning loop
    if (decision === "approved") {
      const isRepair = approval.requestedAction.includes("REPAIR");
      await prisma.outcome.create({
        data: {
          caseId: approval.caseId,
          actualResult: isRepair ? "successful_repair" : "redeployed_secondary_role",
          actualCost: isRepair ? 73.0 : 0.0,
          usefulLifeExtensionMonths: isRepair ? 24 : 12,
          verifiedBy: approverIdentity || "Technician Lead",
          notes: "Work order executed and confirmed in operational service.",
        },
      });
    }

    return NextResponse.json({ success: true, data: updatedApproval });
  } catch (error: any) {
    console.error("Failed to process approval:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
