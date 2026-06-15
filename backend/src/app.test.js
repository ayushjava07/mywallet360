import "dotenv/config";
import assert from "node:assert/strict";
import test from "node:test";
import app from "./app.js";

async function withServer(run) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));

  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("health endpoint reports readiness without caching", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(body.status, "ok");
    assert.equal(typeof body.uptimeSeconds, "number");
  });
});

test("rejects invalid wallet addresses before calling upstream services", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/wallet/not-an-address`);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.code, "INVALID_WALLET_ADDRESS");
    assert.equal(typeof body.requestId, "string");
  });
});

test("rejects unsupported analysis periods before calling upstream services", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/wallet/0x742d35Cc6634C0532925a3b844Bc454e4438f44e?days=20`);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.code, "INVALID_ANALYSIS_PERIOD");
  });
});

test("accepts YTD as the default analysis period before calling upstream services", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/wallet/0x742d35Cc6634C0532925a3b844Bc454e4438f44e`);
    const body = await response.json();

    assert.notEqual(response.status, 400);
    assert.notEqual(body.code, "INVALID_ANALYSIS_PERIOD");
  });
});

test("rejects invalid transaction report dates before calling upstream services", async () => {
  await withServer(async (baseUrl) => {
    const address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const response = await fetch(`${baseUrl}/api/report/${address}?from=2026-06-11&to=2026-06-01`);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.code, "INVALID_REPORT_DATES");
  });
});

test("limits transaction reports to one year", async () => {
  await withServer(async (baseUrl) => {
    const address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const response = await fetch(`${baseUrl}/api/report/${address}?from=2024-01-01&to=2026-01-01`);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.code, "REPORT_RANGE_TOO_LARGE");
  });
});

test("rejects future transaction report dates", async () => {
  await withServer(async (baseUrl) => {
    const address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const future = new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10);
    const response = await fetch(`${baseUrl}/api/report/${address}?from=2026-01-01&to=${future}`);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.code, "FUTURE_REPORT_DATE");
  });
});

test("returns a consistent response for unknown endpoints", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/missing`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.code, "NOT_FOUND");
    assert.equal(typeof body.requestId, "string");
  });
});
