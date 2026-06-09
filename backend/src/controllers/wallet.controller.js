import { getWalletData } from "../services/etherscan.service.js";
import { isAddress } from "ethers";
import { HttpError } from "../middleware/error.middleware.js";

const ALLOWED_ANALYSIS_DAYS = new Set([1, 7, 30, 365]);

export const getWalletProfile = async (req, res, next) => {
  const { address } = req.params;
  const days = Number(req.query.days || 30);

  if (!isAddress(address)) {
    next(new HttpError(400, "INVALID_WALLET_ADDRESS", "Enter a valid Ethereum wallet address."));
    return;
  }

  if (!ALLOWED_ANALYSIS_DAYS.has(days)) {
    next(new HttpError(400, "INVALID_ANALYSIS_PERIOD", "Choose an analysis period of 1, 7, 30, or 365 days."));
    return;
  }

  try {
    const walletData = await getWalletData(address, days);
    res.set("Cache-Control", "private, max-age=60, stale-while-revalidate=240");
    res.json(walletData);
  } catch (error) {
    next(error);
  }
};
