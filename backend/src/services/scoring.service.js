import { percentage, round } from "../utils/calculations.js";

export function calculateRiskScore({ assets, normalTransactions, protocolCounts }) {
  const totalValue = assets.reduce((sum, asset) => sum + asset.usdValue, 0);
  const largestValue = assets[0]?.usdValue || 0;
  const concentration = percentage(largestValue, totalValue);
  const failedCount = normalTransactions.filter((transaction) => transaction.isError === "1").length;
  const failureRate = percentage(failedCount, normalTransactions.length);
  const protocolDiversity = Object.values(protocolCounts).filter((count) => count > 0).length;

  let score = 100;
  score -= concentration * 0.45;
  score -= failureRate * 0.35;
  score += Math.min(protocolDiversity * 3, 12);

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    level: score >= 75 ? "Low" : score >= 50 ? "Moderate" : "High",
    factors: {
      holdingConcentration: round(concentration, 2),
      failedTransactionRate: round(failureRate, 2),
      protocolDiversity,
    },
  };
}
