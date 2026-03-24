"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { StatsCard } from "@/components/admin/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adsApi } from "@/lib/admin/api-client"
import { Eye, MousePointer, ShoppingCart, DollarSign, TrendingUp, Target } from "lucide-react"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AdsPerformance {
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  conversionRate: number
  spend: number
  revenue: number
  roas: number
  byPlatform: Array<{
    platform: string
    count: number
    spend: number
    revenue: number
  }>
  byCampaign: Array<{
    campaignId: string
    count: number
    spend: number
    revenue: number
  }>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

export default function AdsPage() {
  const [performance, setPerformance] = useState<AdsPerformance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [platformFilter, setPlatformFilter] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [platformFilter])

  async function loadData() {
    setIsLoading(true)
    try {
      const params: Record<string, string | number | boolean | undefined> = {}
      if (platformFilter && platformFilter !== "all") params.platform = platformFilter

      const response = await adsApi.performance(params)
      if (response.success) {
        setPerformance(response.data as AdsPerformance)
      }
    } catch (error) {
      console.error("Failed to load ads data:", error)
      toast.error("Failed to load ads data")
    } finally {
      setIsLoading(false)
    }
  }

  const platformData = performance?.byPlatform || []

  return (
    <div>
      <AdminHeader title="Ads Intelligence" description="Monitor advertising performance across platforms" />

      <div className="p-6 space-y-6">
        {/* Platform Filter */}
        <div className="flex justify-end">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="META">Meta</SelectItem>
              <SelectItem value="TIKTOK">TikTok</SelectItem>
              <SelectItem value="GOOGLE">Google</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Performance Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Impressions" value={performance?.impressions?.toLocaleString() || 0} icon={Eye} />
          <StatsCard
            title="Clicks"
            value={performance?.clicks?.toLocaleString() || 0}
            icon={MousePointer}
            description={`${performance?.ctr?.toFixed(2) || 0}% CTR`}
          />
          <StatsCard
            title="Conversions"
            value={performance?.conversions?.toLocaleString() || 0}
            icon={ShoppingCart}
            description={`${performance?.conversionRate?.toFixed(2) || 0}% rate`}
          />
          <StatsCard title="ROAS" value={`${performance?.roas?.toFixed(2) || 0}x`} icon={TrendingUp} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StatsCard title="Total Spend" value={formatCurrency(performance?.spend || 0)} icon={DollarSign} />
          <StatsCard title="Total Revenue" value={formatCurrency(performance?.revenue || 0)} icon={Target} />
        </div>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="platform" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "spend" || name === "revenue") {
                        return formatCurrency(value)
                      }
                      return value
                    }}
                  />
                  <Bar dataKey="count" name="Events" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        {performance?.byCampaign && performance.byCampaign.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performance.byCampaign.map((campaign) => (
                  <div
                    key={campaign.campaignId}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{campaign.campaignId}</p>
                      <p className="text-sm text-muted-foreground">{campaign.count} events</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(campaign.revenue)}</p>
                      <p className="text-sm text-muted-foreground">Spend: {formatCurrency(campaign.spend)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
