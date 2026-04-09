import * as cheerio from "cheerio";

export interface ScrapedArticle {
  url: string;
  title: string;
  content: string;
  publishedDate?: string;
  source: string;
}

export async function scrapeArticle(url: string): Promise<ScrapedArticle> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; NewsIntelBot/1.0; +https://github.com/news-intel-agent)",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove scripts, styles, nav, footer, ads
  $("script, style, nav, footer, header, aside, .ad, .advertisement, .sidebar, .menu, .nav").remove();

  // Extract title
  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text() ||
    $("h1").first().text() ||
    "Untitled";

  // Extract published date
  const publishedDate =
    $('meta[property="article:published_time"]').attr("content") ||
    $('meta[name="date"]').attr("content") ||
    $("time").attr("datetime") ||
    undefined;

  // Extract main content — try article tag first, then main, then body
  let content = "";
  const articleEl = $("article");
  if (articleEl.length) {
    content = articleEl.text();
  } else {
    const mainEl = $("main");
    if (mainEl.length) {
      content = mainEl.text();
    } else {
      // Fallback: grab all paragraphs
      content = $("p")
        .map((_, el) => $(el).text())
        .get()
        .join("\n\n");
    }
  }

  // Clean up whitespace
  content = content.replace(/\s+/g, " ").trim();

  // Truncate to ~4000 chars to stay within token limits
  if (content.length > 4000) {
    content = content.slice(0, 4000) + "...";
  }

  // Extract source from URL
  const source = new URL(url).hostname.replace("www.", "");

  return {
    url,
    title: title.trim(),
    content,
    publishedDate,
    source,
  };
}
