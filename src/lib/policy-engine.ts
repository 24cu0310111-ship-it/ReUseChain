export interface RepairabilityInputs {
  partAvailable: boolean;
  manualAvailable: boolean;
  isReplaceable: boolean;
  hasPairingRestriction: boolean;
  technicianSkillApproved: boolean;
}

export interface RepairabilityResult {
  score: number;
  breakdown: {
    partAvailabilityScore: number;
    manualAvailabilityScore: number;
    modularityScore: number;
    pairingScore: number;
    technicianSkillScore: number;
  };
  isViable: boolean;
}

export interface EconomicViabilityInputs {
  repairTotalCost: number;
  fairMarketValue: number;
  predictedExtendedLifeMonths: number;
  repairabilityScore: number;
  maxCostRatio?: number; // default 0.40 (40%)
  minLifeMonths?: number; // default 18
  minScore?: number; // default 0.65
}

export interface PolicyEvaluationParams {
  path: "repair" | "same_role_reuse" | "cross_purpose_reuse" | "recycle";
  componentType?: string;
  totalCost?: number;
  autoSpendingLimit?: number; // default $50
  wipeVerified?: boolean;
  recyclerCertified?: boolean;
  isSwollenOrHazardous?: boolean;
  isHardwareShortCircuit?: boolean;
}

export interface PolicyEvaluationResult {
  riskTier: "green" | "amber" | "red";
  actionPermitted: boolean;
  requiresHumanApproval: boolean;
  reason: string;
  blockers: string[];
  recommendationSummary: string;
}

/**
 * Calculates deterministic repairability score based on empirical evidence.
 */
export function calculateRepairabilityScore(inputs: RepairabilityInputs): RepairabilityResult {
  const pScore = inputs.partAvailable ? 0.25 : 0.0;
  const mScore = inputs.manualAvailable ? 0.2 : 0.0;
  const cScore = inputs.isReplaceable ? 0.25 : 0.0;
  const pairScore = !inputs.hasPairingRestriction ? 0.2 : 0.0;
  const tScore = inputs.technicianSkillApproved ? 0.1 : 0.05;

  const totalScore = parseFloat((pScore + mScore + cScore + pairScore + tScore).toFixed(2));

  return {
    score: totalScore,
    breakdown: {
      partAvailabilityScore: pScore,
      manualAvailabilityScore: mScore,
      modularityScore: cScore,
      pairingScore: pairScore,
      technicianSkillScore: tScore,
    },
    isViable: totalScore >= 0.65,
  };
}

/**
 * Validates whether proposed repair passes institutional economic thresholds.
 */
export function evaluateEconomicViability(inputs: EconomicViabilityInputs): {
  isEconomicallyViable: boolean;
  costRatio: number;
  costCap: number;
  reason: string;
} {
  const maxRatio = inputs.maxCostRatio ?? 0.4;
  const minLife = inputs.minLifeMonths ?? 18;
  const minScore = inputs.minScore ?? 0.65;

  const costRatio = inputs.fairMarketValue > 0 ? inputs.repairTotalCost / inputs.fairMarketValue : 1.0;
  const costCap = inputs.fairMarketValue * maxRatio;

  const passesCost = inputs.repairTotalCost <= costCap;
  const passesLife = inputs.predictedExtendedLifeMonths >= minLife;
  const passesScore = inputs.repairabilityScore >= minScore;

  const isViable = passesCost && passesLife && passesScore;

  let reason = "";
  if (!passesCost) {
    reason = `Repair cost ($${inputs.repairTotalCost.toFixed(2)}) exceeds ${(maxRatio * 100).toFixed(0)}% replacement threshold ($${costCap.toFixed(2)}).`;
  } else if (!passesLife) {
    reason = `Predicted life extension (${inputs.predictedExtendedLifeMonths} mos) is below minimum institutional target (${minLife} mos).`;
  } else if (!passesScore) {
    reason = `Repairability score (${inputs.repairabilityScore.toFixed(2)}) is below acceptable threshold (${minScore.toFixed(2)}).`;
  } else {
    reason = `Economically viable: Repair cost ($${inputs.repairTotalCost.toFixed(2)}) is ${(costRatio * 100).toFixed(1)}% of value ($${inputs.fairMarketValue.toFixed(2)}) with +${inputs.predictedExtendedLifeMonths} months projected life.`;
  }

  return {
    isEconomicallyViable: isViable,
    costRatio: parseFloat(costRatio.toFixed(3)),
    costCap: parseFloat(costCap.toFixed(2)),
    reason,
  };
}

/**
 * Enforces Green, Amber, and Red governance boundaries.
 */
export function evaluatePolicyTiers(params: PolicyEvaluationParams): PolicyEvaluationResult {
  const blockers: string[] = [];
  const spendingLimit = params.autoSpendingLimit ?? 50.0;

  // 1. HARD RED BOUNDARY CHECKS (Safety & Legal Non-Negotiables)
  if (params.isSwollenOrHazardous) {
    blockers.push("Hazardous component detected (swollen battery or electrical defect). Immediate quarantine required.");
    return {
      riskTier: "red",
      actionPermitted: false,
      requiresHumanApproval: true,
      reason: "Blocked by Hard Red Boundary: Hazardous materials cannot be repurposed or released without specialist sign-off.",
      blockers,
      recommendationSummary: "QUARANTINED: Hazardous component flagged for chemical/fire safety isolation.",
    };
  }

  if (params.path === "recycle") {
    if (!params.wipeVerified) {
      blockers.push("NIST 800-88 cryptographic data sanitization certificate is missing or unverified.");
    }
    if (!params.recyclerCertified) {
      blockers.push("Target recycler lacks verified R2v3 / e-Stewards certification credentials.");
    }

    if (blockers.length > 0) {
      return {
        riskTier: "red",
        actionPermitted: false,
        requiresHumanApproval: true,
        reason: "Blocked by Hard Red Boundary: Recycling is prohibited without verifiable data sanitization proof and certified recycler audit.",
        blockers,
        recommendationSummary: "BLOCKED IN RED TIER: Retain in secure physical quarantine until cryptographic wipe is confirmed.",
      };
    }
  }

  // 2. AMBER TIER (Requires Human Approval)
  if (params.path === "repair") {
    const cost = params.totalCost ?? 0;
    if (cost > spendingLimit) {
      return {
        riskTier: "amber",
        actionPermitted: true,
        requiresHumanApproval: true,
        reason: `Repair commitment ($${cost.toFixed(2)}) exceeds auto-execution spending threshold ($${spendingLimit.toFixed(2)}). Asset Manager authorization required.`,
        blockers: [],
        recommendationSummary: `Proposed Precision Repair ($${cost.toFixed(2)}) routed to Approval Queue.`,
      };
    }
    return {
      riskTier: "green",
      actionPermitted: true,
      requiresHumanApproval: false,
      reason: `Repair cost ($${cost.toFixed(2)}) is within automatic policy limits. Auto-executable.`,
      blockers: [],
      recommendationSummary: "Approved for immediate automated work order dispatch.",
    };
  }

  if (params.path === "cross_purpose_reuse" || params.path === "same_role_reuse") {
    return {
      riskTier: "amber",
      actionPermitted: true,
      requiresHumanApproval: true,
      reason: "Asset role reassignment / secondary harvesting requires verification of inventory reallocation.",
      blockers: [],
      recommendationSummary: "Secondary reuse proposal routed to Hardware Lead approval queue.",
    };
  }

  if (params.path === "recycle") {
    return {
      riskTier: "amber",
      actionPermitted: true,
      requiresHumanApproval: true,
      reason: "Recycling verified as absolute last resort. Requires final asset write-off sign-off from IT Sustainability Controller.",
      blockers: [],
      recommendationSummary: "Verified e-waste disposal package prepared for final authorization.",
    };
  }

  return {
    riskTier: "green",
    actionPermitted: true,
    requiresHumanApproval: false,
    reason: "Standard operational query.",
    blockers: [],
    recommendationSummary: "Auto-executed and recorded in Circularity Passport.",
  };
}
