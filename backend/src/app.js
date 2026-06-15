import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { errorHandler, HttpError, notFound, requestContext } from "./middleware/error.middleware.js";
import { securityHeaders } from "./middleware/security.middleware.js";
import resolutionRoutes from "./routes/resolution.routes.js";
import reportRoutes from "./routes/report.routes.js";
import walletRoutes from "./routes/wallet.routes.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(requestContext);
app.use(securityHeaders);
app.use(cors({
  origin(origin, callback) {
    const allowed = !origin
      || !config.isProduction
      || config.frontendOrigins.includes(origin);

    callback(allowed ? null : new HttpError(403, "CORS_ORIGIN_DENIED", "Origin is not allowed."), allowed);
  },
  methods: ["GET"],
  maxAge: 86_400,
}));
app.use(express.json({ limit: config.jsonLimit }));

app.get("/health", (req, res) => {
  res.set("Cache-Control", "no-store").json({
    status: "ok",
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.use("/api/wallet", walletRoutes);
app.use("/api/resolve", resolutionRoutes);
app.use("/api/report", reportRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
