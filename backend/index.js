import "dotenv/config";
import app from "./src/app.js";
import { validateProductionConfig } from "./src/config.js";

validateProductionConfig();

export default app;
