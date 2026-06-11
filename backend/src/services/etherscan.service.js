import axios from "axios";
import { calculatePersonalityDetails, isSwapTransaction } from "./personality.service.js";
import { calculateRiskScore } from "./scoring.service.js";
import {
  fromWei,
  normalizePercentages,
  percentage,
  round,
  tokenAmount,
} from "../utils/calculations.js";

const ETHERSCAN_URL = "https://api.etherscan.io/v2/api";
const CHAIN_ID = process.env.ETHERSCAN_CHAIN_ID || "1";
const PAGE_SIZE = 1000;
const MAX_PAGES = 5;
const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_INTERVAL_MS = 350;
const DEFAULT_ANALYSIS_DAYS = 30;
const USD_PEGGED_TOKEN_ADDRESSES = new Set([
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
  "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
  "0xdc035d45d973e3ec169d2276ddab16f1e407384f", // USDS
  "0x0000000000085d4780b73119b644ae5ecd22b376", // TUSD
  "0x8e870d67f660d95d5be530380d0ec0bd388289e1", // USDP
  "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd", // GUSD
  "0x853d955acef822db058eb8505911ed77f175b99e", // FRAX
]);
const ETH_EQUIVALENT_TOKEN_ADDRESSES = new Set([
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
  "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", // stETH
  "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", // wstETH
]);

const PROTOCOL_ADDRESSES = {
  Uniswap: new Set([
    "0x7a250d5630b4cf539739df2c5dacab4c659f2488d",
    "0xe592427a0aece92de3edee1f18e0157c05861564",
    "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b",
  ]),
  OpenSea: new Set([
    "0x00000000006c3852cbef3e08e8df289169ede581",
    "0x0000000000000068f116a894984e2db1123eb395",
  ]),
  Aave: new Set([
    "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9",
    "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2",
  ]),
  Compound: new Set(["0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b"]),
  "1inch": new Set([
    "0x1111111254eeb25477b68fb85ed929f73a960582",
    "0x111111125421ca6dc452d289314280a0f8842a65",
  ]),
};

const responseCache = new Map();
const walletCache = new Map();
let requestQueue = Promise.resolve();
let lastRequestAt = 0;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function scheduleRequest(task) {
  const scheduled = requestQueue.then(async () => {
    const delay = Math.max(0, REQUEST_INTERVAL_MS - (Date.now() - lastRequestAt));
    if (delay) await wait(delay);
    lastRequestAt = Date.now();
    return task();
  });

  requestQueue = scheduled.catch(() => undefined);
  return scheduled;
}

function getCached(key) {
  const cached = responseCache.get(key);

  if (!cached || cached.expiresAt < Date.now()) {
    responseCache.delete(key);
    return null;
  }

  return cached.value;
}

function setCached(key, value) {
  responseCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

async function etherscanRequest(params) {
  if (!process.env.ETHERSCAN_API_KEY) {
    throw new Error("ETHERSCAN_API_KEY is not configured");
  }

  const requestParams = {
    chainid: CHAIN_ID,
    apikey: process.env.ETHERSCAN_API_KEY,
    ...params,
  };
  const cacheKey = new URLSearchParams(requestParams).toString();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  return scheduleRequest(async () => {
    let lastError;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await axios.get(ETHERSCAN_URL, {
          params: requestParams,
          timeout: 15_000,
        });

        if (response.data.status === "0") {
          const errorMessage = `${response.data.message} ${response.data.result}`.toLowerCase();

          if (errorMessage.includes("no transactions")) {
            return setCached(cacheKey, []);
          }

          if (errorMessage.includes("rate limit") && attempt < 2) {
            await wait(750 * (attempt + 1));
            continue;
          }

          throw new Error(response.data.result || response.data.message || "Etherscan request failed");
        }

        return setCached(cacheKey, response.data.result);
      } catch (error) {
        lastError = error;

        if (attempt < 2 && ["ECONNRESET", "ETIMEDOUT", "ECONNABORTED"].includes(error.code)) {
          await wait(750 * (attempt + 1));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  });
}

async function fetchPaginated(action, address, extra = {}) {
  const records = [];
  let complete = false;

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await etherscanRequest({
      module: "account",
      action,
      address,
      page,
      offset: PAGE_SIZE,
      sort: "desc",
      ...extra,
    });

    records.push(...result);

    if (result.length < PAGE_SIZE) {
      complete = true;
      break;
    }
  }

  return { records, complete };
}

async function getAnalysisPeriod(days) {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const [startBlock, endBlock] = await Promise.all([
    etherscanRequest({
      module: "block",
      action: "getblocknobytime",
      timestamp: Math.floor(start.getTime() / 1000),
      closest: "after",
    }),
    etherscanRequest({
      module: "block",
      action: "getblocknobytime",
      timestamp: Math.floor(end.getTime() / 1000),
      closest: "before",
    }),
  ]);

  return {
    days,
    start: start.toISOString(),
    end: end.toISOString(),
    startBlock: Number(startBlock),
    endBlock: Number(endBlock),
  };
}

function addDirection(records, address) {
  return records.map((record) => ({
    ...record,
    direction: record.to?.toLowerCase() === address ? "receive" : "send",
  }));
}

function calculateMoneyFlow(transactions, internalTransactions, address, ethPrice) {
  const seen = new Set();
  let received = 0;
  let spent = 0;
  let incomingCount = 0;
  let outgoingCount = 0;

  [...transactions, ...internalTransactions].forEach((transaction) => {
    const identity = `${transaction.hash}:${transaction.traceId || "normal"}`;
    if (seen.has(identity) || transaction.isError === "1") return;
    seen.add(identity);

    const amount = fromWei(transaction.value);
    if (!amount) return;

    if (transaction.to?.toLowerCase() === address) {
      received += amount;
      incomingCount += 1;
    }

    if (transaction.from?.toLowerCase() === address) {
      spent += amount;
      outgoingCount += 1;
    }
  });

  return {
    received: round(received),
    spent: round(spent),
    receivedUsd: round(received * ethPrice, 2),
    spentUsd: round(spent * ethPrice, 2),
    incomingCount,
    outgoingCount,
  };
}

function buildAssets(tokenTransfers, ethBalance, ethPrice, address) {
  const tokenMap = new Map();

  tokenTransfers.forEach((transfer) => {
    const contractAddress = transfer.contractAddress.toLowerCase();
    const current = tokenMap.get(contractAddress) || {
      contractAddress,
      symbol: transfer.tokenSymbol || "UNKNOWN",
      name: transfer.tokenName || "Unknown Token",
      decimals: Number(transfer.tokenDecimal || 0),
      rawBalance: 0n,
    };
    const value = BigInt(transfer.value || "0");
    current.rawBalance += transfer.to?.toLowerCase() === address ? value : -value;
    tokenMap.set(contractAddress, current);
  });

  const assets = [...tokenMap.values()]
    .filter((asset) => asset.rawBalance > 0n)
    .map((asset) => {
      const balance = tokenAmount(asset.rawBalance.toString(), asset.decimals);
      const isUsdPegged = USD_PEGGED_TOKEN_ADDRESSES.has(asset.contractAddress);
      const isEthEquivalent = ETH_EQUIVALENT_TOKEN_ADDRESSES.has(asset.contractAddress);
      const usdValue = isUsdPegged
        ? balance
        : isEthEquivalent
          ? balance * ethPrice
          : 0;

      return {
        contractAddress: asset.contractAddress,
        symbol: asset.symbol,
        name: asset.name,
        balance: round(balance, 8),
        usdValue: round(usdValue, 2),
        priceAvailable: isUsdPegged || isEthEquivalent,
      };
    });

  assets.push({
    contractAddress: null,
    symbol: "ETH",
    name: "Ether",
    balance: round(ethBalance, 8),
    usdValue: round(ethBalance * ethPrice, 2),
    priceAvailable: true,
  });

  return assets.sort((first, second) => second.usdValue - first.usdValue);
}

function buildNfts(nftTransfers, address) {
  const holdings = new Map();

  [...nftTransfers].reverse().forEach((transfer) => {
    const key = `${transfer.contractAddress.toLowerCase()}:${transfer.tokenID}`;
    const currentAmount = holdings.get(key)?.amount || 0;
    const amount = Number(transfer.tokenValue || 1);
    const nextAmount =
      transfer.to?.toLowerCase() === address ? currentAmount + amount : currentAmount - amount;

    if (nextAmount > 0) {
      holdings.set(key, {
        contractAddress: transfer.contractAddress.toLowerCase(),
        tokenId: transfer.tokenID,
        name: transfer.tokenName || "Unknown NFT",
        symbol: transfer.tokenSymbol || "NFT",
        amount: nextAmount,
      });
    } else {
      holdings.delete(key);
    }
  });

  return [...holdings.values()].slice(0, 100);
}

function analyzeProtocols(transactions) {
  const counts = Object.fromEntries([...Object.keys(PROTOCOL_ADDRESSES), "Other"].map((name) => [name, 0]));

  transactions.forEach((transaction) => {
    if (!transaction.to || transaction.isError === "1" || transaction.input === "0x") return;
    const target = transaction.to.toLowerCase();
    const protocol = Object.entries(PROTOCOL_ADDRESSES).find(([, addresses]) => addresses.has(target))?.[0];
    counts[protocol || "Other"] += 1;
  });

  if (!Object.values(counts).some((count) => count > 0)) {
    return { name: "Other", count: 0, counts };
  }

  const [name, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return { name, count, counts };
}

function buildTimeline(transactions, address) {
  return transactions.slice(0, 20).map((transaction) => {
    const direction = transaction.to?.toLowerCase() === address ? "receive" : "send";
    const type = isSwapTransaction(transaction)
      ? "token swap"
      : transaction.input !== "0x"
        ? "contract interaction"
        : direction;

    return {
      hash: transaction.hash,
      timestamp: new Date(Number(transaction.timeStamp) * 1000).toISOString(),
      type,
      value: {
        amount: round(fromWei(transaction.value)),
        symbol: "ETH",
      },
      from: transaction.from,
      to: transaction.to,
    };
  });
}

function buildLargestHolding(assets) {
  const largest = assets[0];
  const totalValue = assets.reduce((sum, asset) => sum + asset.usdValue, 0);

  return largest
    ? {
        symbol: largest.symbol,
        balance: String(largest.balance),
        usdValue: largest.usdValue,
        percentage: percentage(largest.usdValue, totalValue),
      }
    : null;
}

export function buildPublicWalletData(analytics) {
  return {
    netWorth: analytics.netWorth,
    assetCount: analytics.assetCount,
    nftCount: analytics.nftCount,
    transactionCount: analytics.transactionCount,
    transactionCountIsLowerBound: analytics.transactionCountIsLowerBound,
    largestHolding: analytics.largestHolding,
    moneyFlow: analytics.moneyFlow,
    personality: analytics.personality,
    personalityFactors: analytics.personalityFactors,
    timeline: analytics.timeline,
    valuation: analytics.valuation,
    mostUsedProtocol: {
      name: analytics.mostUsedProtocol.name,
      interactionCount: analytics.mostUsedProtocol.interactionCount,
    },
    riskScore: analytics.riskScore,
    period: analytics.period,
    analysisWindow: analytics.analysisWindow,
    generatedAt: new Date().toISOString(),
  };
}

export async function getWalletData(walletAddress, analysisDays = DEFAULT_ANALYSIS_DAYS) {
  const address = walletAddress.toLowerCase();

  if (!/^0x[a-f0-9]{40}$/.test(address)) {
    throw new Error("Invalid Ethereum wallet address");
  }

  const cacheKey = `${address}:${analysisDays}`;
  const cachedWallet = walletCache.get(cacheKey);
  if (cachedWallet?.expiresAt > Date.now()) {
    return cachedWallet.value;
  }

  try {
    const period = await getAnalysisPeriod(analysisDays);
    const [
      normalResult,
      internalResult,
      tokenResult,
      nftResult,
      balanceWei,
      priceResult,
    ] = await Promise.all([
      fetchPaginated("txlist", address, { startblock: period.startBlock, endblock: period.endBlock }),
      fetchPaginated("txlistinternal", address, { startblock: period.startBlock, endblock: period.endBlock }),
      fetchPaginated("tokentx", address, { startblock: period.startBlock, endblock: period.endBlock }),
      fetchPaginated("tokennfttx", address, { startblock: period.startBlock, endblock: period.endBlock }),
      etherscanRequest({ module: "account", action: "balance", address, tag: "latest" }),
      etherscanRequest({ module: "stats", action: "ethprice" }),
    ]);

    const ethPrice = Number(priceResult.ethusd || 0);
    const ethBalance = fromWei(balanceWei);
    const normalTransactions = normalResult.records;
    const internalTransactions = internalResult.records;
    const tokenTransfers = addDirection(tokenResult.records, address);
    const nftTransfers = addDirection(nftResult.records, address);
    const assets = buildAssets(tokenTransfers, ethBalance, ethPrice, address);
    const pricedAssets = assets.filter((asset) => asset.priceAvailable);
    const nfts = buildNfts(nftTransfers, address);
    const protocolAnalysis = analyzeProtocols(normalTransactions);
    const moneyFlow = calculateMoneyFlow(normalTransactions, internalTransactions, address, ethPrice);
    const personalityDetails = calculatePersonalityDetails({
      normalTransactions,
      tokenTransfers,
      nftTransfers,
      protocolCounts: protocolAnalysis.counts,
      currentAssetCount: assets.length,
    });
    const walletPersonality = personalityDetails.percentages;
    const personality = normalizePercentages({
      nftCollector: walletPersonality.nftCollector,
      trader: walletPersonality.trader,
      defiExplorer: walletPersonality.defiExplorer,
    });
    const riskScore = calculateRiskScore({
      assets,
      normalTransactions,
      protocolCounts: protocolAnalysis.counts,
    });
    const netWorth = round(pricedAssets.reduce((sum, asset) => sum + asset.usdValue, 0), 2);
    const analytics = {
      netWorth,
      assetCount: assets.length,
      nftCount: nfts.reduce((sum, nft) => sum + nft.amount, 0),
      transactionCount: normalTransactions.length,
      transactionCountIsLowerBound: !normalResult.complete,
      largestHolding: buildLargestHolding(pricedAssets),
      moneyFlow,
      personality,
      personalityFactors: personalityDetails.factors,
      timeline: buildTimeline(normalTransactions, address),
      valuation: {
        source: "etherscan",
        networks: ["eth-mainnet"],
        pricedAssetCount: pricedAssets.length,
        totalAssetCount: assets.length,
        complete: tokenResult.complete,
      },
      mostUsedProtocol: {
        name: protocolAnalysis.name,
        interactionCount: protocolAnalysis.count,
        counts: protocolAnalysis.counts,
      },
      riskScore,
      period: {
        days: period.days,
        start: period.start,
        end: period.end,
        startBlock: period.startBlock,
        endBlock: period.endBlock,
      },
      analysisWindow: {
        maxRecordsPerCategory: PAGE_SIZE * MAX_PAGES,
        normalTransactionsComplete: normalResult.complete,
        internalTransactionsComplete: internalResult.complete,
        tokenTransfersComplete: tokenResult.complete,
        nftTransfersComplete: nftResult.complete,
      },
    };

    const result = buildPublicWalletData(analytics);

    walletCache.set(cacheKey, {
      value: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return result;
  } catch (error) {
    const walletError = new Error(`Unable to analyze wallet ${walletAddress}: ${error.message}`);
    walletError.cause = error;
    throw walletError;
  }
}
