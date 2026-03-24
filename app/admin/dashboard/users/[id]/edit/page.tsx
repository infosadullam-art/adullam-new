"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, X, Upload } from "lucide-react"
import { usersApi } from "@/lib/admin/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  id: string
  email: string
  name?: string
  phone?: string
  avatar?: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SELLER' | 'USER'
  isActive: boolean
  emailVerified: boolean
  phoneVerified: boolean
  address?: {
    street?: string
    city?: string
    country?: string
    postalCode?: string
  }
}

const adminPath = "/admin/dashboard"

export default function EditUserPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    phone: "",
    role: "USER",
    isActive: true,
    emailVerified: false,
    phoneVerified: false,
    address: {
      street: "",
      city: "",
      country: "",
      postalCode: "",
    },
  })

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/admin/login")
      return
    }
    if (currentUser?.role !== "ADMIN" && currentUser?.role !== "SUPER_ADMIN") {
      router.replace("/admin/login")
      return
    }
    loadUser()
  }, [authLoading, currentUser, userId])

  const loadUser = async () => {
    try {
      const response = await usersApi.get(userId)
      if (response.success) {
        setFormData(response.data as User)
      } else {
        toast.error("User not found")
        router.push(`${adminPath}/users`)
      }
    } catch (error) {
      console.error("Failed to load user:", error)
      toast.error("Failed to load user")
      router.push(`${adminPath}/users`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await usersApi.update(userId, formData)
      if (response.success) {
        toast.success("User updated successfully")
        router.push(`${adminPath}/users/${userId}`)
      } else {
        toast.error(response.error || "Failed to update user")
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      toast.error("Failed to update user")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Simuler upload
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error("Failed to upload avatar")
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN"

  return (
    <div>
      <AdminHeader
        title="Edit User"
        description={`Editing user: ${formData.email}`}
        backButton={
          <Button variant="ghost" size="icon" asChild>
            <Link href={`${adminPath}/users/${userId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`${adminPath}/users/${userId}`}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              {isSuperAdmin && <TabsTrigger value="permissions">Permissions</TabsTrigger>}
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 border-2 border-primary/10">
                        <AvatarImage src={formData.avatar} />
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                          {formData.name?.charAt(0) || formData.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <label className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarUpload}
                            />
                          </label>
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Recommended: Square image, at least 200x200px
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Status Toggles */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="isActive">Account Status</Label>
                        <p className="text-sm text-muted-foreground">
                          Activate or deactivate user account
                        </p>
                      </div>
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailVerified">Email Verification</Label>
                        <p className="text-sm text-muted-foreground">
                          Mark email as verified
                        </p>
                      </div>
                      <Switch
                        id="emailVerified"
                        checked={formData.emailVerified}
                        onCheckedChange={(checked) => setFormData({ ...formData, emailVerified: checked })}
                      />
                    </div>

                    {formData.phone && (
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="phoneVerified">Phone Verification</Label>
                          <p className="text-sm text-muted-foreground">
                            Mark phone as verified
                          </p>
                        </div>
                        <Switch
                          id="phoneVerified"
                          checked={formData.phoneVerified}
                          onCheckedChange={(checked) => setFormData({ ...formData, phoneVerified: checked })}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address">
              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={formData.address?.street || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value }
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.address?.city || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={formData.address?.postalCode || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, postalCode: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.address?.country || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, country: e.target.value }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isSuperAdmin && (
              <TabsContent value="permissions">
                <Card>
                  <CardHeader>
                    <CardTitle>User Permissions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">User Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value as User['role'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="SELLER">Seller</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </form>
      </div>
    </div>
  )
}