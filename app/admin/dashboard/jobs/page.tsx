"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { StatsCard } from "@/components/admin/stats-card"
import { DataTable } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { jobsApi } from "@/lib/admin/api-client"
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  RefreshCw,
  Eye,
  Calendar,
  AlertCircle,
  MoreHorizontal
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

interface JobLog {
  id: string
  type: string
  status: string
  progress: number
  startedAt: string | null
  completedAt: string | null
  errorMessage: string | null
  createdAt: string
}

interface JobStats {
  total: number
  running: number
  failed: number
  byType: Record<string, number>
  byStatus: Record<string, number>
  queues: Record<string, { waiting: number; active: number; completed: number; failed: number }>
}

interface Meta {
  page: number
  totalPages: number
  total: number
}

const adminPath = "/admin/dashboard"

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    COMPLETED: "default",
    RUNNING: "secondary",
    PENDING: "outline",
    FAILED: "destructive",
    CANCELLED: "destructive",
  }
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>
}

function getStatusIcon(status: string) {
  switch(status) {
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'RUNNING':
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'FAILED':
    case 'CANCELLED':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

const JOB_OPTIONS = [
  { queue: "import", job: "processImportBatch", label: "Import Products" },
  { queue: "deduplication", job: "runDeduplication", label: "Deduplication" },
  { queue: "fakeDetection", job: "runFakeDetection", label: "Fake Detection" },
  { queue: "cleanProducts", job: "cleanProducts", label: "Clean Products" },
  { queue: "forYouScoring", job: "forYouScoring", label: "ForYou Scoring" },
  { queue: "feedScoring", job: "feedScoring", label: "Feed Scoring" },
  { queue: "graphUpdate", job: "graphUpdate", label: "Graph Update" },
  { queue: "notification", job: "notificationDispatch", label: "Notification Dispatch" },
]

export default function JobsPage() {
  const { user, isLoading: authLoading } = useAuth()

  const [jobs, setJobs] = useState<JobLog[]>([])
  const [stats, setStats] = useState<JobStats | null>(null)
  const [meta, setMeta] = useState<Meta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [page, typeFilter, statusFilter])

  async function loadData(refresh = false) {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)
    
    try {
      const params: Record<string, string | number | boolean | undefined> = { 
        page, 
        limit: 20 
      }
      if (typeFilter && typeFilter !== "all") params.type = typeFilter
      if (statusFilter && statusFilter !== "all") params.status = statusFilter

      const [jobsRes, statsRes] = await Promise.all([
        jobsApi.list(params), 
        jobsApi.stats()
      ])

      if (jobsRes.success) {
        setJobs(jobsRes.data as JobLog[])
        setMeta(jobsRes.meta as Meta)
      }
      if (statsRes.success) {
        setStats(statsRes.data as JobStats)
      }
    } catch (error) {
      console.error("Failed to load jobs:", error)
      toast.error("Failed to load jobs")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  async function triggerJob(queue: string, job: string) {
    try {
      await jobsApi.trigger(queue, job)
      toast.success(`${job} triggered`)
      setTimeout(() => loadData(), 1000)
    } catch (error) {
      toast.error("Failed to trigger job")
    }
  }

  async function handleRetry(id: string) {
    try {
      await jobsApi.retry(id)
      toast.success("Job retried")
      loadData()
    } catch (error) {
      toast.error("Failed to retry job")
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Are you sure you want to cancel this job?")) return
    try {
      await jobsApi.cancel(id)
      toast.success("Job cancelled")
      loadData()
    } catch (error) {
      toast.error("Failed to cancel job")
    }
  }

  const columns = [
    {
      key: "type",
      header: "Job",
      cell: (job: JobLog) => (
        <Link 
          href={`${adminPath}/jobs/${job.id}`}
          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors group"
        >
          <p className="font-medium group-hover:text-primary">
            {job.type.replace(/_/g, " ")}
          </p>
          <p className="text-xs text-muted-foreground">ID: {job.id.slice(0, 8)}...</p>
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (job: JobLog) => (
        <Link 
          href={`${adminPath}/jobs?status=${job.status}`}
          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {getStatusIcon(job.status)}
            {getStatusBadge(job.status)}
          </div>
        </Link>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      cell: (job: JobLog) => (
        <Link 
          href={`${adminPath}/jobs/${job.id}`}
          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Progress value={job.progress} className="w-20 h-2" />
            <span className="text-sm text-muted-foreground">{job.progress}%</span>
          </div>
        </Link>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      cell: (job: JobLog) => {
        if (!job.startedAt) return <span className="text-muted-foreground p-2">—</span>
        const start = new Date(job.startedAt).getTime()
        const end = job.completedAt ? new Date(job.completedAt).getTime() : Date.now()
        const seconds = Math.round((end - start) / 1000)
        const minutes = Math.floor(seconds / 60)
        const display = minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`
        
        return (
          <Link 
            href={`${adminPath}/jobs/${job.id}`}
            className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm">{display}</span>
          </Link>
        )
      },
    },
    {
      key: "created",
      header: "Created",
      cell: (job: JobLog) => (
        <Link 
          href={`${adminPath}/jobs/${job.id}`}
          className="flex items-center gap-1 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(job.createdAt)}
        </Link>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      cell: (job: JobLog) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${adminPath}/jobs/${job.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            
            {job.status === 'FAILED' && (
              <DropdownMenuItem onClick={() => handleRetry(job.id)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </DropdownMenuItem>
            )}
            
            {job.status === 'RUNNING' && (
              <DropdownMenuItem onClick={() => handleCancel(job.id)} className="text-destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  if (isLoading || authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div>
      <AdminHeader
        title="Background Jobs"
        description="Monitor and manage background jobs"
        actions={
          <Button variant="outline" onClick={() => loadData(true)} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards avec liens */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href={`${adminPath}/jobs`} className="block">
            <StatsCard 
              title="Total Jobs" 
              value={stats?.total || 0} 
              icon={Activity}
              className="cursor-pointer hover:shadow-lg transition-shadow" 
            />
          </Link>
          
          <Link href={`${adminPath}/jobs?status=RUNNING`} className="block">
            <StatsCard 
              title="Running" 
              value={stats?.running || 0} 
              icon={Clock}
              className="cursor-pointer hover:shadow-lg transition-shadow" 
            />
          </Link>
          
          <Link href={`${adminPath}/jobs?status=COMPLETED`} className="block">
            <StatsCard 
              title="Completed" 
              value={stats?.byStatus?.COMPLETED || 0} 
              icon={CheckCircle}
              className="cursor-pointer hover:shadow-lg transition-shadow" 
            />
          </Link>
          
          <Link href={`${adminPath}/jobs?status=FAILED`} className="block">
            <StatsCard 
              title="Failed" 
              value={stats?.failed || 0} 
              icon={XCircle}
              className="cursor-pointer hover:shadow-lg transition-shadow" 
            />
          </Link>
        </div>

        {/* Queue Stats avec liens */}
        {stats?.queues && (
          <Card>
            <CardHeader>
              <CardTitle>Queue Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(stats.queues).map(([name, queue]) => (
                  <Link
                    key={name}
                    href={`${adminPath}/jobs?type=${name.toUpperCase()}`}
                    className="rounded-lg border p-3 hover:bg-muted/50 transition-colors block"
                  >
                    <p className="font-medium text-sm mb-2 capitalize">{name}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Waiting:</span> {queue.waiting}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Active:</span> {queue.active}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Done:</span> {queue.completed}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed:</span> {queue.failed}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Triggers */}
        <Card>
          <CardHeader>
            <CardTitle>Trigger Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {JOB_OPTIONS.map((opt) => (
                <Button 
                  key={opt.job} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => triggerJob(opt.queue, opt.job)}
                >
                  <Play className="mr-2 h-3 w-3" />
                  {opt.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters & Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Job History</CardTitle>
              <div className="flex gap-2">
                <Select
                  value={typeFilter}
                  onValueChange={(v) => {
                    setTypeFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="IMPORT_PRODUCTS">Import</SelectItem>
                    <SelectItem value="DEDUPLICATION">Deduplication</SelectItem>
                    <SelectItem value="FAKE_DETECTION">Fake Detection</SelectItem>
                    <SelectItem value="CLEAN_PRODUCTS">Clean Products</SelectItem>
                    <SelectItem value="FOR_YOU_SCORING">ForYou Scoring</SelectItem>
                    <SelectItem value="FEED_SCORING">Feed Scoring</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="RUNNING">Running</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={jobs}
              isLoading={isLoading}
              pagination={
                meta
                  ? {
                      page: meta.page,
                      totalPages: meta.totalPages,
                      total: meta.total,
                      onPageChange: setPage,
                    }
                  : undefined
              }
              emptyMessage="No jobs found"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}