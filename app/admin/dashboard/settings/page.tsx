"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Save,
  Globe,
  Mail,
  Shield,
  Bell,
  Palette,
  CreditCard,
  Truck,
  Percent,
  Database,
  Key,
  Users,
  Store,
  Eye,
  Lock,
  Image,
  FileText,
  Clock,
  Zap,
  Sparkles,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  // General settings
  const [siteName, setSiteName] = useState("Adullam Commerce")
  const [siteDescription, setSiteDescription] = useState("AI-powered e-commerce platform")
  const [contactEmail, setContactEmail] = useState("contact@adullam.com")
  const [supportEmail, setSupportEmail] = useState("support@adullam.com")
  const [timezone, setTimezone] = useState("UTC")
  const [currency, setCurrency] = useState("USD")
  const [language, setLanguage] = useState("en")

  // Feature flags
  const [enableDeduplication, setEnableDeduplication] = useState(true)
  const [enableFakeDetection, setEnableFakeDetection] = useState(true)
  const [enableForYou, setEnableForYou] = useState(true)
  const [enableAds, setEnableAds] = useState(false)
  const [enableReviews, setEnableReviews] = useState(true)
  const [enableWishlist, setEnableWishlist] = useState(true)
  const [enableNotifications, setEnableNotifications] = useState(true)
  const [enableVideoCommerce, setEnableVideoCommerce] = useState(true)

  // Import settings
  const [autoProcessImports, setAutoProcessImports] = useState(true)
  const [importBatchSize, setImportBatchSize] = useState("100")
  const [deduplicationThreshold, setDeduplicationThreshold] = useState("85")
  const [fakeDetectionThreshold, setFakeDetectionThreshold] = useState("70")
  const [allowedFileTypes, setAllowedFileTypes] = useState(["json", "csv", "xml"])

  // Security settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState("60")
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5")
  const [passwordMinLength, setPasswordMinLength] = useState("8")
  const [requireEmailVerification, setRequireEmailVerification] = useState(true)

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [slackWebhook, setSlackWebhook] = useState("")
  const [notifyOnImport, setNotifyOnImport] = useState(true)
  const [notifyOnFakeDetection, setNotifyOnFakeDetection] = useState(true)
  const [notifyOnJobFailure, setNotifyOnJobFailure] = useState(true)

  // Appearance settings
  const [theme, setTheme] = useState("system")
  const [primaryColor, setPrimaryColor] = useState("#0066FF")
  const [logo, setLogo] = useState("/logo.png")
  const [favicon, setFavicon] = useState("/favicon.ico")

  async function handleSave(tab: string) {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success(`${tab} settings saved successfully`)
    } catch (error) {
      toast.error(`Failed to save ${tab} settings`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      toast.success("Settings reset to default")
    }
  }

  return (
    <div>
      <AdminHeader 
        title="Settings" 
        description="Configure platform settings and preferences"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={() => handleSave(activeTab)} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="general" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Site Information</CardTitle>
                  <CardDescription>Basic information about your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input 
                        id="siteName" 
                        value={siteName} 
                        onChange={(e) => setSiteName(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Europe/Paris">Paris</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Input
                      id="siteDescription"
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="JPY">JPY (¥)</SelectItem>
                          <SelectItem value="CNY">CNY (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Core Features</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Deduplication</Label>
                          <p className="text-sm text-muted-foreground">Automatically detect and merge duplicate products</p>
                        </div>
                        <Switch checked={enableDeduplication} onCheckedChange={setEnableDeduplication} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Fake Detection</Label>
                          <p className="text-sm text-muted-foreground">AI-powered counterfeit product detection</p>
                        </div>
                        <Switch checked={enableFakeDetection} onCheckedChange={setEnableFakeDetection} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>For You Feed</Label>
                          <p className="text-sm text-muted-foreground">Personalized product recommendations</p>
                        </div>
                        <Switch checked={enableForYou} onCheckedChange={setEnableForYou} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">User Features</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Reviews & Ratings</Label>
                          <p className="text-sm text-muted-foreground">Allow users to review products</p>
                        </div>
                        <Switch checked={enableReviews} onCheckedChange={setEnableReviews} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Wishlist</Label>
                          <p className="text-sm text-muted-foreground">Allow users to save products to wishlist</p>
                        </div>
                        <Switch checked={enableWishlist} onCheckedChange={setEnableWishlist} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Video Commerce</Label>
                          <p className="text-sm text-muted-foreground">Enable product videos and feeds</p>
                        </div>
                        <Switch checked={enableVideoCommerce} onCheckedChange={setEnableVideoCommerce} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Monetization</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Advertisements</Label>
                          <p className="text-sm text-muted-foreground">Display sponsored products and ads</p>
                        </div>
                        <Switch checked={enableAds} onCheckedChange={setEnableAds} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Notifications</Label>
                          <p className="text-sm text-muted-foreground">Send push notifications to users</p>
                        </div>
                        <Switch checked={enableNotifications} onCheckedChange={setEnableNotifications} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Settings */}
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Import Settings</CardTitle>
                <CardDescription>Configure product import behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Process Imports</Label>
                    <p className="text-sm text-muted-foreground">Automatically start processing new import batches</p>
                  </div>
                  <Switch checked={autoProcessImports} onCheckedChange={setAutoProcessImports} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchSize">Import Batch Size</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={importBatchSize}
                      onChange={(e) => setImportBatchSize(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Number of products to process per batch</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dedupThreshold">Deduplication Threshold (%)</Label>
                    <Input
                      id="dedupThreshold"
                      type="number"
                      value={deduplicationThreshold}
                      onChange={(e) => setDeduplicationThreshold(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Similarity threshold for duplicates</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fakeThreshold">Fake Detection Threshold (%)</Label>
                    <Input
                      id="fakeThreshold"
                      type="number"
                      value={fakeDetectionThreshold}
                      onChange={(e) => setFakeDetectionThreshold(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Confidence threshold for fake detection</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Allowed File Types</Label>
                    <div className="flex gap-2">
                      {allowedFileTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          .{type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure platform security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                  </div>
                  <Switch checked={requireEmailVerification} onCheckedChange={setRequireEmailVerification} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      value={maxLoginAttempts}
                      onChange={(e) => setMaxLoginAttempts(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordLength">Min Password Length</Label>
                    <Input
                      id="passwordLength"
                      type="number"
                      value={passwordMinLength}
                      onChange={(e) => setPasswordMinLength(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                  <Input
                    id="slackWebhook"
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notify me when:</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Import batches complete</Label>
                      <Switch checked={notifyOnImport} onCheckedChange={setNotifyOnImport} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Fake products detected</Label>
                      <Switch checked={notifyOnFakeDetection} onCheckedChange={setNotifyOnFakeDetection} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Background jobs fail</Label>
                      <Switch checked={notifyOnJobFailure} onCheckedChange={setNotifyOnJobFailure} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                      placeholder="#0066FF"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex gap-4 items-center">
                    <div className="h-16 w-16 bg-muted rounded-lg overflow-hidden">
                      <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Image className="mr-2 h-4 w-4" />
                      Upload New
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="flex gap-4 items-center">
                    <div className="h-8 w-8 bg-muted rounded overflow-hidden">
                      <img src={favicon} alt="Favicon" className="h-full w-full object-cover" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Image className="mr-2 h-4 w-4" />
                      Upload New
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>System-level configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>API Rate Limiting</Label>
                  <Input type="number" placeholder="Requests per minute" defaultValue="100" />
                  <p className="text-xs text-muted-foreground">Maximum API requests per minute per IP</p>
                </div>

                <div className="space-y-2">
                  <Label>Cache Duration (seconds)</Label>
                  <Input type="number" placeholder="Cache TTL" defaultValue="3600" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-destructive">Danger Zone</Label>
                  <div className="space-y-2">
                    <Button variant="destructive" className="w-full justify-start">
                      <Database className="mr-2 h-4 w-4" />
                      Clear All Cache
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reindex All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Settings(props: any) {
  return <svg {...props} />
}