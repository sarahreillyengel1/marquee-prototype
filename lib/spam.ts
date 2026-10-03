// Cheap checks that stop the common junk: scripts posting straight at our forms from somewhere else.
const BOT = /bot|crawl|spider|slurp|curl|wget|python|scrapy|httpclient|headless|phantom|axios|node-fetch|go-http|java\/|libwww|facebookexternalhit|preview/i;

export const isBotAgent = (req: Request) => { const ua = req.headers.get("user-agent") || ""; return !ua || BOT.test(ua); };

/** True when a form post did not come from a page on our own site. */
export function offSite(req: Request) {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!origin) return true;
  try { const h = new URL(origin).hostname; return !(h === "marquee.bio" || h.endsWith(".marquee.bio") || h === "localhost" || h.endsWith(".vercel.app")); } catch { return true; }
}

/** A form post we should quietly ignore. `trap` is a hidden field real people never fill in. */
export const looksLikeSpam = (req: Request, trap?: unknown) => isBotAgent(req) || offSite(req) || (typeof trap === "string" && trap.trim() !== "");
