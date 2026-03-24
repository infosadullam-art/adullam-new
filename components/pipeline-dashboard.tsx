"use client";

import React from "react"

import { useState } from "react";
import { useEffect } from "react"; // si pas déjà importé
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Database,
  Network,
  Package,
  Filter,
  Scale,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface PipelineStats {
  totalFetched: number;
  totalEnriched: number;
  totalParsed: number;
  totalValidated: number;
  totalCleaned: number;
  totalRejected: number;
  rejectionReasons: Record<string, number>;
  duration: number;
}

type PipelineStep =
  | "idle"
  | "searching"
  | "enriching"
  | "parsing"
  | "estimating"
  | "validating"
  | "transforming"
  | "storing"
  | "graphing"
  | "done"
  | "error";

const PIPELINE_STEPS: { key: PipelineStep; label: string; icon: React.ReactNode }[] = [
  { key: "searching", label: "Search API", icon: <Search className="h-4 w-4" /> },
  { key: "enriching", label: "Detail API", icon: <Sparkles className="h-4 w-4" /> },
  { key: "parsing", label: "Parser", icon: <Package className="h-4 w-4" /> },
  { key: "estimating", label: "Weight", icon: <Scale className="h-4 w-4" /> },
  { key: "validating", label: "Validator", icon: <Filter className="h-4 w-4" /> },
  { key: "transforming", label: "Transform", icon: <Sparkles className="h-4 w-4" /> },
  { key: "storing", label: "Database", icon: <Database className="h-4 w-4" /> },
  { key: "graphing", label: "Graph", icon: <Network className="h-4 w-4" /> },
];

export function PipelineDashboard() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("ALIBABA");
  const [maxPages, setMaxPages] = useState(3);
  const [dryRun, setDryRun] = useState(false);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<PipelineStep>("idle");
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/pipeline/stats");
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch pipeline stats", err);
    }
  };
  fetchStats();
}, []);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runPipeline = async () => {
    if (!query.trim()) return;

    setRunning(true);
    setStats(null);
    setError(null);
    setLogs([]);
    setCurrentStep("searching");

    addLog(`Starting pipeline for: "${query}"`);
    addLog(`Source: ${source} | Pages: ${maxPages} | Dry Run: ${dryRun}`);

    // Simulate step progression while waiting for API
    const stepTimers = PIPELINE_STEPS.map((step, i) =>
      setTimeout(() => {
        setCurrentStep(step.key);
        addLog(`Step ${i + 1}/8: ${step.label}...`);
      }, (i + 1) * 2000)
    );

    try {
      const response = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          source,
          maxPages: parseInt(maxPages, 10),
          dryRun,
        }),
      });

      // Clear step simulation timers
      stepTimers.forEach(clearTimeout);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Pipeline failed");
      }

      setStats(data.stats);
      setCurrentStep("done");
      addLog(`Pipeline completed in ${(data.stats.duration / 1000).toFixed(1)}s`);
      addLog(`Cleaned: ${data.stats.totalCleaned}/${data.stats.totalFetched} products`);
    } catch (err) {
      setCurrentStep("error");
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      addLog(`ERROR: ${message}`);
      // Clear step simulation timers
      stepTimers.forEach(clearTimeout);
    } finally {
      setRunning(false);
    }
  };

  const getStepIndex = (step: PipelineStep): number => {
    return PIPELINE_STEPS.findIndex((s) => s.key === step);
  };

  const progressPercent =
    currentStep === "idle"
      ? 0
      : currentStep === "done"
        ? 100
        : currentStep === "error"
          ? 0
          : ((getStepIndex(currentStep) + 1) / PIPELINE_STEPS.length) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Adullam Pipeline v2
            </h1>
            <p className="text-sm text-muted-foreground">
              Search + Detail Enrichment
            </p>
          </div>
          <Badge variant={running ? "default" : "secondary"}>
            {running ? "Running" : "Idle"}
          </Badge>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Run Pipeline</CardTitle>
            <CardDescription>
              Search Alibaba, enrich with product details, validate, and store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <Label htmlFor="query">Search Query</Label>
                  <Input
                    id="query"
                    placeholder="e.g. wireless earbuds, laptop bag..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={running}
                    onKeyDown={(e) => e.key === "Enter" && runPipeline()}
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={source} onValueChange={setSource} disabled={running}>
                    <SelectTrigger id="source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALIBABA">Alibaba</SelectItem>
                      <SelectItem value="ALIEXPRESS">AliExpress</SelectItem>
                      <SelectItem value="DUBAI">Dubai</SelectItem>
                      <SelectItem value="TURKEY">Turkey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pages">Max Pages</Label>
                  <Input
                  id="pages"
                  type="number"
                 min={1}
                 max={10}
                 value={maxPages}
                 onChange={(e) => setMaxPages(parseInt(e.target.value, 10))}
                 disabled={running}
                  />

                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="dry-run"
                    checked={dryRun}
                    onCheckedChange={setDryRun}
                    disabled={running}
                  />
                  <Label htmlFor="dry-run" className="text-sm text-muted-foreground">
                    Dry Run (no DB writes)
                  </Label>
                </div>

                <Button onClick={runPipeline} disabled={running || !query.trim()}>
                  {running ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Pipeline
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Steps */}
        {currentStep !== "idle" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pipeline Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercent} className="mb-4" />
              <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
                {PIPELINE_STEPS.map((step, i) => {
                  const stepIdx = getStepIndex(currentStep);
                  const isActive = step.key === currentStep;
                  const isDone =
                    currentStep === "done" || (stepIdx >= 0 && i < stepIdx);

                  return (
                    <div
                      key={step.key}
                      className={`flex flex-col items-center gap-1 rounded-lg p-2 text-center transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : isDone
                            ? "text-muted-foreground"
                            : "text-muted-foreground/40"
                      }`}
                    >
                      <div className="relative">
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-chart-2" />
                        ) : isActive ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <span className="text-[10px] font-medium leading-tight">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {(stats || error) && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Stats */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox label="Fetched" value={stats.totalFetched} />
                    <StatBox label="Enriched" value={stats.totalEnriched} />
                    <StatBox label="Parsed" value={stats.totalParsed} />
                    <StatBox label="Validated" value={stats.totalValidated} />
                    <StatBox label="Cleaned" value={stats.totalCleaned} highlight />
                    <StatBox label="Rejected" value={stats.totalRejected} danger />
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-mono">
                      {(stats.duration / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-mono">
                      {((stats.totalCleaned / Math.max(stats.totalFetched, 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rejection reasons or error */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {error ? (
                    <>
                      <XCircle className="h-4 w-4 text-destructive" />
                      Error
                    </>
                  ) : (
                    <>
                      <Filter className="h-4 w-4" />
                      Rejection Reasons
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error ? (
  <p className="text-sm text-destructive">{error}</p>
) : stats && stats.rejectionReasons && Object.keys(stats.rejectionReasons).length > 0 ? (
  <div className="flex flex-col gap-2">
    {Object.entries(stats.rejectionReasons)
      .sort(([, a], [, b]) => b - a)
      .map(([reason, count]) => (
        <div
          key={reason}
          className="flex items-center justify-between text-sm"
        >
          <span className="font-mono text-muted-foreground">
            {reason}
          </span>
          <Badge variant="secondary">{count}</Badge>
        </div>
      ))}
  </div>
) : (
  <p className="text-sm text-muted-foreground">
    No rejections recorded.
  </p>
)}

                  <p className="text-sm text-muted-foreground">
                    No rejections recorded.
                  </p>
                )
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-60 overflow-y-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pipeline Flow Diagram */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline Architecture</CardTitle>
            <CardDescription>
              Dual-endpoint flow: Search Items + Product Details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                "Search API",
                "Detail API",
                "Parser",
                "Weight Est.",
                "Validator",
                "Transformer",
                "Prisma DB",
                "Graph",
              ].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <Badge
                    variant={i < 2 ? "default" : "secondary"}
                    className="whitespace-nowrap"
                  >
                    {step}
                  </Badge>
                  {i < arr.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground md:grid-cols-4">
              <div className="rounded-md border border-border p-2">
                <span className="font-medium text-foreground">Endpoint 1</span>
                <br />
                alibaba-datahub
                <br />
                /item_search
              </div>
              <div className="rounded-md border border-border p-2">
                <span className="font-medium text-foreground">Endpoint 2</span>
                <br />
                alibaba-api2
                <br />
                /product-details
              </div>
              <div className="rounded-md border border-border p-2">
                <span className="font-medium text-foreground">Weight</span>
                <br />
                Google + OpenAI
                <br />
                + Heuristics
              </div>
              <div className="rounded-md border border-border p-2">
                <span className="font-medium text-foreground">Margin</span>
                <br />
                30% obligatoire
                <br />
                Prix USD
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`text-2xl font-semibold tabular-nums ${
          highlight ? "text-chart-2" : danger ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
