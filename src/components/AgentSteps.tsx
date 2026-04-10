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
  search: "text-red-600 bg-red-50",
  scrape: "text-orange-600 bg-orange-50",
  analyze: "text-rose-600 bg-rose-50",
  compare: "text-amber-600 bg-amber-50",
  report: "text-red-700 bg-red-50",
  error: "text-red-500 bg-red-50",
};

interface AgentStepsProps {
  steps: AgentStep[];
  isRunning: boolean;
}

export default function AgentSteps({ steps, isRunning }: AgentStepsProps) {
  if (steps.length === 0) return null;

  return (
    <div className="w-full max-w-xl mx-auto mt-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          {isRunning && <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />}
          <h3 className="font-medium text-xs tracking-wide uppercase text-gray-500">
            {isRunning ? "Agent Working" : "Research Complete"}
          </h3>
        </div>
        <div className="space-y-3 max-h-56 overflow-y-auto">
          {steps.map((step, i) => {
            const Icon = stepIcons[step.type];
            const colorClass = stepColors[step.type];
            return (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <span className="text-gray-600 text-[13px] leading-relaxed pt-0.5">{step.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
