"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateBreakTime, calculatePayableHours } from "@/lib/work-hours-utils"

interface WorkScheduleInputProps {
  onChange: (schedules: any[]) => void
  value?: any[]
}

export function WorkScheduleInput({ onChange, value = [] }: WorkScheduleInputProps) {
  const [schedules, setSchedules] = useState(value)
  const [activeTab, setActiveTab] = useState("manual")

  const handleAddSchedule = () => {
    const newSchedule = {
      work_date: new Date().toISOString().split("T")[0],
      start_time: "09:00",
      end_time: "17:00",
      scheduled_hours: 8,
      break_time_minutes: 52.8,
      break_time_hours: 0.88,
      payable_hours: 7.12,
    }
    const updatedSchedules = [...schedules, newSchedule]
    setSchedules(updatedSchedules)
    onChange(updatedSchedules)
  }

  const handleRemoveSchedule = (index: number) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index)
    setSchedules(updatedSchedules)
    onChange(updatedSchedules)
  }

  const handleScheduleChange = (index: number, field: string, value: any) => {
    const updatedSchedules = [...schedules]
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      [field]: value,
    }

    // If start_time or end_time changed, recalculate scheduled_hours
    if (field === "start_time" || field === "end_time") {
      const startTime = field === "start_time" ? value : updatedSchedules[index].start_time
      const endTime = field === "end_time" ? value : updatedSchedules[index].end_time

      if (startTime && endTime) {
        // Calculate hours between start and end time
        const start = new Date(`2000-01-01T${startTime}:00`)
        const end = new Date(`2000-01-01T${endTime}:00`)
        const diffMs = end.getTime() - start.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)

        updatedSchedules[index].scheduled_hours = Math.max(0, diffHours)

        // Recalculate break time and payable hours
        const breakTimeMinutes = calculateBreakTime(diffHours)
        updatedSchedules[index].break_time_minutes = breakTimeMinutes
        updatedSchedules[index].break_time_hours = breakTimeMinutes / 60
        updatedSchedules[index].payable_hours = calculatePayableHours(diffHours, breakTimeMinutes)
      }
    }

    setSchedules(updatedSchedules)
    onChange(updatedSchedules)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split("\n")
        const headers = lines[0].split(",")

        const dateIndex = headers.findIndex((h) => h.toLowerCase().includes("date"))
        const startTimeIndex = headers.findIndex((h) => h.toLowerCase().includes("start"))
        const endTimeIndex = headers.findIndex((h) => h.toLowerCase().includes("end"))

        if (dateIndex === -1 || startTimeIndex === -1 || endTimeIndex === -1) {
          throw new Error("CSV must include Date, Start Time, and End Time columns")
        }

        const parsedSchedules = []

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue

          const values = lines[i].split(",")
          const workDate = values[dateIndex].trim()
          const startTime = values[startTimeIndex].trim()
          const endTime = values[endTimeIndex].trim()

          if (!workDate || !startTime || !endTime) continue

          // Calculate hours between start and end time
          const start = new Date(`2000-01-01T${startTime}:00`)
          const end = new Date(`2000-01-01T${endTime}:00`)
          const diffMs = end.getTime() - start.getTime()
          const scheduledHours = diffMs / (1000 * 60 * 60)

          // Calculate break time and payable hours
          const breakTimeMinutes = calculateBreakTime(scheduledHours)
          const breakTimeHours = breakTimeMinutes / 60
          const payableHours = calculatePayableHours(scheduledHours, breakTimeMinutes)

          parsedSchedules.push({
            work_date: workDate,
            start_time: startTime,
            end_time: endTime,
            scheduled_hours: scheduledHours,
            break_time_minutes: breakTimeMinutes,
            break_time_hours: breakTimeHours,
            payable_hours: payableHours,
          })
        }

        setSchedules(parsedSchedules)
        onChange(parsedSchedules)
      } catch (error) {
        console.error("Error parsing CSV:", error)
        alert("Error parsing CSV file. Please ensure it has Date, Start Time, and End Time columns.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="space-y-4">
          {schedules.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-8 gap-2 p-2 font-medium text-sm bg-muted">
                <div>Date</div>
                <div>Start Time</div>
                <div>End Time</div>
                <div>Scheduled Hours</div>
                <div>Break (min)</div>
                <div>Break (hrs)</div>
                <div>Payable Hours</div>
                <div></div>
              </div>
              {schedules.map((schedule, index) => (
                <div key={index} className="grid grid-cols-8 gap-2 p-2 border-t items-center">
                  <Input
                    type="date"
                    value={schedule.work_date}
                    onChange={(e) => handleScheduleChange(index, "work_date", e.target.value)}
                    className="h-8"
                  />
                  <Input
                    type="time"
                    value={schedule.start_time}
                    onChange={(e) => handleScheduleChange(index, "start_time", e.target.value)}
                    className="h-8"
                  />
                  <Input
                    type="time"
                    value={schedule.end_time}
                    onChange={(e) => handleScheduleChange(index, "end_time", e.target.value)}
                    className="h-8"
                  />
                  <div className="text-sm">{schedule.scheduled_hours.toFixed(2)}</div>
                  <div className="text-sm">{schedule.break_time_minutes.toFixed(1)}</div>
                  <div className="text-sm">{schedule.break_time_hours.toFixed(2)}</div>
                  <div className="text-sm">{schedule.payable_hours.toFixed(2)}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSchedule(index)}
                    className="h-8 w-8 ml-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border p-8 text-center">
              <h3 className="text-lg font-medium">No work schedules</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add work schedules for this payslip.</p>
            </div>
          )}
          <Button onClick={handleAddSchedule} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Work Schedule
          </Button>
        </TabsContent>
        <TabsContent value="csv" className="space-y-4">
          <div className="rounded-md border p-8 text-center">
            <h3 className="text-lg font-medium">Upload CSV File</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a CSV file with Date, Start Time, and End Time columns.
            </p>
            <div className="mt-4">
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 hover:bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">Click to upload CSV</p>
                </div>
                <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </Label>
            </div>
          </div>
          {schedules.length > 0 && (
            <div className="rounded-md border">
              <div className="grid grid-cols-7 gap-2 p-2 font-medium text-sm bg-muted">
                <div>Date</div>
                <div>Start Time</div>
                <div>End Time</div>
                <div>Scheduled Hours</div>
                <div>Break (min)</div>
                <div>Break (hrs)</div>
                <div>Payable Hours</div>
              </div>
              {schedules.map((schedule, index) => (
                <div key={index} className="grid grid-cols-7 gap-2 p-2 border-t items-center">
                  <div className="text-sm">{schedule.work_date}</div>
                  <div className="text-sm">{schedule.start_time}</div>
                  <div className="text-sm">{schedule.end_time}</div>
                  <div className="text-sm">{schedule.scheduled_hours.toFixed(2)}</div>
                  <div className="text-sm">{schedule.break_time_minutes.toFixed(1)}</div>
                  <div className="text-sm">{schedule.break_time_hours.toFixed(2)}</div>
                  <div className="text-sm">{schedule.payable_hours.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
