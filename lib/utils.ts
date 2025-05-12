import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(amount)
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return format(date, "dd-MMM-yyyy")
}

export function formatPeriod(startDate: Date, endDate: Date): string {
  return `${format(startDate, "ddMMMyyyy")}-${format(endDate, "ddMMMyyyy")}`
}

export function calculatePayForFullTime(
  monthlySalary: number,
  overtimeHours: number,
  holidayHours: number,
): { gross: number; net: number } {
  // Assuming overtime is paid at 1.5x rate and holiday at 2x rate
  const hourlyRate = monthlySalary / 160 // Assuming 40 hours per week, 4 weeks per month
  const overtimePay = overtimeHours * hourlyRate * 1.5
  const holidayPay = holidayHours * hourlyRate * 2

  const gross = monthlySalary + overtimePay + holidayPay
  const net = gross // Simplified, in reality would subtract taxes, etc.

  return { gross, net }
}

export function calculatePayForPartTime(
  hourlyRate: number,
  regularHours: number,
  overtimeHours: number,
  holidayHours: number,
): { gross: number; net: number } {
  // Assuming overtime is paid at 1.5x rate and holiday at 2x rate
  const regularPay = regularHours * hourlyRate
  const overtimePay = overtimeHours * hourlyRate * 1.5
  const holidayPay = holidayHours * hourlyRate * 2

  const gross = regularPay + overtimePay + holidayPay
  const net = gross // Simplified, in reality would subtract taxes, etc.

  return { gross, net }
}
