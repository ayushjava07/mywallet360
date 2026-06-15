import axios from "axios";
import { getAddress, isAddress, JsonRpcProvider } from "ethers";

const UNSTOPPABLE_TLDS = new Set([
  "888",
  "anime",
  "binanceus",
  "bitcoin",
  "blockchain",
  "crypto",
  "dao",
  "go",
  "hi",
  "klever",
  "kresus",
  "manga",
  "nft",
  "polygon",
  "wallet",
  "x",
  "zil",
]);

let ensProvider;

export class WalletResolutionError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const getDomainType = (input) => {
  const tld = input.split(".").pop();

  if (tld === "eth") return "ens";
  if (UNSTOPPABLE_TLDS.has(tld)) return "unstoppable";

  return null;
};

const getEnsProvider = () => {
  if (!ensProvider) {
    const rpcUrl = process.env.ETHEREUM_RPC_URL ;
    ensProvider = new JsonRpcProvider(rpcUrl, "mainnet");
  }

  return ensProvider;
};

const getUnstoppableApiKey = () => {
  if (!process.env.UNSTOPPABLE_API_KEY) {
    throw new WalletResolutionError(
      "UNSTOPPABLE_UNAVAILABLE",
      "Unstoppable Domain search is temporarily unavailable.",
      503,
    );
  }

  return process.env.UNSTOPPABLE_API_KEY;
};

const resolveEns = async (name) => {
  let address;

  try {
    address = await getEnsProvider().resolveName(name);
  } catch {
    throw new WalletResolutionError(
      "ENS_RESOLUTION_FAILED",
      "We could not resolve that ENS name. Check the name and try again.",
    );
  }

  if (!address) {
    throw new WalletResolutionError(
      "DOMAIN_NOT_FOUND",
      "That ENS name was not found or has no Ethereum address.",
      404,
    );
  }

  return getAddress(address);
};

const resolveUnstoppable = async (name) => {
  let address;

  try {
    const response = await axios.get(
      `https://api.unstoppabledomains.com/resolve/domains/${encodeURIComponent(name)}`,
      {
        headers: {
          Authorization: `Bearer ${getUnstoppableApiKey()}`,
        },
        timeout: 10_000,
      },
    );
    const records = response.data?.records || {};

    address = records["crypto.ETH.address"]
      || records["token.EVM.ETH.address"]
      || records["token.EVM.address"];
  } catch (error) {
    if (error instanceof WalletResolutionError) throw error;

    if (error.response?.status === 404) {
      throw new WalletResolutionError(
        "DOMAIN_NOT_FOUND",
        "That Unstoppable Domain was not found.",
        404,
      );
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new WalletResolutionError(
        "UNSTOPPABLE_UNAVAILABLE",
        "Unstoppable Domain search is temporarily unavailable.",
        503,
      );
    }

    throw new WalletResolutionError(
      "UNSTOPPABLE_RESOLUTION_FAILED",
      "We could not resolve that Unstoppable Domain. Check the name and try again.",
    );
  }

  if (!address || !isAddress(address)) {
    throw new WalletResolutionError(
      "NO_ETH_ADDRESS",
      "That Unstoppable Domain does not have an Ethereum address.",
      404,
    );
  }

  return getAddress(address);
};

export const resolveDomain = async (identifier) => {
  const originalInput = identifier.trim();
  const normalizedInput = originalInput.toLowerCase();
  const type = getDomainType(normalizedInput);

  if (!type || !normalizedInput.includes(".") || normalizedInput.includes(" ")) {
    throw new WalletResolutionError(
      "INVALID_DOMAIN",
      "Enter a valid ENS or Unstoppable Domain name.",
    );
  }

  const address = type === "ens"
    ? await resolveEns(normalizedInput)
    : await resolveUnstoppable(normalizedInput);

  return { address, type, originalInput };
};
