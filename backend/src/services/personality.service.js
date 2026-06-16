import { normalizePercentages } from "../utils/calculations.js";

const SWAP_SELECTORS = new Set([
  "0x38ed1739",
  "0x7ff36ab5",
  "0x18cbafe5",
  "0x8803dbee",
  "0x414bf389",
  "0x5c11d795",
  "0x12aa3caf",
]);

export function isSwapTransaction(transaction) {
  return SWAP_SELECTORS.has(String(transaction.input || "").slice(0, 10).toLowerCase());
}

export function calculatePersonalityDetails({
  normalTransactions,
  tokenTransfers,
  nftTransfers,
  protocolCounts,
  currentAssetCount,
}) {
  const successfulTransactions = normalTransactions.filter((transaction) => transaction.isError === "0");
  const swapCount = successfulTransactions.filter(isSwapTransaction).length;
  const defiInteractions =
    (protocolCounts.Aave || 0) +
    (protocolCounts.Compound || 0) +
    (protocolCounts["1inch"] || 0) +
    (protocolCounts.Uniswap || 0);
  const incomingTransfers = tokenTransfers.filter((transfer) => transfer.direction === "receive").length;
  const outgoingTransfers = tokenTransfers.filter((transfer) => transfer.direction === "send").length;
  const scores = {
    nftCollector: nftTransfers.length * 2,
    trader: swapCount * 3 + outgoingTransfers,
    defiExplorer: defiInteractions * 3,
    holder: Math.max(0, incomingTransfers - outgoingTransfers) + currentAssetCount,
  };

  return {
    percentages: normalizePercentages(scores),
    factors: {
      nftTransfers: nftTransfers.length,
      swapCount,
      outgoingTransfers,
      defiInteractions,
      incomingTransfers,
      currentAssetCount,
    },
    rawScores: scores,
  };
}

export function calculatePersonality(input) {
  return calculatePersonalityDetails(input).percentages;
}
