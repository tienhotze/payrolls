"use client"

import { useState } from "react"
import { Edit, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface InlineEditFieldProps {
  label: string
  value: string | number
  type?: "text" | "email" | "number"
  onSave: (value: string | number) => Promise<void>
}

export function InlineEditField({ label, value, type = "text", onSave }: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentValue, setCurrentValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(currentValue)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving field:", error)
      // Reset to original value on error
      setCurrentValue(value)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentValue(value)
  }

  return (
    <div className="grid grid-cols-2 gap-1">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            type={type}
            value={currentValue}
            onChange={(e) => setCurrentValue(type === "number" ? Number(e.target.value) : e.target.value)}
            className="h-8 w-full"
            disabled={isSaving}
          />
          <Button variant="ghost" size="icon" onClick={handleCancel} disabled={isSaving} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving} className="h-8 w-8">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>{value || "N/A"}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
