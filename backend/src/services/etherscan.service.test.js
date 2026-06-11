import assert from "node:assert/strict";
import test from "node:test";
import { buildPublicWalletData } from "./etherscan.service.js";

test("wallet API response excludes large internal collections", () => {
  const response = buildPublicWalletData({
    netWorth: 12,
    assetCount: 2,
    nftCount: 3,
    transactionCount: 5,
    transactionCountIsLowerBound: false,
    largestHolding: null,
    moneyFlow: {},
    personality: {},
    personalityFactors: {},
    timeline: [],
    valuation: { totalAssetCount: 2 },
    mostUsedProtocol: { name: "Other", interactionCount: 1, counts: { Other: 1 } },
    riskScore: {},
    period: { days: 30 },
    analysisWindow: {},
  });

  assert.equal(response.assetCount, 2);
  assert.equal(response.mostUsedProtocol.name, "Other");
  assert.equal(typeof response.generatedAt, "string");
  assert.equal("assets" in response, false);
  assert.equal("nfts" in response, false);
  assert.equal("topAssets" in response, false);
  assert.equal("topNfts" in response, false);
  assert.equal("counts" in response.mostUsedProtocol, false);
});
