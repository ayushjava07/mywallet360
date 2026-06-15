function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function list(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV || "development";

export const config = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: positiveInteger(process.env.PORT, 5000),
  frontendOrigins: list(process.env.FRONTEND_URL),
  jsonLimit: process.env.JSON_LIMIT || "16kb",
  requestTimeoutMs: positiveInteger(process.env.REQUEST_TIMEOUT_MS, 30_000),
  shutdownTimeoutMs: positiveInteger(process.env.SHUTDOWN_TIMEOUT_MS, 10_000),
});

export function validateProductionConfig() {
  if (!config.isProduction) return;

  const missing = [];

  if (!process.env.BLOCKACTION_API_URL) missing.push("BLOCKACTION_API_URL");
  if (!process.env.ETHEREUM_RPC_URL) missing.push("ETHEREUM_RPC_URL");
  if (!config.frontendOrigins.length) missing.push("FRONTEND_URL");

  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }
}
