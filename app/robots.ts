import type { MetadataRoute } from "next"

// Explicit allow for AI crawlers (GEO): being listed by name signals intent
// to ChatGPT/Claude/Perplexity/Gemini crawlers even though the default rule
// already permits them. Checkout and API stay out of every index.

const DISALLOW = ["/checkout", "/api/", "/cart/recover"]

const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "cohere-ai",
  "meta-externalagent",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: "https://www.maisontanneurs.com/sitemap.xml",
  }
}
