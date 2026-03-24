"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  Play,
  Trash2,
  FileText,
  Download,
  Copy
} from "lucide-react"
import { jobsApi } from "@/lib/admin/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Job {
  id: string
  type: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  progress: number
  data?: Record<string, any>
  result?: Record<string, any>
  error?: string
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  logs?: Array<{
    timestamp: string
    level: 'info' | 'warning' | 'error'
    message: string
  }>
}

const adminPath = "/admin/dashboard"

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
}

function formatDuration(start?: string | null, end?: string | null): string {
  if (!start) return "Not started"
  const startTime = new Date(start).getTime()
  const endTime = end ? new Date(end).getTime() : Date.now()
  const duration = Math.floor((endTime - startTime) / 1000)
  
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60
  
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

function getStatusIcon(status: string) {
  switch(status) {
    case 'COMPLETED':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'RUNNING':
      return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
    case 'PENDING':
      return <Clock className="h-5 w-5 text-yellow-500" />
    case 'FAILED':
      return <XCircle className="h-5 w-5 text-red-500" />
    case 'CANCELLED':
      return <AlertCircle className="h-5 w-5 text-gray-500" />
    default:
      return null
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    COMPLETED: "default",
    RUNNING: "secondary",
    PENDING: "outline",
    FAILED: "destructive",
    CANCELLED: "outline",
  }
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>
}

export default function JobDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login")
      return
    }
    if (user?.role !== "ADMIN") {
      router.replace("/admin/login")
      return
    }
    loadJob()
    
    // Auto-refresh toutes les 5 secondes si le job est en cours
    const interval = setInterval(() => {
      if (job?.status === 'RUNNING' || job?.status === 'PENDING') {
        loadJob(true)
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [authLoading, user, jobId, job?.status])

  const loadJob = async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)
    
    try {
      const response = await jobsApi.get(jobId)
      if (response.success) {
        setJob(response.data as Job)
      } else {
        toast.error("Job not found")
        router.push(`${adminPath}/jobs`)
      }
    } catch (error) {
      console.error("Failed to load job:", error)
      toast.error("Failed to load job")
      router.push(`${adminPath}/jobs`)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRetry = async () => {
    try {
      const response = await jobsApi.retry(jobId)
      if (response.success) {
        toast.success("Job retried successfully")
        loadJob()
      } else {
        toast.error(response.error || "Failed to retry job")
      }
    } catch (error) {
      toast.error("Failed to retry job")
    }
  }

  const handleCancel = async () => {
    try {
      const response = await jobsApi.cancel(jobId)
      if (response.success) {
        toast.success("Job cancelled successfully")
        loadJob()
      } else {
        toast.error(response.error || "Failed to cancel job")
      }
    } catch (error) {
      toast.error("Failed to cancel job")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await jobsApi.delete(jobId)
      if (response.success) {
        toast.success("Job deleted successfully")
        router.push(`${adminPath}/jobs`)
      } else {
        toast.error(response.error || "Failed to delete job")
      }
    } catch (error) {
      toast.error("Failed to delete job")
    }
  }

  const handleCopyData = () => {
    if (!job) return
    navigator.clipboard.writeText(JSON.stringify(job.data || job.result, null, 2))
    toast.success("Copied to clipboard")
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="flex h-16 items-center gap-4 px-6">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) return null

  const canRetry = job.status === 'FAILED' || job.status === 'CANCELLED'
  const canCancel = job.status === 'RUNNING' || job.status === 'PENDING'
  const isFinished = job.status === 'COMPLETED' || job.status === 'FAILED' || job.status === 'CANCELLED'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`${adminPath}/jobs`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{job.type.replace(/_/g, " ")}</h1>
              <p className="text-sm text-muted-foreground">ID: {job.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadJob(true)} 
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {canRetry && (
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <Play className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
            
            {canCancel && (
              <Button variant="outline" size="sm" onClick={handleCancel} className="text-destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
            
            {isFinished && (
              <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Job Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {getStatusIcon(job.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status</span>
                      {getStatusBadge(job.status)}
                    </div>
                    {job.status === 'RUNNING' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(job.createdAt)}</span>
                </div>
                {job.startedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started</span>
                    <span>{formatDate(job.startedAt)}</span>
                  </div>
                )}
                {job.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span>{formatDate(job.completedAt)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{formatDuration(job.startedAt, job.completedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Job Data */}
            {(job.data || job.result) && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Job Data</CardTitle>
                  <Button variant="ghost" size="icon" onClick={handleCopyData}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
                    {JSON.stringify(job.data || job.result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Error Message */}
            {job.error && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-destructive/10 p-4 rounded-lg">
                    <p className="text-sm font-mono text-destructive">{job.error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Logs */}
            {job.logs && job.logs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {job.logs.map((log, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "shrink-0",
                            log.level === 'error' && 'text-destructive border-destructive',
                            log.level === 'warning' && 'text-yellow-600 border-yellow-600'
                          )}
                        >
                          {log.level}
                        </Badge>
                        <span className="font-mono">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Job Info */}
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{job.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(job.status)}
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Progress</span>
                  <span>{job.progress}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`${adminPath}/jobs?type=${job.type}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Similar Jobs
                  </Link>
                </Button>
                
                {job.result && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a 
                      href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(job.result, null, 2))}`}
                      download={`job-${job.id}-result.json`}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Result
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Related Links */}
            <Card>
              <CardHeader>
                <CardTitle>Related</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {job.type.includes('IMPORT') && (
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href={`${adminPath}/imports`}>
                      View Imports
                    </Link>
                  </Button>
                )}
                {job.type.includes('SCORING') && (
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href={`${adminPath}/analytics/foryou`}>
                      View For You Analytics
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}