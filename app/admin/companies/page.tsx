import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Pencil, Trash2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Companies | Payroll System",
  description: "Manage companies in the payroll system",
}

// Mock data for companies
const mockCompanies = [
  {
    id: 1,
    name: "Acme Corporation",
    slug: "acme-corp",
    address: "123 Business Ave, Suite 100, New York, NY 10001",
    adminCount: 1,
    employeeCount: 4,
  },
  {
    id: 2,
    name: "TechSolutions Inc.",
    slug: "tech-solutions",
    address: "456 Innovation Drive, San Francisco, CA 94105",
    adminCount: 1,
    employeeCount: 4,
  },
  {
    id: 3,
    name: "Global Enterprises",
    slug: "global-enterprises",
    address: "789 Corporate Blvd, Chicago, IL 60601",
    adminCount: 1,
    employeeCount: 3,
  },
]

export default function CompaniesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Companies</h1>
        <Button asChild>
          <Link href="/admin/companies/new">
            <Building className="mr-2 h-4 w-4" />
            Add Company
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <CardDescription>Manage companies in the payroll system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 bg-muted/50 font-medium">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Slug</div>
              <div className="col-span-4">Address</div>
              <div className="col-span-2">Users</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y">
              {mockCompanies.map((company) => (
                <div key={company.id} className="grid grid-cols-12 p-4 items-center">
                  <div className="col-span-3 font-medium">{company.name}</div>
                  <div className="col-span-2 text-sm">{company.slug}</div>
                  <div className="col-span-4 text-sm truncate">{company.address}</div>
                  <div className="col-span-2">
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit">
                        {company.adminCount} Admin{company.adminCount !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="outline" className="w-fit">
                        {company.employeeCount} Employee{company.employeeCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/companies/${company.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
