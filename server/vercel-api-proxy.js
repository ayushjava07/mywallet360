import { Buffer } from "node:buffer";

const BACKEND_ORIGIN = "https://mywallet360-backend.vercel.app";
const FORWARDED_RESPONSE_HEADERS = [
  "cache-control",
  "content-type",
  "ratelimit",
  "ratelimit-policy",
  "retry-after",
  "x-request-id",
];

export async function proxyApiRequest(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ code: "METHOD_NOT_ALLOWED", message: "Only GET requests are supported." });
    return;
  }

  try {
    const response = await fetch(`${BACKEND_ORIGIN}${req.url}`, {
      headers: {
        Accept: "application/json",
        ...(req.headers["x-forwarded-for"] ? { "x-forwarded-for": req.headers["x-forwarded-for"] } : {}),
        ...(req.headers["x-request-id"] ? { "x-request-id": req.headers["x-request-id"] } : {}),
      },
      signal: AbortSignal.timeout(55_000),
    });

    FORWARDED_RESPONSE_HEADERS.forEach((header) => {
      const value = response.headers.get(header);
      if (value) res.setHeader(header, value);
    });

    res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.status(502).json({
      code: "BACKEND_UNAVAILABLE",
      message: "The wallet analytics backend is unavailable. Please try again.",
    });
  }
}
