import { Suspense } from "react"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { UsersList } from "@/components/admin/users-list"
import { UserPlus } from "lucide-react"

// 🔹 Base path pour les routes admin
const adminPath = "/admin/dashboard"

export default function UsersPage() {
  return (
    <div>
      <AdminHeader
        title="Users"
        description="Manage platform users"
        actions={
          <Button asChild>
            <Link href={`${adminPath}/users/new`}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Link>
          </Button>
        }
      />

      <div className="p-6">
        <Suspense fallback={null}>
          <UsersList />
        </Suspense>
      </div>
    </div>
  )
}