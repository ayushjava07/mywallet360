import { blockActionRequest } from "./blockaction.service.js";

export const blockActionRequestWrapper = {
  request: blockActionRequest,
};

class BoundedCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.map = new Map();
  }

  has(key) {
    return this.map.has(key);
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }

  set(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxSize) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
    this.map.set(key, value);
  }

  clear() {
    this.map.clear();
  }
}

const protocolCache = new BoundedCache(1000);

// 1. Internal protocol mapping database
const INTERNAL_PROTOCOL_MAPPING = {
  "0x7a250d5630b4cf539739df2c5dacab4c659f2488d": "Uniswap",
  "0xe592427a0aece92de3edee1f18e0157c05861564": "Uniswap",
  "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b": "Uniswap",
  "0x00000000006c3852cbef3e08e8df289169ede581": "OpenSea",
  "0x0000000000000068f116a894984e2db1123eb395": "OpenSea",
  "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9": "Aave",
  "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": "Aave",
  "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b": "Compound",
  "0x1111111254eeb25477b68fb85ed929f73a960582": "1inch",
  "0x111111125421ca6dc452d289314280a0f8842a65": "1inch",
};

const PROTOCOL_NORMALIZATION = {
  UniversalRouter: "Uniswap",
  UniswapV2Router02: "Uniswap",
  SwapRouter: "Uniswap",

  ENSRegistryWithFallback: "ENS",
  ETHRegistrarController: "ENS",
  BaseRegistrarImplementation: "ENS",
  NameWrapper: "ENS",
  ETHBulkRegistrar: "ENS",
  StaticBulkRenewal: "ENS",
  BulkRegistration: "ENS",

  Pool: "Aave",
  PoolV3: "Aave",

  WETH9: "Wrapped ETH",
  TetherToken: "USDT",
};

export function shortenAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function clearProtocolCache() {
  protocolCache.clear();
}

export async function resolveProtocol(contractAddress) {
  console.log(`[Resolver Start] Address: ${contractAddress}`);
  if (!contractAddress) {
    return { name: "Other", type: "protocol" };
  }
  const address = contractAddress.toLowerCase();

  if (protocolCache.has(address)) {
    const cached = protocolCache.get(address);
    if (cached && cached.type !== "contract") {
      console.log(`[Resolver Cache Hit] Address: ${address}, Result:`, cached);
      return cached;
    }
  }

  // Helper to cache and return
  const cacheAndReturn = (name, type) => {
    const result = { name, type };
    protocolCache.set(address, result);
    return result;
  };

  // 1. Internal protocol mapping database
  if (INTERNAL_PROTOCOL_MAPPING[address]) {
    return cacheAndReturn(INTERNAL_PROTOCOL_MAPPING[address], "protocol");
  }

  // 2. Contract name from verified contract metadata
  try {
    console.log(`[Etherscan Request] Metadata lookup for: ${address}`);
    const response = await blockActionRequestWrapper.request({
      module: "contract",
      action: "getsourcecode",
      address,
    });
    const contractName = response?.[0]?.ContractName;
    console.log(`[Etherscan Response] ContractName: ${contractName}`);
    if (contractName && contractName !== "Max rate limit reached") {
      const normalized = PROTOCOL_NORMALIZATION[contractName] || contractName;
      return cacheAndReturn(normalized, "protocol");
    }
  } catch (error) {
    console.warn(`[Attribution Warning] Metadata lookup failed for ${address}: ${error.message}`);
  }

  // 3. Contract address (shortened format)
  console.log(`[Resolver Fallback] Falling back to shortened address for: ${address}`);
  return cacheAndReturn(shortenAddress(address), "contract");
}

export function resolveProtocolSync(contractAddress) {
  if (!contractAddress) return { name: "Other", type: "protocol" };
  const address = contractAddress.toLowerCase();
  if (protocolCache.has(address)) {
    return protocolCache.get(address);
  }
  if (INTERNAL_PROTOCOL_MAPPING[address]) {
    const result = { name: INTERNAL_PROTOCOL_MAPPING[address], type: "protocol" };
    protocolCache.set(address, result);
    return result;
  }
  const result = {
    name: shortenAddress(address),
    type: "contract",
  };
  protocolCache.set(address, result);
  return result;
}
