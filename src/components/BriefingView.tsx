"use client";

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
  left: "bg-blue-100 text-blue-800",
  "center-left": "bg-sky-100 text-sky-800",
  center: "bg-gray-100 text-gray-800",
  "center-right": "bg-amber-100 text-amber-800",
  right: "bg-red-100 text-red-800",
  unknown: "bg-gray-100 text-gray-500",
};

const credibilityColors: Record<string, string> = {
  high: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-red-100 text-red-800",
};

interface BriefingViewProps {
  briefing: Briefing;
}

export default function BriefingView({ briefing }: BriefingViewProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="outline" className="text-xs">
          Intelligence Briefing
        </Badge>
        <h2 className="text-2xl font-bold">{briefing.topic}</h2>
        <p className="text-sm text-muted-foreground">
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="briefing">Briefing</TabsTrigger>
          <TabsTrigger value="sources">Sources ({briefing.sources.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Briefing Tab */}
        <TabsContent value="briefing" className="space-y-4 mt-4">
          {/* Executive Summary */}
          {briefing.executiveSummary && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{briefing.executiveSummary}</p>
              </CardContent>
            </Card>
          )}

          {/* Key Facts */}
          {briefing.keyFacts && briefing.keyFacts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Key Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {briefing.keyFacts.map((fact, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Contested Claims */}
          {briefing.contestedClaims && briefing.contestedClaims.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Contested Claims
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {briefing.contestedClaims.map((claim, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-sm font-medium">&quot;{claim.claim}&quot;</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {claim.supportedBy.map((s) => (
                        <Badge key={s} variant="outline" className="bg-green-50 text-green-700">
                          Supported: {s}
                        </Badge>
                      ))}
                      {claim.contradictedBy.map((s) => (
                        <Badge key={s} variant="outline" className="bg-red-50 text-red-700">
                          Contradicted: {s}
                        </Badge>
                      ))}
                    </div>
                    {i < briefing.contestedClaims!.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Perspectives */}
          {briefing.perspectives && briefing.perspectives.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  Perspective Map
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {briefing.perspectives.map((perspective, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {perspective.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({perspective.sources.join(", ")})
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-1">
                      {perspective.summary}
                    </p>
                    {i < briefing.perspectives!.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="mt-4">
          <div className="grid gap-3">
            {briefing.sources.map((source, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{source.source}</span>
                        {source.bias && (
                          <Badge className={`text-xs ${biasColors[source.bias] || biasColors.unknown}`}>
                            {source.bias}
                          </Badge>
                        )}
                        {source.credibility && (
                          <Badge className={`text-xs ${credibilityColors[source.credibility]}`}>
                            {source.credibility} credibility
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{source.title}</p>
                      {source.summary && (
                        <p className="text-xs text-muted-foreground">{source.summary}</p>
                      )}
                      {source.keyClaimsFromSource && source.keyClaimsFromSource.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {source.keyClaimsFromSource.map((claim, j) => (
                            <Badge key={j} variant="outline" className="text-xs font-normal">
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
                      className="shrink-0 text-muted-foreground hover:text-foreground"
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
        <TabsContent value="timeline" className="mt-4">
          {briefing.timeline && briefing.timeline.length > 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {briefing.timeline.map((entry, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
                        {i < briefing.timeline!.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {entry.date}
                          </span>
                        </div>
                        <p className="text-sm">{entry.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                No timeline data available for this topic.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
