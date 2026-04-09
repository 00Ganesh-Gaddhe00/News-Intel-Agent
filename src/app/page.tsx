"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import TopicInput from "@/components/TopicInput";
import AgentSteps from "@/components/AgentSteps";
import BriefingView from "@/components/BriefingView";
import { AgentStep, Briefing } from "@/types/briefing";
import { Newspaper, Shield, Brain, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Newspaper,
    title: "Multi-Source Research",
    description: "Searches and scrapes 6-8 diverse news sources automatically",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Shield,
    title: "Bias Detection",
    description: "Identifies political leaning and credibility of each source",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Brain,
    title: "Contradiction Finder",
    description: "Spots where sources disagree and highlights contested claims",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: BarChart3,
    title: "Intelligence Briefing",
    description: "Produces a structured report with facts, perspectives, and timeline",
    color: "text-orange-600 bg-orange-50",
  },
];

export default function Home() {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResearch = useCallback(async (topic: string) => {
    setIsLoading(true);
    setSteps([]);
    setBriefing(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error("Failed to start research");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const { event, data } = JSON.parse(line.slice(6));
              if (event === "step") {
                setSteps((prev) => [...prev, data as AgentStep]);
              } else if (event === "briefing") {
                setBriefing(data as Briefing);
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      }
    } catch (error) {
      setSteps((prev) => [
        ...prev,
        {
          type: "error",
          message: error instanceof Error ? error.message : "An error occurred",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        {!briefing && !isLoading && (
          <div className="text-center mb-10 pt-8">
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              News Intelligence Agent
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Enter any news topic. The AI agent will research multiple sources,
              detect bias, find contradictions, and deliver a balanced intelligence briefing.
            </p>
          </div>
        )}

        {/* Topic Input */}
        <TopicInput onSubmit={handleResearch} isLoading={isLoading} />

        {/* Agent Steps (live progress) */}
        <AgentSteps steps={steps} isRunning={isLoading} />

        {/* Briefing Result */}
        {briefing && <BriefingView briefing={briefing} />}

        {/* Features (show when idle) */}
        {!briefing && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl border p-5 text-center space-y-3"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto ${feature.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
