"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Pencil, Trash2, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [companyToDelete, setCompanyToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchCompanies() {
      try {
        // Only fetch active companies (not soft-deleted)
        const { data, error } = await supabase.from("companies").select("*").eq("active", true).order("name")

        if (error) {
          console.error("Error fetching companies:", error)
          return
        }

        setCompanies(data || [])
      } catch (error) {
        console.error("Error fetching companies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [supabase])

  const handleEdit = (companyId) => {
    router.push(`/admin/companies/${companyId}/edit`)
  }

  const handleDeleteClick = (company) => {
    setCompanyToDelete(company)
  }

  const handleDelete = async () => {
    if (!companyToDelete) return

    setIsDeleting(true)

    try {
      // Instead of deleting, update the company to set active = false
      const { error } = await supabase.from("companies").update({ active: false }).eq("id", companyToDelete.id)

      if (error) {
        console.error("Error soft-deleting company:", error)
        toast({
          title: "Error",
          description: "Failed to delete company. Please try again.",
          variant: "destructive",
        })
        setIsDeleting(false)
        return
      }

      // Update the local state to remove the company
      setCompanies(companies.filter((company) => company.id !== companyToDelete.id))

      toast({
        title: "Company deleted",
        description: `${companyToDelete.name} has been deleted.`,
      })
    } catch (error) {
      console.error("Error soft-deleting company:", error)
      toast({
        title: "Error",
        description: "Failed to delete company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setCompanyToDelete(null)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Companies</h1>
        <Button onClick={() => router.push("/admin/companies/new")}>Add Company</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading companies...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.slug}</TableCell>
                      <TableCell>
                        <Badge variant={company.active ? "success" : "destructive"}>
                          {company.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(company.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteClick(company)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={companyToDelete !== null} onOpenChange={(open) => !open && setCompanyToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
              Delete Company
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {companyToDelete?.name}? This will hide the company and all its data from
              the system. Associated users will no longer be able to access this company.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompanyToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
