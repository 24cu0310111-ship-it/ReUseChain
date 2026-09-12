export interface HealthPoint {
  timestamp: string;
  value: number;
}

export interface TrendAnalysisResult {
  currentValue: number;
  rollingMedian: number;
  exponentialMovingAverage: number;
  degradationSlopePerDay: number;
  cohortBaselineSlopePerDay: number;
  velocityRatio: number; // Device slope / Cohort slope
  isAnomaly: boolean;
  alertReason: string | null;
  severity: "normal" | "warning" | "critical";
}

/**
 * Calculates statistical metrics, rolling moving average, and degradation velocity.
 */
export function analyzeComponentTrend(
  samples: { timestamp: Date | string; metricValue: number }[],
  cohortBaselineSlope: number = -0.08 // typical cohort degradation: ~0.08 Wh or % per day
): TrendAnalysisResult {
  if (!samples || samples.length === 0) {
    return {
      currentValue: 100,
      rollingMedian: 100,
      exponentialMovingAverage: 100,
      degradationSlopePerDay: 0,
      cohortBaselineSlopePerDay: cohortBaselineSlope,
      velocityRatio: 1.0,
      isAnomaly: false,
      alertReason: null,
      severity: "normal",
    };
  }

  // Sort ascending by time
  const sorted = [...samples].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const values = sorted.map((s) => s.metricValue);
  const currentValue = values[values.length - 1];

  // Rolling Median
  const mid = Math.floor(values.length / 2);
  const sortedValues = [...values].sort((a, b) => a - b);
  const rollingMedian = values.length % 2 !== 0 ? sortedValues[mid] : (sortedValues[mid - 1] + sortedValues[mid]) / 2;

  // Exponential Moving Average (EMA) with smoothing factor alpha = 0.25
  const alpha = 0.25;
  let ema = values[0];
  for (let i = 1; i < values.length; i++) {
    ema = alpha * values[i] + (1 - alpha) * ema;
  }

  // Linear Regression Slope (dC/dt)
  const n = values.length;
  let slopePerDay = 0;
  if (n > 1) {
    const startTime = new Date(sorted[0].timestamp).getTime();
    const xDays = sorted.map((s) => (new Date(s.timestamp).getTime() - startTime) / (1000 * 3600 * 24));
    const meanX = xDays.reduce((a, b) => a + b, 0) / n;
    const meanY = values.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (xDays[i] - meanX) * (values[i] - meanY);
      denominator += (xDays[i] - meanX) * (xDays[i] - meanX);
    }
    slopePerDay = denominator !== 0 ? numerator / denominator : 0;
  }

  // Velocity ratio: compare decline rate with baseline cohort
  const absSlope = Math.abs(slopePerDay);
  const absBaseline = Math.abs(cohortBaselineSlope);
  const velocityRatio = absBaseline > 0 ? absSlope / absBaseline : 1.0;

  // Detect anomalous wear velocity
  let isAnomaly = false;
  let alertReason: string | null = null;
  let severity: "normal" | "warning" | "critical" = "normal";

  if (velocityRatio >= 2.5 && slopePerDay < 0) {
    isAnomaly = true;
    severity = velocityRatio >= 3.5 ? "critical" : "warning";
    alertReason = `Accelerated Wear Anomaly: Component degradation slope (${absSlope.toFixed(2)} units/day) is ${velocityRatio.toFixed(1)}x faster than the model-family cohort baseline (${absBaseline.toFixed(2)} units/day).`;
  } else if (currentValue < 55) {
    isAnomaly = true;
    severity = "critical";
    alertReason = `Threshold Crossed: Health value (${currentValue.toFixed(1)}%) is below institutional critical cut-off (55%).`;
  }

  return {
    currentValue: parseFloat(currentValue.toFixed(2)),
    rollingMedian: parseFloat(rollingMedian.toFixed(2)),
    exponentialMovingAverage: parseFloat(ema.toFixed(2)),
    degradationSlopePerDay: parseFloat(slopePerDay.toFixed(3)),
    cohortBaselineSlopePerDay: cohortBaselineSlope,
    velocityRatio: parseFloat(velocityRatio.toFixed(2)),
    isAnomaly,
    alertReason,
    severity,
  };
}
