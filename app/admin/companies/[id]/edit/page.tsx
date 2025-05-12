"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

export default function EditCompanyPage({ params }) {
  const { id } = params
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [company, setCompany] = useState({
    name: "",
    slug: "",
    active: true,
  })

  useEffect(() => {
    async function fetchCompany() {
      try {
        const { data, error } = await supabase.from("companies").select("*").eq("id", id).single()

        if (error) {
          console.error("Error fetching company:", error)
          toast({
            title: "Error",
            description: "Failed to load company details",
            variant: "destructive",
          })
          router.push("/admin/companies")
          return
        }

        if (data) {
          setCompany(data)
        }
      } catch (error) {
        console.error("Error fetching company:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [id, supabase, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setCompany((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked) => {
    setCompany((prev) => ({ ...prev, active: checked }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validate slug format (lowercase, no spaces, only hyphens)
      const slugRegex = /^[a-z0-9-]+$/
      if (!slugRegex.test(company.slug)) {
        toast({
          title: "Invalid Slug",
          description: "Slug must contain only lowercase letters, numbers, and hyphens",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      // Check if slug is unique (except for current company)
      const { data: existingCompany, error: checkError } = await supabase
        .from("companies")
        .select("id")
        .eq("slug", company.slug)
        .neq("id", id)
        .single()

      if (existingCompany) {
        toast({
          title: "Slug Already Exists",
          description: "Please choose a different slug",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      const { error } = await supabase
        .from("companies")
        .update({
          name: company.name,
          slug: company.slug,
          active: company.active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Company updated successfully",
      })

      router.push("/admin/companies")
    } catch (error) {
      console.error("Error updating company:", error)
      toast({
        title: "Error",
        description: "Failed to update company",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <p>Loading company details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Company</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" name="name" value={company.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Company Slug
                <span className="text-sm text-muted-foreground ml-2">(Used in URL: /{company.slug}/payslips)</span>
              </Label>
              <Input
                id="slug"
                name="slug"
                value={company.slug}
                onChange={handleChange}
                required
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
              />
              <p className="text-sm text-muted-foreground">Only lowercase letters, numbers, and hyphens. No spaces.</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="active" checked={company.active} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="active">Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/companies")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
