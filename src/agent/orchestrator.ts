import Groq from "groq-sdk";
import { groq } from "@/lib/groq";
import { scrapeArticle, ScrapedArticle } from "@/lib/scraper";
import { SYSTEM_PROMPT, ANALYSIS_PROMPT, BRIEFING_PROMPT } from "./prompts";
import { AgentStep, Briefing } from "@/types/briefing";

const TOOLS: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_news",
      description:
        "Search for recent news articles on a topic. Returns a list of article URLs and titles.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query for finding news articles",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "scrape_article",
      description:
        "Extract the full text content from a news article URL.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL of the article to scrape",
          },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_sources",
      description:
        "Analyze scraped articles for bias, credibility, key claims, facts vs opinions, and contradictions.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "The topic being researched",
          },
          articles: {
            type: "string",
            description:
              "JSON string of scraped articles with their content",
          },
        },
        required: ["topic", "articles"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_briefing",
      description:
        "Generate the final intelligence briefing from the analysis.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "The topic being researched",
          },
          analysis: {
            type: "string",
            description: "JSON string of the analysis results",
          },
        },
        required: ["topic", "analysis"],
      },
    },
  },
];

// Use DuckDuckGo HTML search (no API key needed)
async function searchNews(query: string): Promise<{ title: string; url: string; snippet: string }[]> {
  const searchQuery = encodeURIComponent(`${query} news`);
  const response = await fetch(
    `https://html.duckduckgo.com/html/?q=${searchQuery}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NewsIntelBot/1.0)",
      },
      signal: AbortSignal.timeout(10000),
    }
  );

  const html = await response.text();
  const cheerio = await import("cheerio");
  const $ = cheerio.load(html);

  const results: { title: string; url: string; snippet: string }[] = [];

  $(".result").each((_, el) => {
    const titleEl = $(el).find(".result__a");
    const snippetEl = $(el).find(".result__snippet");
    const href = titleEl.attr("href") || "";

    // DuckDuckGo wraps URLs — extract actual URL
    let url = href;
    try {
      const urlParams = new URLSearchParams(href.split("?")[1]);
      url = urlParams.get("uddg") || href;
    } catch {
      url = href;
    }

    if (url && url.startsWith("http")) {
      results.push({
        title: titleEl.text().trim(),
        url,
        snippet: snippetEl.text().trim(),
      });
    }
  });

  return results.slice(0, 8);
}

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

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Research the following topic and produce an intelligence briefing: "${topic}"`,
    },
  ];

  const scrapedArticles: ScrapedArticle[] = [];
  let analysisResult: string = "";
  const maxIterations = 15;

  for (let i = 0; i < maxIterations; i++) {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 4096,
    });

    const message = response.choices[0].message;
    messages.push(message);

    // If no tool calls, the agent is done
    if (!message.tool_calls || message.tool_calls.length === 0) {
      break;
    }

    // Process each tool call
    for (const toolCall of message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments);
      let result: string;

      try {
        switch (toolCall.function.name) {
          case "search_news": {
            briefing.status = "searching";
            onStep({
              type: "search",
              message: `Searching for: "${args.query}"`,
            });

            const searchResults = await searchNews(args.query);
            result = JSON.stringify(searchResults);

            onStep({
              type: "search",
              message: `Found ${searchResults.length} articles`,
              data: searchResults,
            });
            break;
          }

          case "scrape_article": {
            briefing.status = "scraping";
            onStep({
              type: "scrape",
              message: `Scraping: ${args.url}`,
            });

            try {
              const article = await scrapeArticle(args.url);
              scrapedArticles.push(article);
              briefing.sources.push({
                url: article.url,
                title: article.title,
                source: article.source,
                publishedDate: article.publishedDate,
              });
              result = JSON.stringify({
                title: article.title,
                source: article.source,
                content: article.content.slice(0, 3000),
                publishedDate: article.publishedDate,
              });

              onStep({
                type: "scrape",
                message: `Scraped: "${article.title}" from ${article.source}`,
              });
            } catch (err) {
              result = JSON.stringify({
                error: `Failed to scrape: ${err instanceof Error ? err.message : "Unknown error"}`,
              });
              onStep({
                type: "error",
                message: `Failed to scrape ${args.url}`,
              });
            }
            break;
          }

          case "analyze_sources": {
            briefing.status = "analyzing";
            onStep({
              type: "analyze",
              message: `Analyzing ${scrapedArticles.length} sources for bias, credibility, and contradictions...`,
            });

            const articlesForAnalysis = scrapedArticles.map((a) => ({
              source: a.source,
              title: a.title,
              content: a.content.slice(0, 2000),
              url: a.url,
            }));

            const analysisPrompt = ANALYSIS_PROMPT.replace(
              "{topic}",
              args.topic
            ).replace("{articles}", JSON.stringify(articlesForAnalysis));

            const analysisResponse = await groq.chat.completions.create({
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: analysisPrompt }],
              temperature: 0.2,
              max_tokens: 4096,
            });

            analysisResult =
              analysisResponse.choices[0].message.content || "{}";
            result = analysisResult;

            // Try to parse and update source info
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
              // Analysis might not be valid JSON, that's ok
            }

            onStep({
              type: "analyze",
              message: "Analysis complete",
              data: analysisResult,
            });
            break;
          }

          case "generate_briefing": {
            briefing.status = "generating";
            onStep({
              type: "report",
              message: "Generating intelligence briefing...",
            });

            const briefingPrompt = BRIEFING_PROMPT.replace(
              "{topic}",
              args.topic
            ).replace("{analysis}", args.analysis);

            const briefingResponse = await groq.chat.completions.create({
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: briefingPrompt }],
              temperature: 0.2,
              max_tokens: 4096,
            });

            const briefingContent =
              briefingResponse.choices[0].message.content || "{}";
            result = briefingContent;

            try {
              const parsed = JSON.parse(briefingContent);
              briefing.executiveSummary = parsed.executiveSummary;
              briefing.keyFacts = parsed.keyFacts;
              briefing.contestedClaims = parsed.contestedClaims;
              briefing.perspectives = parsed.perspectives;
              briefing.timeline = parsed.timeline;
              briefing.status = "complete";
            } catch {
              // If JSON parsing fails, try to extract from the text
              briefing.executiveSummary = briefingContent;
              briefing.status = "complete";
            }

            onStep({
              type: "report",
              message: "Briefing generated successfully",
            });
            break;
          }

          default:
            result = JSON.stringify({ error: "Unknown tool" });
        }
      } catch (err) {
        result = JSON.stringify({
          error: err instanceof Error ? err.message : "Unknown error",
        });
        onStep({
          type: "error",
          message: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        });
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }

  if (briefing.status !== "complete") {
    briefing.status = "complete";
    if (!briefing.executiveSummary) {
      briefing.executiveSummary =
        "The agent completed its research but was unable to generate a full briefing. Please try again with a more specific topic.";
    }
  }

  return briefing;
}
