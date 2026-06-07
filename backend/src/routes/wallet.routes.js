import express from "express";
import { getWalletProfile } from "../controllers/wallet.controller.js";

const router = express.Router();

router.get("/:address", getWalletProfile);

export default router;