import express from "express";
import { downloadTransactionReport } from "../controllers/report.controller.js";
import { walletAnalysisRateLimit } from "../middleware/rate-limit.middleware.js";

const router = express.Router();

router.get("/:address", walletAnalysisRateLimit, downloadTransactionReport);

export default router;
