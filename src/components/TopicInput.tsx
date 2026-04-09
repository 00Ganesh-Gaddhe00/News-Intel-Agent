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
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a news topic to research..."
            className="pl-10 h-12 text-base"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" size="lg" className="h-12 px-6" disabled={isLoading || !topic.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Researching...
            </>
          ) : (
            "Research"
          )}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        <span className="text-sm text-muted-foreground">Try:</span>
        {EXAMPLE_TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTopic(t);
              if (!isLoading) onSubmit(t);
            }}
            className="text-sm px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            disabled={isLoading}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
