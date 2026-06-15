import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveProtocol,
  resolveProtocolSync,
  shortenAddress,
  clearProtocolCache,
  blockActionRequestWrapper,
} from "./protocol-resolution.service.js";
import { analyzeProtocols } from "./blockaction.service.js";

test("shortenAddress utility", () => {
  assert.equal(shortenAddress("0x7a250d5630b4cf539739df2c5dacab4c659f2488d"), "0x7a25...488d");
  assert.equal(shortenAddress("0xabc"), "0xabc");
  assert.equal(shortenAddress(null), null);
});

test("resolveProtocol Priority 1: Internal database mapping", async () => {
  clearProtocolCache();
  // Uniswap router address
  const result = await resolveProtocol("0x7a250d5630b4cf539739df2c5dacab4c659f2488d");
  assert.deepEqual(result, { name: "Uniswap", type: "protocol" });
});

test("resolveProtocolSync behavior", () => {
  clearProtocolCache();
  // Internal mapping
  const result1 = resolveProtocolSync("0x7a250d5630b4cf539739df2c5dacab4c659f2488d");
  assert.deepEqual(result1, { name: "Uniswap", type: "protocol" });

  // Fallback (caches so it is returned from cache on subsequent lookups)
  const result2 = resolveProtocolSync("0x8888888888888888888888888888888888888888");
  assert.deepEqual(result2, { name: "0x8888...8888", type: "contract" });

  // Verify caching worked
  const result3 = resolveProtocolSync("0x8888888888888888888888888888888888888888");
  assert.deepEqual(result3, { name: "0x8888...8888", type: "contract" });
});

test("resolveProtocol Priority 2: Verified contract name from metadata", async () => {
  clearProtocolCache();
  const originalRequest = blockActionRequestWrapper.request;
  blockActionRequestWrapper.request = async (params) => {
    if (params.module === "contract" && params.action === "getsourcecode") {
      return [{ ContractName: "VerifiedContractMetadataName" }];
    }
    throw new Error("Invalid mock call");
  };

  try {
    const result = await resolveProtocol("0x3333333333333333333333333333333333333333");
    assert.deepEqual(result, { name: "VerifiedContractMetadataName", type: "protocol" });
  } finally {
    blockActionRequestWrapper.request = originalRequest;
  }
});

test("resolveProtocol normalization", async () => {
  clearProtocolCache();
  const originalRequest = blockActionRequestWrapper.request;
  blockActionRequestWrapper.request = async (params) => {
    if (params.module === "contract" && params.action === "getsourcecode") {
      return [{ ContractName: "UniversalRouter" }];
    }
    return null;
  };

  try {
    const result = await resolveProtocol("0x5555555555555555555555555555555555555555");
    assert.deepEqual(result, { name: "Uniswap", type: "protocol" });
  } finally {
    blockActionRequestWrapper.request = originalRequest;
  }
});

test("resolveProtocol Priority 3: Fallback to shortened address", async () => {
  clearProtocolCache();
  const originalRequest = blockActionRequestWrapper.request;
  blockActionRequestWrapper.request = async () => {
    return null;
  };

  try {
    const result = await resolveProtocol("0x4444444444444444444444444444444444444444");
    assert.deepEqual(result, { name: "0x4444...4444", type: "contract" });
  } finally {
    blockActionRequestWrapper.request = originalRequest;
  }
});

test("resolveProtocol: Null/undefined contractAddress returns Other", async () => {
  const result = await resolveProtocol(null);
  assert.deepEqual(result, { name: "Other", type: "protocol" });
});

test("analyzeProtocols: Aggregates interactions by protocol correctly", async () => {
  clearProtocolCache();
  const originalRequest = blockActionRequestWrapper.request;
  blockActionRequestWrapper.request = async (params) => {
    if (params.module === "contract" && params.action === "getsourcecode" && params.address === "0x5555555555555555555555555555555555555555") {
      return [{ ContractName: "MockProtocolA" }];
    }
    return null;
  };

  const mockTransactions = [
    // Contract interaction resolving to MockProtocolA
    { to: "0x5555555555555555555555555555555555555555", isError: "0", input: "0x12345678" },
    { to: "0x5555555555555555555555555555555555555555", isError: "0", input: "0xabcdef" },
    // Contract interaction falling back to shortened address
    { to: "0x6666666666666666666666666666666666666666", isError: "0", input: "0x12aa33" },
    // Non-contract transaction (input 0x)
    { to: "0x5555555555555555555555555555555555555555", isError: "0", input: "0x" },
    // Failed transaction (isError 1)
    { to: "0x5555555555555555555555555555555555555555", isError: "1", input: "0x12aa" },
  ];

  try {
    const analysis = await analyzeProtocols(mockTransactions);

    assert.equal(analysis.name, "MockProtocolA");
    assert.equal(analysis.count, 2);
    assert.equal(analysis.type, "protocol");
    assert.equal(analysis.recognizedCount, 2);
    assert.equal(analysis.unrecognizedCount, 1);
    assert.equal(analysis.counts.MockProtocolA, 2);
    assert.equal(analysis.counts["0x6666...6666"], 1);
  } finally {
    blockActionRequestWrapper.request = originalRequest;
  }
});
