"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface PayslipPrintViewProps {
  payslip: any
}

export function PayslipPrintView({ payslip }: PayslipPrintViewProps) {
  const componentRef = useRef(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  })

  // Calculate values for the payslip
  const basicPay =
    payslip.employees.employment_type === "full-time"
      ? payslip.employees.monthly_salary
      : (payslip.regular_hours || 0) * payslip.employees.hourly_rate

  const overtimePay =
    payslip.employees.employment_type === "full-time"
      ? (payslip.employees.monthly_salary / (40 * 4.33)) * 1.5 * (payslip.overtime_hours || 0)
      : payslip.employees.hourly_rate * 1.5 * (payslip.overtime_hours || 0)

  const holidayPay =
    payslip.employees.employment_type === "full-time"
      ? (payslip.employees.monthly_salary / (40 * 4.33)) * 2 * (payslip.holiday_hours || 0)
      : payslip.employees.hourly_rate * 2 * (payslip.holiday_hours || 0)

  // Ensure allowances is an array
  const allowances = Array.isArray(payslip.allowances) ? payslip.allowances : []
  const totalAllowances = allowances.reduce((sum: number, allowance: any) => sum + (Number(allowance.amount) || 0), 0)

  // Ensure deductions is an array
  const deductions = Array.isArray(payslip.deductions) ? payslip.deductions : []
  const totalDeductions = deductions.reduce((sum: number, deduction: any) => sum + (Number(deduction.amount) || 0), 0)

  // Format dates
  const formatDateMDY = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handlePrint}>Print Payslip</Button>
      </div>

      <div ref={componentRef} className="p-8 bg-white max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Itemised Pay Slip</h1>
          <div className="flex justify-end mt-2">
            <div className="text-sm">
              <span className="mr-1">For the period:</span>
              <span className="inline-block min-w-[120px] text-center border-b border-gray-400 text-blue-600 font-medium">
                {formatDateMDY(payslip.work_period_start)}
              </span>
              <span className="mx-2">—</span>
              <span className="inline-block min-w-[120px] text-center border-b border-gray-400 text-blue-600 font-medium">
                {formatDateMDY(payslip.work_period_end)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="bg-orange-500 text-white p-2 rounded-t-md">Name of Employer</div>
            <div className="border border-gray-300 p-2 rounded-b-md text-blue-600">Your Company Name</div>
          </div>
          <div>
            <div className="bg-orange-500 text-white p-2 rounded-t-md">Date of Payment</div>
            <div className="border border-gray-300 p-2 rounded-b-md text-blue-600">
              {formatDateMDY(payslip.payment_date)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="bg-orange-500 text-white p-2 rounded-t-md">Name of Employee</div>
            <div className="border border-gray-300 p-2 rounded-b-md text-blue-600">
              {payslip.employees.first_name} {payslip.employees.last_name}
            </div>
          </div>
          <div>
            <div className="bg-orange-500 text-white p-2 rounded-t-md">Mode of Payment</div>
            <div className="border border-gray-300 p-2 rounded-b-md">Bank Transfer</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Left column - Basic pay and deductions */}
          <div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-orange-500 text-white p-2 text-left rounded-tl-md">Item</th>
                  <th className="bg-orange-500 text-white p-2 text-left">Amount</th>
                  <th className="bg-orange-500 text-white p-2 text-left rounded-tr-md w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">Basic Pay</td>
                  <td className="border border-gray-300 p-2 text-blue-600">{formatCurrency(basicPay)}</td>
                  <td className="border border-gray-300 p-2 text-center">(A)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">
                    Total Allowances
                    <div className="text-xs text-gray-500">(Breakdown shown below)</div>
                  </td>
                  <td className="border border-gray-300 p-2 text-blue-600">{formatCurrency(totalAllowances)}</td>
                  <td className="border border-gray-300 p-2 text-center">(B)</td>
                </tr>

                {allowances.length > 0 ? (
                  allowances.map((allowance: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2 pl-4 text-blue-600">{allowance.name}</td>
                      <td className="border border-gray-300 p-2 text-blue-600">
                        {formatCurrency(Number(allowance.amount) || 0)}
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <td className="border border-gray-300 p-2 pl-4 text-blue-600">Transport</td>
                      <td className="border border-gray-300 p-2 text-blue-600">{formatCurrency(0)}</td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 pl-4 text-blue-600">Uniform</td>
                      <td className="border border-gray-300 p-2 text-blue-600">{formatCurrency(0)}</td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  </>
                )}

                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Gross Pay (A + B)</td>
                  <td className="border border-gray-300 p-2 text-blue-600">
                    {formatCurrency(basicPay + totalAllowances)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">(C)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">
                    Total Deductions
                    <div className="text-xs text-gray-500">(Breakdown shown below)</div>
                  </td>
                  <td className="border border-gray-300 p-2 text-blue-600">{formatCurrency(totalDeductions)}</td>
                  <td className="border border-gray-300 p-2 text-center">(D)</td>
                </tr>

                {deductions.length > 0 ? (
                  deductions.map((deduction: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2 pl-4 italic">{deduction.name}</td>
                      <td className="border border-gray-300 p-2 text-blue-600">
                        {formatCurrency(Number(deduction.amount) || 0)}
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <td className="border border-gray-300 p-2 pl-4 italic">Employee's CPF Deduction</td>
                      <td className="border border-gray-300 p-2 text-blue-600">{formatCurrency(0)}</td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 pl-4 text-blue-600">Advanced Loan</td>
                      <td className="border border-gray-300 p-2 text-blue-600">{formatCurrency(0)}</td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Right column - Overtime and additional payments */}
          <div>
            <div className="bg-orange-500 text-white p-2 rounded-t-md">Overtime Details</div>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">Overtime Payment Period(s)</td>
                  <td className="border border-gray-300 p-2">
                    {formatDateMDY(payslip.work_period_start)} to {formatDateMDY(payslip.work_period_end)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Overtime Hours Worked</td>
                  <td className="border border-gray-300 p-2">{payslip.overtime_hours || 0}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Total Overtime Pay</td>
                  <td className="border border-gray-300 p-2 text-blue-600">{formatCurrency(overtimePay)}</td>
                  <td className="border border-gray-300 p-2 text-center">(E)</td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse mt-4">
              <thead>
                <tr>
                  <th className="bg-orange-500 text-white p-2 text-left rounded-tl-md">Item</th>
                  <th className="bg-orange-500 text-white p-2 text-left rounded-tr-md">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">
                    Other Additional Payments
                    <div className="text-xs text-gray-500">(Breakdown shown below)</div>
                  </td>
                  <td className="border border-gray-300 p-2 text-blue-600">{formatCurrency(holidayPay)}</td>
                  <td className="border border-gray-300 p-2 text-center">(F)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 pl-4 text-blue-600">Holiday Pay</td>
                  <td className="border border-gray-300 p-2 text-blue-600">{formatCurrency(holidayPay)}</td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Net Pay (C-D+E+F)</td>
                  <td className="border border-gray-300 p-2 text-blue-600">{formatCurrency(payslip.net_amount)}</td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Employer's CPF Contribution</td>
                  <td className="border border-gray-300 p-2 text-blue-600">
                    {formatCurrency(payslip.employer_cpf_contribution || 0)}
                  </td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>This is a computer-generated document. No signature is required.</p>
        </div>
      </div>
    </div>
  )
}
