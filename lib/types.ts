export type Employee = {
  id: number
  first_name: string
  last_name: string
  email?: string
  mobile_phone?: string
  employment_type: "full-time" | "part-time"
  hourly_rate: number | null
  monthly_salary: number | null
  contractual_hours_per_week: number | null
  created_at: string
  updated_at: string
}

export type Allowance = {
  name: string
  amount: number
}

export type Deduction = {
  name: string
  amount: number
}

export type Payslip = {
  id: number
  employee_id: number
  work_period_start: string
  work_period_end: string
  payment_date: string
  regular_hours: number | null
  overtime_hours: number | null
  holiday_hours: number | null
  gross_amount: number
  net_amount: number
  status: "draft" | "issued" | "paid"
  created_at: string
  updated_at: string
  allowances: Allowance[]
  deductions: Deduction[]
  employer_cpf_contribution: number | null
}

export type WorkRecord = {
  id: number
  employee_id: number
  work_date: string
  hours_worked: number
  is_holiday: boolean
  is_overtime: boolean
  notes: string | null
  created_at: string
}

export type EmployeeWithPayslips = Employee & {
  payslips: Payslip[]
}

export type PayslipWithEmployee = Payslip & {
  employee: Employee
}
