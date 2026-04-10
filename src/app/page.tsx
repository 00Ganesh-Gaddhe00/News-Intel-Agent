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
    title: "Multi-Source",
    description: "Searches 6+ diverse news sources automatically",
    color: "text-red-600 bg-red-50",
  },
  {
    icon: Shield,
    title: "Bias Detection",
    description: "Identifies political leaning and credibility",
    color: "text-orange-600 bg-orange-50",
  },
  {
    icon: Brain,
    title: "Contradictions",
    description: "Spots where sources disagree on claims",
    color: "text-rose-600 bg-rose-50",
  },
  {
    icon: BarChart3,
    title: "Briefing",
    description: "Structured report with facts and perspectives",
    color: "text-amber-600 bg-amber-50",
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
    <div className="min-h-screen bg-[#fafafa]">
      <Header />

      <main className="container mx-auto px-6 py-12">
        {/* Hero */}
        {!briefing && !isLoading && (
          <div className="text-center mb-14 pt-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-red-500 mb-4">
              AI-Powered Research
            </p>
            <h2 className="text-4xl font-bold font- mb-4 text-gray-900 tracking-tight">
              News Intelligence Agent
            </h2>
            <p className="text-base text-gray-500 max-w-md mx-auto leading-relaxed">
              Enter any topic and get a balanced news report with intelligence briefing,
              bias detection and multi-source analysis.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-3xl mx-auto mt-20">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl border border-gray-200 p-6 text-center space-y-3 hover:shadow-md hover:shadow-gray-200/50 transition-all duration-300"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto ${feature.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800">{feature.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
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
