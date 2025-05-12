"use client"

import type React from "react"

import { useState, useRef } from "react"
import { CalendarIcon, Plus, Trash2, Upload } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  type WorkScheduleEntry,
  calculateScheduledHours,
  calculateBreakTimeMinutes,
  minutesToHours,
  calculatePayableHours,
  parseCSV,
} from "@/lib/work-hours-utils"

interface WorkScheduleInputProps {
  onSchedulesChange: (schedules: WorkScheduleEntry[]) => void
}

export function WorkScheduleInput({ onSchedulesChange }: WorkScheduleInputProps) {
  const [schedules, setSchedules] = useState<WorkScheduleEntry[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddSchedule = () => {
    if (!date || !startTime || !endTime) return

    const formattedDate = format(date, "dd-MMM-yyyy")
    const scheduledHours = calculateScheduledHours(startTime, endTime)
    const breakTimeMinutes = calculateBreakTimeMinutes(scheduledHours)
    const breakTimeHours = minutesToHours(breakTimeMinutes)
    const payableHours = calculatePayableHours(scheduledHours, breakTimeHours)

    const newSchedule: WorkScheduleEntry = {
      date: formattedDate,
      startTime,
      endTime,
      scheduledHours,
      breakTimeMinutes,
      breakTimeHours,
      payableHours,
    }

    const updatedSchedules = [...schedules, newSchedule]
    setSchedules(updatedSchedules)
    onSchedulesChange(updatedSchedules)

    // Reset form
    setStartTime("")
    setEndTime("")
  }

  const handleRemoveSchedule = (index: number) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index)
    setSchedules(updatedSchedules)
    onSchedulesChange(updatedSchedules)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvData = e.target?.result as string
        const parsedSchedules = parseCSV(csvData)
        setSchedules(parsedSchedules)
        onSchedulesChange(parsedSchedules)
      } catch (error) {
        console.error("Error parsing CSV:", error)
        alert("Error parsing CSV. Please make sure it has Date, Start Time, and End Time columns.")
      }
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="csv-upload">Upload CSV</Label>
          <div className="flex gap-2">
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="w-full"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">CSV should have columns: Date, Start Time, End Time</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="start-time">Start Time</Label>
          <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="end-time">End Time</Label>
          <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>

        <Button type="button" onClick={handleAddSchedule} disabled={!date || !startTime || !endTime}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {schedules.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Scheduled Hours</TableHead>
                <TableHead>Break (Min)</TableHead>
                <TableHead>Break (Hrs)</TableHead>
                <TableHead>Payable Hours</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule, index) => (
                <TableRow key={index}>
                  <TableCell>{schedule.date}</TableCell>
                  <TableCell>{schedule.startTime}</TableCell>
                  <TableCell>{schedule.endTime}</TableCell>
                  <TableCell>{schedule.scheduledHours.toFixed(2)}</TableCell>
                  <TableCell>{schedule.breakTimeMinutes}</TableCell>
                  <TableCell>{schedule.breakTimeHours.toFixed(2)}</TableCell>
                  <TableCell>{schedule.payableHours.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSchedule(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Total:
                </TableCell>
                <TableCell className="font-medium">
                  {schedules.reduce((sum, s) => sum + s.scheduledHours, 0).toFixed(2)}
                </TableCell>
                <TableCell className="font-medium">
                  {schedules.reduce((sum, s) => sum + s.breakTimeMinutes, 0)}
                </TableCell>
                <TableCell className="font-medium">
                  {schedules.reduce((sum, s) => sum + s.breakTimeHours, 0).toFixed(2)}
                </TableCell>
                <TableCell className="font-medium">
                  {schedules.reduce((sum, s) => sum + s.payableHours, 0).toFixed(2)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
