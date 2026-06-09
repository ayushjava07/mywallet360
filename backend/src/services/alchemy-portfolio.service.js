import axios from "axios";
import { round } from "../utils/calculations.js";

const NETWORKS = (process.env.ALCHEMY_PORTFOLIO_NETWORKS || "eth-mainnet")
  .split(",")
  .map((network) => network.trim())
  .filter(Boolean);
const configuredMaxPages = Number.parseInt(process.env.ALCHEMY_PORTFOLIO_MAX_PAGES || "25", 10);
const MAX_PAGES = Number.isInteger(configuredMaxPages) && configuredMaxPages > 0 ? configuredMaxPages : 25;
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

function getApiKey() {
  if (process.env.ALCHEMY_API_KEY) return process.env.ALCHEMY_API_KEY;

  if (process.env.ETHEREUM_RPC_URL) {
    try {
      const rpcUrl = new URL(process.env.ETHEREUM_RPC_URL);
      if (!rpcUrl.hostname.endsWith("alchemy.com")) return null;
      return rpcUrl.pathname.split("/").filter(Boolean).pop();
    } catch {
      return null;
    }
  }

  return null;
}

function formatBalance(rawBalance, decimals) {
  const raw = BigInt(rawBalance || "0");
  const precision = BigInt(Math.max(0, Number(decimals ?? 18)));
  const divisor = 10n ** precision;
  const whole = raw / divisor;
  const fraction = raw % divisor;
  const fractionText = fraction.toString().padStart(Number(precision), "0").slice(0, 12);

  return Number(`${whole}.${fractionText || "0"}`);
}

function usdPrice(token) {
  const price = token.tokenPrices?.find((item) => item.currency?.toLowerCase() === "usd");
  const value = Number(price?.value);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function mapToken(token) {
  const isNative = !token.tokenAddress;
  const balance = formatBalance(token.tokenBalance, isNative ? 18 : token.tokenMetadata?.decimals);
  const price = usdPrice(token);

  return {
    contractAddress: token.tokenAddress?.toLowerCase() || null,
    network: token.network,
    symbol: token.tokenMetadata?.symbol || (isNative && token.network === "eth-mainnet" ? "ETH" : "NATIVE"),
    name: token.tokenMetadata?.name || (isNative ? "Native Token" : "Unknown Token"),
    balance: round(balance, 8),
    usdPrice: round(price, 8),
    usdValue: round(balance * price, 2),
    priceAvailable: price > 0,
  };
}

export async function getAlchemyPortfolio(address) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const cacheKey = `${address.toLowerCase()}:${NETWORKS.join(",")}`;
  const cached = cache.get(cacheKey);
  if (cached?.expiresAt > Date.now()) return cached.value;

  const tokens = [];
  let pageKey;
  let complete = false;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await axios.post(
      `https://api.g.alchemy.com/data/v1/${apiKey}/assets/tokens/by-address`,
      {
        addresses: [{ address, networks: NETWORKS }],
        withMetadata: true,
        withPrices: true,
        includeNativeTokens: true,
        includeErc20Tokens: true,
        ...(pageKey ? { pageKey } : {}),
      },
      { timeout: 20_000 },
    );
    const data = response.data?.data || {};

    tokens.push(...(data.tokens || []));
    pageKey = data.pageKey;
    if (!pageKey) {
      complete = true;
      break;
    }
  }

  const assets = tokens
    .map(mapToken)
    .filter((asset) => asset.balance > 0)
    .sort((first, second) => second.usdValue - first.usdValue);
  const pricedAssets = assets.filter((asset) => asset.priceAvailable && asset.usdValue > 0);
  const result = {
    source: "alchemy",
    networks: NETWORKS,
    assets,
    pricedAssets,
    netWorth: round(pricedAssets.reduce((sum, asset) => sum + asset.usdValue, 0), 2),
    complete,
  };

  cache.set(cacheKey, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}
