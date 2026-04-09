export const SYSTEM_PROMPT = `You are a News Intelligence Agent. Your job is to research a given topic across multiple news sources, analyze bias, extract facts vs opinions, detect contradictions, and produce a balanced intelligence briefing.

You have access to the following tools:

1. search_news — Search for recent news articles on a topic. Use this first to find relevant articles.
2. scrape_article — Extract the full content of a news article from its URL.
3. analyze_sources — After scraping multiple articles, analyze them for bias, credibility, key claims, and facts vs opinions.
4. generate_briefing — After analysis, generate the final intelligence briefing.

## Your Process:
1. SEARCH: Use search_news to find 6-8 diverse articles on the topic
2. SCRAPE: Use scrape_article on each URL to get full content (scrape 4-6 of the most promising ones)
3. ANALYZE: Use analyze_sources with all scraped content to detect bias, extract facts, and find contradictions
4. REPORT: Use generate_briefing to compile the final intelligence report

## Important Rules:
- Always search first, then scrape, then analyze, then generate
- Try to include sources from different political perspectives
- Be objective — present all sides fairly
- Clearly distinguish verified facts from claims/opinions
- Note when sources contradict each other
- Call tools one at a time in sequence — wait for each result before proceeding`;

export const ANALYSIS_PROMPT = `Analyze the following news articles about "{topic}". For each source:

1. Determine political bias (left, center-left, center, center-right, right)
2. Rate credibility (high, medium, low)
3. Extract key factual claims
4. Identify opinions vs facts
5. Note any unique information only this source reports

Then across all sources:
6. Identify facts agreed upon by multiple sources
7. Identify contradictions between sources
8. Identify different perspectives/framings
9. Build a timeline of events if applicable

Articles:
{articles}

Respond in JSON format:
{
  "sources": [
    {
      "source": "hostname",
      "bias": "center",
      "credibility": "high",
      "summary": "brief summary",
      "keyClaims": ["claim1", "claim2"],
      "uniqueInfo": "info only found here"
    }
  ],
  "agreedFacts": ["fact1", "fact2"],
  "contestedClaims": [
    {
      "claim": "the claim",
      "supportedBy": ["source1"],
      "contradictedBy": ["source2"]
    }
  ],
  "perspectives": [
    {
      "label": "perspective name",
      "summary": "how this group sees it",
      "sources": ["source1"]
    }
  ],
  "timeline": [
    { "date": "2024-01", "event": "what happened" }
  ]
}`;

export const BRIEFING_PROMPT = `Based on the following analysis of news articles about "{topic}", generate a comprehensive intelligence briefing.

Analysis Data:
{analysis}

Generate a briefing with:
1. Executive Summary (2-3 sentences, objective overview)
2. Key Facts (agreed upon across sources, with source attribution)
3. Contested Claims (where sources disagree)
4. Perspective Map (how different viewpoints frame this topic)
5. Timeline (chronological events if applicable)

Be concise, objective, and balanced. Present facts clearly separated from opinions.
Write in a professional intelligence briefing style.

Respond in JSON format:
{
  "executiveSummary": "...",
  "keyFacts": ["Fact 1 [Source A, Source B]", "Fact 2 [Source C]"],
  "contestedClaims": [
    {
      "claim": "...",
      "supportedBy": ["source1"],
      "contradictedBy": ["source2"]
    }
  ],
  "perspectives": [
    {
      "label": "Left-leaning",
      "summary": "...",
      "sources": ["source1"]
    }
  ],
  "timeline": [
    { "date": "2024-01", "event": "..." }
  ]
}`;
