"use client";

import { useEffect, useRef } from "react";
import { Briefing } from "@/types/briefing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Clock,
  Globe,
  ExternalLink,
} from "lucide-react";

const biasColors: Record<string, string> = {
  left: "bg-blue-50 text-blue-600 border-blue-100",
  "center-left": "bg-sky-50 text-sky-600 border-sky-100",
  center: "bg-gray-50 text-gray-600 border-gray-100",
  "center-right": "bg-amber-50 text-amber-600 border-amber-100",
  right: "bg-red-50 text-red-600 border-red-100",
  unknown: "bg-gray-50 text-gray-400 border-gray-100",
};

const credibilityColors: Record<string, string> = {
  high: "bg-emerald-50 text-emerald-600 border-emerald-100",
  medium: "bg-yellow-50 text-yellow-600 border-yellow-100",
  low: "bg-red-50 text-red-600 border-red-100",
};

interface BriefingViewProps {
  briefing: Briefing;
}

export default function BriefingView({ briefing }: BriefingViewProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div ref={ref} className="w-full max-w-3xl mx-auto mt-12 space-y-8 scroll-mt-20">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="outline" className="text-[10px] tracking-widest uppercase font-medium text-red-600 border-red-200 bg-red-50/50">
          Intelligence Briefing
        </Badge>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{briefing.topic}</h2>
        <p className="text-xs text-gray-500">
          {new Date(briefing.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          &middot; {briefing.sources.length} sources analyzed
        </p>
      </div>

      <Tabs defaultValue="briefing" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-50 rounded-xl p-1 h-auto">
          <TabsTrigger value="briefing" className="rounded-lg text-xs py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Briefing</TabsTrigger>
          <TabsTrigger value="sources" className="rounded-lg text-xs py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Sources ({briefing.sources.length})</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-lg text-xs py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Timeline</TabsTrigger>
        </TabsList>

        {/* Briefing Tab */}
        <TabsContent value="briefing" className="space-y-5 mt-6">
          {/* Executive Summary */}
          {briefing.executiveSummary && (
            <Card className="border-gray-200 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 pt-5 px-6">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-800">
                  <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                <p className="text-sm leading-relaxed text-gray-700">{briefing.executiveSummary}</p>
              </CardContent>
            </Card>
          )}

          {/* Key Facts */}
          {briefing.keyFacts && briefing.keyFacts.length > 0 && (
            <Card className="border-gray-200 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 pt-5 px-6">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-800">
                  <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  Key Facts
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                <ul className="space-y-3">
                  {briefing.keyFacts.map((fact, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{fact}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Contested Claims */}
          {briefing.contestedClaims && briefing.contestedClaims.length > 0 && (
            <Card className="border-gray-200 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 pt-5 px-6">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-800">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  Contested Claims
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-5 space-y-4">
                {briefing.contestedClaims.map((claim, i) => (
                  <div key={i} className="space-y-2.5">
                    <p className="text-sm font-medium text-gray-700">&quot;{claim.claim}&quot;</p>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {claim.supportedBy.map((s) => (
                        <Badge key={s} variant="outline" className="bg-emerald-50/50 text-emerald-600 border-emerald-100 text-[11px] font-normal">
                          Supported: {s}
                        </Badge>
                      ))}
                      {claim.contradictedBy.map((s) => (
                        <Badge key={s} variant="outline" className="bg-red-50/50 text-red-500 border-red-100 text-[11px] font-normal">
                          Contradicted: {s}
                        </Badge>
                      ))}
                    </div>
                    {i < briefing.contestedClaims!.length - 1 && <Separator className="bg-gray-50" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Perspectives */}
          {briefing.perspectives && briefing.perspectives.length > 0 && (
            <Card className="border-gray-200 rounded-2xl shadow-sm">
              <CardHeader className="pb-2 pt-5 px-6">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-800">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  Perspective Map
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-5 space-y-4">
                {briefing.perspectives.map((perspective, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[11px] font-medium bg-gray-50 text-gray-600 rounded-lg">
                        {perspective.label}
                      </Badge>
                      <span className="text-[11px] text-gray-300">
                        ({perspective.sources.join(", ")})
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed pl-0.5">
                      {perspective.summary}
                    </p>
                    {i < briefing.perspectives!.length - 1 && <Separator className="bg-gray-100 mt-2" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="mt-6">
          <div className="grid gap-4">
            {briefing.sources.map((source, i) => (
              <Card key={i} className="border-gray-200 rounded-2xl shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium text-sm text-gray-800">{source.source}</span>
                        {source.bias && (
                          <Badge variant="outline" className={`text-[10px] font-normal ${biasColors[source.bias] || biasColors.unknown}`}>
                            {source.bias}
                          </Badge>
                        )}
                        {source.credibility && (
                          <Badge variant="outline" className={`text-[10px] font-normal ${credibilityColors[source.credibility]}`}>
                            {source.credibility}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{source.title}</p>
                      {source.summary && (
                        <p className="text-xs text-gray-500 leading-relaxed">{source.summary}</p>
                      )}
                      {source.keyClaimsFromSource && source.keyClaimsFromSource.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {source.keyClaimsFromSource.map((claim, j) => (
                            <Badge key={j} variant="outline" className="text-[11px] font-normal text-gray-500 border-gray-100 bg-gray-50/50">
                              {claim}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          {briefing.timeline && briefing.timeline.length > 0 ? (
            <Card className="border-gray-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-5">
                  {briefing.timeline.map((entry, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 ring-4 ring-red-50" />
                        {i < briefing.timeline!.length - 1 && (
                          <div className="w-px flex-1 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="pb-5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-[11px] font-medium text-gray-500 tracking-wide">
                            {entry.date}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{entry.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200 rounded-2xl shadow-sm">
              <CardContent className="py-10 text-center text-xs text-gray-500">
                No timeline data available for this topic.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
