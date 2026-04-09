import { groq } from "@/lib/groq";
import { ANALYSIS_PROMPT, BRIEFING_PROMPT } from "./prompts";
import { AgentStep, Briefing } from "@/types/briefing";
import { tavily } from "@tavily/core";

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

const MODEL = "llama-3.1-8b-instant";

type OnStepCallback = (step: AgentStep) => void;

export async function runAgent(
  topic: string,
  onStep: OnStepCallback
): Promise<Briefing> {
  const briefing: Briefing = {
    id: crypto.randomUUID(),
    topic,
    createdAt: new Date().toISOString(),
    status: "searching",
    sources: [],
  };

  // --- Step 1: Search via Tavily (multiple queries for diverse results) ---
  onStep({ type: "search", message: `Searching for: "${topic}"` });

  const queries = [
    `${topic} latest news`,
    `${topic} recent updates`,
  ];

  const seenUrls = new Set<string>();
  const articles: { source: string; title: string; url: string; content: string; publishedDate?: string }[] = [];

  for (const query of queries) {
    try {
      const searchResponse = await tavilyClient.search(query, {
        topic: "general",
        searchDepth: "basic",
        maxResults: 4,
      });

      for (const r of searchResponse.results) {
        if (seenUrls.has(r.url)) continue;
        seenUrls.add(r.url);
        const source = new URL(r.url).hostname.replace("www.", "");
        articles.push({
          source,
          title: r.title,
          url: r.url,
          content: r.content.slice(0, 800),
          publishedDate: r.publishedDate,
        });
      }
    } catch {
      // If a query fails, continue with others
    }

    if (articles.length >= 6) break;
  }

  // Keep only top 6
  const finalArticles = articles.slice(0, 6);

  for (const a of finalArticles) {
    briefing.sources.push({
      url: a.url,
      title: a.title,
      source: a.source,
      publishedDate: a.publishedDate,
    });
  }

  onStep({
    type: "search",
    message: `Found ${finalArticles.length} articles`,
    data: finalArticles.map(({ title, url, source }) => ({ title, url, source })),
  });

  // --- Step 2: Analyze sources ---
  briefing.status = "analyzing";
  onStep({
    type: "analyze",
    message: `Analyzing ${finalArticles.length} sources for bias, credibility, and contradictions...`,
  });

  const analysisPrompt = ANALYSIS_PROMPT
    .replace("{topic}", topic)
    .replace("{articles}", JSON.stringify(finalArticles));

  const analysisResponse = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: analysisPrompt }],
    temperature: 0.2,
    max_tokens: 3000,
  });

  const analysisResult = analysisResponse.choices[0].message.content || "{}";

  // Update source info from analysis
  try {
    const parsed = JSON.parse(analysisResult);
    if (parsed.sources) {
      for (const src of parsed.sources) {
        const existing = briefing.sources.find(
          (s) => s.source === src.source
        );
        if (existing) {
          existing.bias = src.bias;
          existing.credibility = src.credibility;
          existing.summary = src.summary;
          existing.keyClaimsFromSource = src.keyClaims;
        }
      }
    }
  } catch {
    // Analysis might not be valid JSON
  }

  onStep({ type: "analyze", message: "Analysis complete" });

  // --- Step 3: Generate briefing ---
  briefing.status = "generating";
  onStep({ type: "report", message: "Generating intelligence briefing..." });

  const briefingPrompt = BRIEFING_PROMPT
    .replace("{topic}", topic)
    .replace("{analysis}", analysisResult);

  const briefingResponse = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: briefingPrompt }],
    temperature: 0.2,
    max_tokens: 3000,
  });

  const briefingContent = briefingResponse.choices[0].message.content || "{}";

  try {
    const parsed = JSON.parse(briefingContent);
    briefing.executiveSummary = parsed.executiveSummary;
    briefing.keyFacts = parsed.keyFacts;
    briefing.contestedClaims = parsed.contestedClaims;
    briefing.perspectives = parsed.perspectives;
    briefing.timeline = parsed.timeline;
    briefing.status = "complete";
  } catch {
    briefing.executiveSummary = briefingContent;
    briefing.status = "complete";
  }

  onStep({ type: "report", message: "Briefing generated successfully" });

  return briefing;
}
