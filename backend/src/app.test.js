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

test("returns a consistent response for unknown endpoints", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/missing`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.code, "NOT_FOUND");
    assert.equal(typeof body.requestId, "string");
  });
});
