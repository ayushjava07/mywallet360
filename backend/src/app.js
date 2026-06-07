import express from "express";
import cors from "cors";
import walletRoutes from "./routes/wallet.routes.js";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
}));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/wallet", walletRoutes);

export default app;
