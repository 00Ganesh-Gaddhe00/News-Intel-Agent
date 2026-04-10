"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

const EXAMPLE_TOPICS = [
  "AI regulation in the EU",
  "SpaceX Starship latest launch",
  "Global chip shortage 2026",
  "Climate change policy updates",
  "Tech layoffs and hiring trends",
];

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

export default function TopicInput({ onSubmit, isLoading }: TopicInputProps) {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim());
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a news topic to research..."
            className="pl-11 h-12 text-sm bg-white border-gray-200 rounded-xl shadow-sm focus-visible:ring-red-500/20 focus-visible:border-red-300 placeholder:text-gray-400"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 text-sm font-medium"
          disabled={isLoading || !topic.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Researching
            </>
          ) : (
            "Research"
          )}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 mt-5 justify-center">
        <span className="text-xs text-gray-400">Try:</span>
        {EXAMPLE_TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTopic(t);
              if (!isLoading) onSubmit(t);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:shadow-sm transition-all duration-200"
            disabled={isLoading}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
