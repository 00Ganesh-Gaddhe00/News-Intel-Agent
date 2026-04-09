export interface SourceArticle {
  url: string;
  title: string;
  source: string;
  bias?: "left" | "center-left" | "center" | "center-right" | "right" | "unknown";
  credibility?: "high" | "medium" | "low";
  summary?: string;
  keyClaimsFromSource?: string[];
  publishedDate?: string;
}

export interface ContestedClaim {
  claim: string;
  supportedBy: string[];
  contradictedBy: string[];
}

export interface Briefing {
  id: string;
  topic: string;
  createdAt: string;
  status: "searching" | "scraping" | "analyzing" | "comparing" | "generating" | "complete" | "error";
  executiveSummary?: string;
  keyFacts?: string[];
  contestedClaims?: ContestedClaim[];
  perspectives?: {
    label: string;
    summary: string;
    sources: string[];
  }[];
  timeline?: {
    date: string;
    event: string;
  }[];
  sources: SourceArticle[];
  error?: string;
}

export interface AgentStep {
  type: "search" | "scrape" | "analyze" | "compare" | "report" | "error";
  message: string;
  data?: unknown;
}
