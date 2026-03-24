"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, X } from "lucide-react"
import { usersApi } from "@/lib/admin/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

// 🔹 Base path pour les routes admin
const adminPath = "/admin/dashboard"

export default function NewUserPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "USER",
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await usersApi.create(formData)
      if (response.success && response.data) {
        toast.success("User created successfully")
        router.push(`${adminPath}/users/${response.data.id}`)
      } else {
        toast.error(response.error || "Failed to create user")
      }
    } catch (error) {
      console.error("Failed to create user:", error)
      toast.error("Failed to create user")
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div>
      <AdminHeader
        title="New User"
        description="Create a new user account"
        backButton={
          <Button variant="ghost" size="icon" asChild>
            <Link href={`${adminPath}/users`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`${adminPath}/users`}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Creating..." : "Create User"}
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="SELLER">Seller</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Active Account</Label>
                  <p className="text-sm text-muted-foreground">
                    User can log in immediately
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}