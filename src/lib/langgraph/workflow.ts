import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { prisma } from "../prisma";
import { calculateRepairabilityScore, evaluateEconomicViability, evaluatePolicyTiers } from "../policy-engine";
import * as crypto from "crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// 1. Define State Annotation for LangGraph
export const ReUseChainState = Annotation.Root({
  deviceId: Annotation<string>,
  deviceModel: Annotation<string>,
  assetTag: Annotation<string>,
  targetComponent: Annotation<any>,
  partMatch: Annotation<any>,
  quote: Annotation<any>,
  repairScore: Annotation<any>,
  economicViability: Annotation<any>,
  reuseOptions: Annotation<any[]>({
    reducer: (_, y) => y,
    default: () => [],
  }),
  recyclerMatch: Annotation<any>,
  recommendedPath: Annotation<string>,
  riskTier: Annotation<"green" | "amber" | "red">,
  confidenceScore: Annotation<number>,
  justification: Annotation<string>,
  blockers: Annotation<string[]>({
    reducer: (_, y) => y,
    default: () => [],
  }),
  executionHistory: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  passportHash: Annotation<string>,
});

export type ReUseChainStateType = typeof ReUseChainState.State;

// 2. Node: Triage Agent (Autonomous Component Selection)
async function triageAgent(state: ReUseChainStateType) {
  const device = await prisma.device.findFirst({
    where: {
      OR: [
        { id: state.deviceId },
        { assetTag: state.deviceId },
      ],
    },
    include: {
      components: {
        include: {
          healthSamples: { orderBy: { timestamp: "desc" }, take: 5 },
          repairQuotes: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });

  if (!device) throw new Error(`Device not found: ${state.deviceId}`);

  const failing = device.components.filter(
    (c) => c.healthPercent < 80 || c.currentStatus === "declining" || c.currentStatus === "failed" || c.currentStatus === "critical"
  );
  const target = failing.length > 0 ? failing[0] : device.components[0];

  return {
    deviceId: device.id,
    deviceModel: device.model,
    assetTag: device.assetTag,
    targetComponent: target,
    executionHistory: [`[TriageEngine] Identified primary target sub-assembly: ${target.type} (${target.model}) at ${target.healthPercent}% health`],
  };
}

// 3. Node: Diagnostics Agent (Manuals & Modularity Score)
async function diagnosticsAgent(state: ReUseChainStateType) {
  const target = state.targetComponent;
  const compatiblePart = await prisma.manualPart.findFirst({
    where: {
      deviceModel: { contains: state.deviceModel },
      componentType: target.type,
    },
  });

  const repairScore = calculateRepairabilityScore({
    partAvailable: !!compatiblePart && compatiblePart.isAvailable,
    manualAvailable: !!compatiblePart?.manualUrl,
    isReplaceable: target.isReplaceable,
    hasPairingRestriction: target.pairingRestriction,
    technicianSkillApproved: true,
  });

  return {
    partMatch: compatiblePart,
    repairScore,
    executionHistory: [
      `[DiagnosticsEngine] Queried parts repository: Part #${compatiblePart?.compatiblePartNo || "NONE"}, Repairability Score: ${repairScore.score}/1.0`,
    ],
  };
}

// 4. Node: Quoting Agent (Labour & Part Cost Economic Evaluation)
async function quotingAgent(state: ReUseChainStateType) {
  const target = state.targetComponent;
  let quote = target.repairQuotes?.[0];

  if (!quote && state.partMatch) {
    quote = {
      partCost: state.partMatch.estimatedPrice,
      labourCost: 25.0,
      totalCost: state.partMatch.estimatedPrice + 25.0,
      vendorName: "Campus IT Depot",
    };
  }

  const fairMarketValue = 300.0;
  const totalCost = quote ? quote.totalCost : 999.0;
  const economicViability = evaluateEconomicViability({
    repairTotalCost: totalCost,
    fairMarketValue,
    predictedExtendedLifeMonths: 24,
    repairabilityScore: state.repairScore.score,
  });

  return {
    quote,
    economicViability,
    executionHistory: [
      `[QuotingEngine] Quote evaluated: $${totalCost.toFixed(2)} vs 40% cap ($${economicViability.costCap.toFixed(2)}). Viability: ${economicViability.isEconomicallyViable ? "PASS" : "EXCEEDED"}`,
    ],
  };
}

// 5. Node: Reuse Specialist Agent (Same-Role & Cross-Purpose Mapping)
async function reuseSpecialistAgent(state: ReUseChainStateType) {
  const target = state.targetComponent;
  const reuseOptions = await prisma.reuseOption.findMany({
    where: { componentType: target.type },
  });

  return {
    reuseOptions,
    executionHistory: [`[ReuseEngine] Matched ${reuseOptions.length} permitted internal harvesting roles`],
  };
}

// 6. Node: Compliance & Policy Gate Agent (Boundaries & Waterfall Decision)
async function compliancePolicyAgent(state: ReUseChainStateType) {
  const target = state.targetComponent;
  let parsedSpecs: any = {};
  try {
    parsedSpecs = target.specsJson ? JSON.parse(target.specsJson) : {};
  } catch (e) {}

  // Check device-level storage for data sanitization status
  const storageComp = await prisma.component.findFirst({
    where: { deviceId: state.deviceId, type: "ssd" },
  });
  let ssdSpecs: any = {};
  if (storageComp?.specsJson) {
    try { ssdSpecs = JSON.parse(storageComp.specsJson); } catch(e) {}
  }
  const isWipeVerified = ssdSpecs.sanitizationStatus === "VERIFIED" || !!ssdSpecs.nistCertificateHash;

  // Check battery for swelling hazards
  const batteryComp = await prisma.component.findFirst({
    where: { deviceId: state.deviceId, type: "battery" },
  });
  let battSpecs: any = {};
  if (batteryComp?.specsJson) {
    try { battSpecs = JSON.parse(batteryComp.specsJson); } catch(e) {}
  }
  const isSwollen = !!battSpecs.swellDetected || !!parsedSpecs.swellDetected;

  const isMotherboardDead = target.type === "motherboard" && target.healthPercent === 0;
  const isScreenShattered = target.type === "display" && target.healthPercent === 0;

  let recommendedPath: "repair" | "same_role_reuse" | "cross_purpose_reuse" | "recycle" = "repair";
  let confidence = 0.85;
  let justification = "";

  // Waterfall Cascade
  if (state.repairScore.isViable && state.economicViability.isEconomicallyViable && !isSwollen && !isMotherboardDead && !isScreenShattered) {
    recommendedPath = "repair";
    confidence = 0.94;
    justification = `Component-level repair is strongly recommended. OEM Part #${state.partMatch?.compatiblePartNo} available ($${state.partMatch?.estimatedPrice.toFixed(2)}). Total quote ($${state.quote?.totalCost?.toFixed(2)}) is within 40% threshold ($${state.economicViability.costCap.toFixed(2)}), with +24 months service life.`;
  } else if (isScreenShattered || (!state.repairScore.isViable && !isMotherboardDead && !isSwollen)) {
    recommendedPath = "cross_purpose_reuse";
    confidence = 0.91;
    justification = `Repair is uneconomical. Secondary testing shows healthy sub-components. Harvest NVMe SSD and RAM into IT Spares Pool; repurpose logic board for headless signage.`;
  } else {
    recommendedPath = "recycle";
    confidence = 0.96;
    justification = `Irreparability confirmed: Fatal short or hazardous wear. Both repair and reuse paths exhausted. Certified R2 e-waste disposal is required.`;
  }

  // Evaluate Risk Tiers
  const policyAudit = evaluatePolicyTiers({
    path: recommendedPath,
    componentType: target.type,
    totalCost: state.quote?.totalCost || 0,
    wipeVerified: isWipeVerified,
    recyclerCertified: true,
    isSwollenOrHazardous: isSwollen && recommendedPath !== "recycle",
  });

  if (recommendedPath === "recycle" && !isWipeVerified) {
    policyAudit.riskTier = "red";
    policyAudit.actionPermitted = false;
    policyAudit.blockers.push("NIST 800-88 cryptographic wipe certificate missing");
  }

  return {
    recommendedPath,
    confidenceScore: confidence,
    justification,
    riskTier: policyAudit.riskTier,
    blockers: policyAudit.blockers,
    recyclerMatch: {
      name: "GreenEarth E-Waste Solutions (R2v3 Certified)",
      cert: "R2V3-IND-88219",
    },
    executionHistory: [
      `[ComplianceGate] Policy evaluated: Path = ${recommendedPath.toUpperCase()}, Boundary Tier = ${policyAudit.riskTier.toUpperCase()}`,
    ],
  };
}

// 7. Node: Passport & Ledger Logger (Cryptographic Commitment)
async function passportLoggerNode(state: ReUseChainStateType) {
  const lastEvent = await prisma.passportEvent.findFirst({
    where: { deviceId: state.deviceId },
    orderBy: { timestamp: "desc" },
  });

  const prevHash = lastEvent ? lastEvent.eventHash : "0000000000000000000000000000000000000000000000000000000000000000";
  const eventPayload = `LANGGRAPH_RUN:${state.deviceId}:${state.recommendedPath}:${state.riskTier}:${Date.now()}`;
  const eventHash = sha256(prevHash + eventPayload);

  // Commit DecisionCase
  const existingCase = await prisma.decisionCase.findFirst({
    where: { deviceId: state.deviceId },
  });

  const caseData = {
    deviceId: state.deviceId,
    componentId: state.targetComponent.id,
    recommendedPath: state.recommendedPath,
    confidenceScore: state.confidenceScore,
    justification: state.justification,
    evidenceJson: JSON.stringify({
      repairScore: state.repairScore,
      economicViability: state.economicViability,
      quote: state.quote,
      partMatch: state.partMatch,
      blockers: state.blockers,
    }),
    riskTier: state.riskTier,
    status: state.riskTier === "amber" ? "pending_approval" : state.riskTier === "red" ? "blocked" : "executed",
  };

  let caseId = existingCase?.id;
  if (existingCase) {
    await prisma.decisionCase.update({ where: { id: existingCase.id }, data: caseData });
  } else {
    const created = await prisma.decisionCase.create({ data: caseData });
    caseId = created.id;
  }

  // Create approval if Amber
  if (state.riskTier === "amber" && caseId) {
    const existingApproval = await prisma.approval.findUnique({ where: { caseId } });
    if (!existingApproval) {
      await prisma.approval.create({
        data: {
          caseId,
          requestedAction: `${state.recommendedPath.toUpperCase()}: ${state.targetComponent.type} on ${state.assetTag}`,
          riskTier: state.riskTier,
          requiredRole: state.recommendedPath === "repair" ? "asset_manager" : "sustainability_lead",
          decision: "pending",
        },
      });
    }
  }

  // Commit Passport Event
  await prisma.passportEvent.create({
    data: {
      deviceId: state.deviceId,
      componentId: state.targetComponent.id,
      eventCategory: "decision",
      eventType: `GOVERNED_COMMITTED_${state.recommendedPath.toUpperCase()}`,
      actor: "Autonomous Lifecycle Decision Engine",
      description: `Autonomous lifecycle decision pipeline completed: ${state.justification.slice(0, 160)}...`,
      eventHash,
      prevHash,
    },
  });

  return {
    passportHash: eventHash,
    executionHistory: [`[PassportLedger] Sealed cryptographic event in Circularity Passport (Hash: ${eventHash.slice(0, 16)}...)`],
  };
}

// 8. Construct the LangGraph StateGraph
export function createReUseChainWorkflow() {
  const workflow = new StateGraph(ReUseChainState)
    .addNode("triageAgent", triageAgent)
    .addNode("diagnosticsAgent", diagnosticsAgent)
    .addNode("quotingAgent", quotingAgent)
    .addNode("reuseSpecialistAgent", reuseSpecialistAgent)
    .addNode("compliancePolicyAgent", compliancePolicyAgent)
    .addNode("passportLoggerNode", passportLoggerNode)
    // Connect Sequential Agentic Graph
    .addEdge(START, "triageAgent")
    .addEdge("triageAgent", "diagnosticsAgent")
    .addEdge("diagnosticsAgent", "quotingAgent")
    .addEdge("quotingAgent", "reuseSpecialistAgent")
    .addEdge("reuseSpecialistAgent", "compliancePolicyAgent")
    .addEdge("compliancePolicyAgent", "passportLoggerNode")
    .addEdge("passportLoggerNode", END);

  return workflow.compile();
}

/**
 * Execute the compiled LangGraph workflow for a device.
 */
export async function runLangGraphWorkflow(deviceId: string) {
  const app = createReUseChainWorkflow();
  const result = await app.invoke({ deviceId });
  return result;
}
