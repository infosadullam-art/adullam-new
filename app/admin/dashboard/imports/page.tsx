"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { importApi, jobsApi } from "@/lib/admin/api-client"
import { 
  Upload, 
  FileJson, 
  RefreshCw, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Eye, 
  GitBranch, // Remplacé Pipeline par GitBranch
  Activity,
  GitMerge
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { PipelineDashboard } from "@/components/pipeline-dashboard"

interface ImportBatch {
  id: string
  source: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  totalItems: number
  processedItems: number
  duplicatesFound: number
  fakesDetected: number
  errors?: Array<{
    row: number
    message: string
  }>
  file?: string
  createdBy?: {
    id: string
    name: string
  }
  createdAt: string
  completedAt?: string
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 🔹 Base path pour les routes admin
const adminPath = "/admin/dashboard"

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    COMPLETED: "default",
    PROCESSING: "secondary",
    PENDING: "outline",
    FAILED: "destructive",
  }
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>
}

function getStatusIcon(status: string) {
  switch(status) {
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'PROCESSING':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'PENDING':
      return <Clock className="h-4 w-4 text-gray-500" />
    case 'FAILED':
      return <AlertCircle className="h-4 w-4 text-destructive" />
    default:
      return null
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export default function ImportsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [batches, setBatches] = useState<ImportBatch[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [source, setSource] = useState("MANUAL")
  const [activeTab, setActiveTab] = useState("batches")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🔹 Vérifie l'auth
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/admin/login")
        return
      }
      if (user.role !== "ADMIN") {
        router.replace("/admin/login")
        return
      }
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user && activeTab === "batches") {
      loadBatches()
    }
  }, [page, user, activeTab])

  async function loadBatches() {
    setIsLoading(true)
    try {
      const response = await importApi.list({ page, limit: 20 })
      if (response.success) {
        setBatches(response.data as ImportBatch[])
        setMeta(response.meta as Meta)
      } else {
        toast.error(response.error || "Failed to load import batches")
      }
    } catch (error) {
      console.error("Failed to load imports:", error)
      toast.error("Failed to load import batches")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      toast.error("Please select a file")
      return
    }

    setIsUploading(true)
    try {
      const content = await file.text()
      const data = JSON.parse(content)

      const response = await importApi.create({
        source,
        data: Array.isArray(data) ? data : [data],
      })

      if (response.success) {
        toast.success("Import started successfully")
        setIsDialogOpen(false)
        loadBatches()
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        toast.error(response.error || "Failed to start import")
      }
    } catch (error) {
      console.error("Failed to upload:", error)
      toast.error("Failed to start import. Check your JSON file format.")
    } finally {
      setIsUploading(false)
    }
  }

  const columns = [
    {
      key: "source",
      header: "Source",
      cell: (batch: ImportBatch) => (
        <Link 
          href={`${adminPath}/imports/${batch.id}`}
          className="flex items-center gap-2 hover:bg-muted/50 p-2 rounded-lg transition-colors group"
        >
          <FileJson className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium group-hover:text-primary">{batch.source}</span>
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (batch: ImportBatch) => (
        <Link 
          href={`${adminPath}/imports?status=${batch.status}`}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          {getStatusIcon(batch.status)}
          {getStatusBadge(batch.status)}
        </Link>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      cell: (batch: ImportBatch) => {
        const progress = batch.totalItems > 0 ? Math.round((batch.processedItems / batch.totalItems) * 100) : 0
        return (
          <Link 
            href={`${adminPath}/imports/${batch.id}`}
            className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Progress value={progress} className="w-20 h-2" />
              <span className="text-sm text-muted-foreground">
                {batch.processedItems}/{batch.totalItems}
              </span>
            </div>
            {batch.status === 'PROCESSING' && (
              <p className="text-xs text-muted-foreground mt-1">
                {progress}% complete
              </p>
            )}
          </Link>
        )
      },
    },
    {
      key: "duplicates",
      header: "Duplicates",
      cell: (batch: ImportBatch) => (
        <Link 
          href={`${adminPath}/imports/${batch.id}?tab=duplicates`}
          className={`block p-2 rounded-lg hover:bg-muted/50 transition-colors ${
            batch.duplicatesFound > 0 ? 'text-yellow-600' : ''
          }`}
        >
          <span className="font-medium">{batch.duplicatesFound}</span>
          {batch.duplicatesFound > 0 && (
            <p className="text-xs text-muted-foreground">Click to review</p>
          )}
        </Link>
      ),
    },
    {
      key: "fakes",
      header: "Fakes",
      cell: (batch: ImportBatch) => (
        <Link 
          href={`${adminPath}/imports/${batch.id}?tab=fakes`}
          className={`block p-2 rounded-lg hover:bg-muted/50 transition-colors ${
            batch.fakesDetected > 0 ? 'text-destructive' : ''
          }`}
        >
          <span className="font-medium">{batch.fakesDetected}</span>
          {batch.fakesDetected > 0 && (
            <p className="text-xs text-muted-foreground">Click to review</p>
          )}
        </Link>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (batch: ImportBatch) => (
        <Link 
          href={`${adminPath}/imports/${batch.id}`}
          className="flex items-center gap-1 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(batch.createdAt)}</span>
        </Link>
      ),
    },
    {
      key: "createdBy",
      header: "Created By",
      cell: (batch: ImportBatch) => (
        batch.createdBy ? (
          <Link 
            href={`${adminPath}/users/${batch.createdBy.id}`}
            className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm hover:text-primary">{batch.createdBy.name}</span>
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground p-2">—</span>
        )
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      cell: (batch: ImportBatch) => (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`${adminPath}/imports/${batch.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ]

  // Loading state
  if (authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Auth check
  if (!user || user.role !== "ADMIN") {
    return null
  }

  const processingCount = batches.filter(b => b.status === "PROCESSING").length
  const completedCount = batches.filter(b => b.status === "COMPLETED").length
  const failedCount = batches.filter(b => b.status === "FAILED").length

  return (
    <div>
      <AdminHeader
        title="Imports"
        description="Manage product imports and data ingestion"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadBatches}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  New Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Products</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select value={source} onValueChange={setSource}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANUAL">Manual Upload</SelectItem>
                        <SelectItem value="JUMIA">Jumia</SelectItem>
                        <SelectItem value="ALIBABA">Alibaba</SelectItem>
                        <SelectItem value="SUPPLIER_API">Supplier API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>JSON File</Label>
                    <Input ref={fileInputRef} type="file" accept=".json" />
                    <p className="text-xs text-muted-foreground">
                      Upload a JSON file containing an array of products
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Example: [{"{"}"sku": "PROD1", "title": "Product 1"{"}"}]
                    </p>
                  </div>
                  <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                    {isUploading ? "Uploading..." : "Start Import"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="batches">Import Batches</TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <GitBranch className="h-4 w-4" /> {/* Remplacé Pipeline par GitBranch */}
              Pipeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="batches" className="space-y-6">
            {/* Statistics Cards */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Import Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <Link 
                    href={`${adminPath}/imports`}
                    className="block p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm text-muted-foreground">Total Batches</p>
                    <p className="text-2xl font-bold">{meta?.total || 0}</p>
                  </Link>
                  <Link 
                    href={`${adminPath}/imports?status=PROCESSING`}
                    className="block p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm text-muted-foreground">Processing</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {processingCount}
                    </p>
                  </Link>
                  <Link 
                    href={`${adminPath}/imports?status=COMPLETED`}
                    className="block p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {completedCount}
                    </p>
                  </Link>
                  <Link 
                    href={`${adminPath}/imports?status=FAILED`}
                    className="block p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-destructive">
                      {failedCount}
                    </p>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Imports Table */}
            <DataTable
              columns={columns}
              data={batches}
              isLoading={isLoading}
              pagination={
                meta
                  ? {
                      page: meta.page,
                      totalPages: meta.totalPages,
                      onPageChange: setPage,
                    }
                  : undefined
              }
              emptyMessage="No import batches found"
            />
          </TabsContent>

          <TabsContent value="pipeline">
            <PipelineDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}