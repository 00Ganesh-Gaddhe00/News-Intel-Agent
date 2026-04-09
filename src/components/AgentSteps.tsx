"use client";

import { AgentStep } from "@/types/briefing";
import { Search, FileText, Brain, BarChart3, AlertCircle, Loader2 } from "lucide-react";

const stepIcons = {
  search: Search,
  scrape: FileText,
  analyze: Brain,
  compare: BarChart3,
  report: BarChart3,
  error: AlertCircle,
};

const stepColors = {
  search: "text-blue-600 bg-blue-50",
  scrape: "text-green-600 bg-green-50",
  analyze: "text-purple-600 bg-purple-50",
  compare: "text-orange-600 bg-orange-50",
  report: "text-indigo-600 bg-indigo-50",
  error: "text-red-600 bg-red-50",
};

interface AgentStepsProps {
  steps: AgentStep[];
  isRunning: boolean;
}

export default function AgentSteps({ steps, isRunning }: AgentStepsProps) {
  if (steps.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="bg-card border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          {isRunning && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
          <h3 className="font-semibold text-sm">
            {isRunning ? "Agent Working..." : "Research Complete"}
          </h3>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {steps.map((step, i) => {
            const Icon = stepIcons[step.type];
            const colorClass = stepColors[step.type];
            return (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-muted-foreground pt-0.5">{step.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
