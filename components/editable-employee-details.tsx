"\"use client"

import { useState } from "react"
import { Edit, Check, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface EditableEmployeeDetailsProps {
  employee: any
}

export function EditableEmployeeDetails({ employee }: EditableEmployeeDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(employee.first_name)
  const [lastName, setLastName] = useState(employee.last_name)
  const [email, setEmail] = useState(employee.email || "")
  const [mobilePhone, setMobilePhone] = useState(employee.mobile_phone || "")
  const [monthlySalary, setMonthlySalary] = useState(employee.monthly_salary || 0)
  const [hourlyRate, setHourlyRate] = useState(employee.hourly_rate || 0)
  const [contractualHoursPerWeek, setContractualHoursPerWeek] = useState(employee.contractual_hours_per_week || 0)

  const handleSave = () => {
    // Implement save logic here (e.g., API call)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFirstName(employee.first_name)
    setLastName(employee.last_name)
    setEmail(employee.email || "")
    setMobilePhone(employee.mobile_phone || "")
    setMonthlySalary(employee.monthly_salary || 0)
    setHourlyRate(employee.hourly_rate || 0)
    setContractualHoursPerWeek(employee.contractual_hours_per_week || 0)
  }

  return (
    <div>
      {isEditing ? (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-1">
            <div className="text-sm font-medium text-muted-foreground">First Name</div>
            <Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="text-sm font-medium text-muted-foreground">Last Name</div>
            <Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="text-sm font-medium text-muted-foreground">Email</div>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="text-sm font-medium text-muted-foreground">Mobile Phone</div>
            <Input type="text" value={mobilePhone} onChange={(e) => setMobilePhone(e.target.value)} />
          </div>

          {employee.employment_type === "full-time" && (
            <>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium text-muted-foreground">Monthly Salary</div>
                <Input type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(Number(e.target.value))} />
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium text-muted-foreground">Contractual Hours Per Week</div>
                <Input
                  type="number"
                  value={contractualHoursPerWeek}
                  onChange={(e) => setContractualHoursPerWeek(Number(e.target.value))}
                />
              </div>
            </>
          )}

          {employee.employment_type === "part-time" && (
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">Hourly Rate</div>
              <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-1">
            <div className="text-sm font-medium text-muted-foreground">Name</div>
            <div>
              {firstName} {lastName}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="text-sm font-medium text-muted-foreground">Email</div>
            <div>{email || "N/A"}</div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="text-sm font-medium text-muted-foreground">Mobile Phone</div>
            <div>{mobilePhone || "N/A"}</div>
          </div>

          {employee.employment_type === "full-time" && (
            <>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium text-muted-foreground">Monthly Salary</div>
                <div>{formatCurrency(monthlySalary)}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium text-muted-foreground">Contractual Hours Per Week</div>
                <div>{contractualHoursPerWeek}</div>
              </div>
            </>
          )}

          {employee.employment_type === "part-time" && (
            <div className="grid grid-cols-2 gap-1">
              <div className="text-sm font-medium text-muted-foreground">Hourly Rate</div>
              <div>{formatCurrency(hourlyRate)}</div>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
        </div>
      )}
    </div>
  )
}
