import Papa from "papaparse"

/**
 * Utility functions for working with work hours, break times, and payable hours
 */

// Break time lookup table
const breakTimeLookup = [
  { scheduledHours: 0, breakTimeMinutes: 0, allottedBreakTimeMinutes: 0 },
  { scheduledHours: 1, breakTimeMinutes: 0, allottedBreakTimeMinutes: 0 },
  { scheduledHours: 2, breakTimeMinutes: 0, allottedBreakTimeMinutes: 0 },
  { scheduledHours: 3, breakTimeMinutes: 15, allottedBreakTimeMinutes: 15 },
  { scheduledHours: 4, breakTimeMinutes: 26.4, allottedBreakTimeMinutes: 25 },
  { scheduledHours: 5, breakTimeMinutes: 33, allottedBreakTimeMinutes: 35 },
  { scheduledHours: 6, breakTimeMinutes: 39.6, allottedBreakTimeMinutes: 40 },
  { scheduledHours: 7, breakTimeMinutes: 46.2, allottedBreakTimeMinutes: 45 },
  { scheduledHours: 8, breakTimeMinutes: 52.8, allottedBreakTimeMinutes: 55 },
  { scheduledHours: 9, breakTimeMinutes: 59.4, allottedBreakTimeMinutes: 60 },
  { scheduledHours: 10, breakTimeMinutes: 66, allottedBreakTimeMinutes: 65 },
  { scheduledHours: 11, breakTimeMinutes: 72.6, allottedBreakTimeMinutes: 75 },
  { scheduledHours: 12, breakTimeMinutes: 79.2, allottedBreakTimeMinutes: 80 },
]

// Define the work schedule entry type
export interface WorkScheduleEntry {
  date: string
  startTime: string
  endTime: string
  scheduledHours: number
  breakTimeMinutes: number
  breakTimeHours: number
  payableHours: number
}

// Function to calculate scheduled hours from start and end time
export function calculateScheduledHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0

  const start = new Date(`1970-01-01T${startTime}`)
  const end = new Date(`1970-01-01T${endTime}`)

  // If end time is before start time, assume it's the next day
  let diff = end.getTime() - start.getTime()
  if (diff < 0) {
    diff += 24 * 60 * 60 * 1000 // Add 24 hours
  }

  // Convert milliseconds to hours
  return Math.round((diff / (1000 * 60 * 60)) * 100) / 100
}

// Function to calculate break time in minutes based on scheduled hours
export function calculateBreakTimeMinutes(scheduledHours: number): number {
  // Break time lookup table
  const breakTimeLookup = [
    { hours: 0, minutes: 0 },
    { hours: 1, minutes: 0 },
    { hours: 2, minutes: 0 },
    { hours: 3, minutes: 15 },
    { hours: 4, minutes: 25 },
    { hours: 5, minutes: 35 },
    { hours: 6, minutes: 40 },
    { hours: 7, minutes: 45 },
    { hours: 8, minutes: 55 },
    { hours: 9, minutes: 60 },
    { hours: 10, minutes: 65 },
    { hours: 11, minutes: 75 },
    { hours: 12, minutes: 80 },
  ]

  // Find the closest scheduled hours in the lookup table
  const roundedHours = Math.floor(scheduledHours)
  const entry = breakTimeLookup.find((e) => e.hours === roundedHours) || breakTimeLookup[breakTimeLookup.length - 1]

  return entry.minutes
}

// Function to convert minutes to hours
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100
}

// Function to calculate payable hours
export function calculatePayableHours(scheduledHours: number, breakTimeHours: number): number {
  return Math.max(0, Math.round((scheduledHours - breakTimeHours) * 100) / 100)
}

export function calculateBreakTime(scheduledHours: number): number {
  // Find the closest entry in the lookup table
  const floorHours = Math.floor(scheduledHours)
  const entry = breakTimeLookup.find((e) => e.scheduledHours === floorHours)

  if (!entry) {
    // If scheduled hours is greater than the max in the table, use the max entry
    if (floorHours > 12) {
      return breakTimeLookup[breakTimeLookup.length - 1].breakTimeMinutes
    }
    // Default to 0 if not found
    return 0
  }

  return entry.breakTimeMinutes
}

export function calculateBreakTimeHours(breakTimeMinutes: number): number {
  return breakTimeMinutes / 60
}

export function calculatePayableHoursOld(scheduledHours: number, breakTimeMinutes: number): number {
  const breakTimeHours = breakTimeMinutes / 60
  return Math.max(0, scheduledHours - breakTimeHours)
}

export function calculateScheduledHoursOld(startTime: string, endTime: string): number {
  const start = new Date(`1970-01-01T${startTime}:00`)
  const end = new Date(`1970-01-01T${endTime}:00`)

  // If end time is before start time, assume it's the next day
  let diff = end.getTime() - start.getTime()
  if (diff < 0) {
    diff += 24 * 60 * 60 * 1000 // Add 24 hours
  }

  return diff / (1000 * 60 * 60) // Convert milliseconds to hours
}

// Function to parse CSV data
export function parseCSV(csvData: string): WorkScheduleEntry[] {
  // Split by lines
  const lines = csvData.split("\n")

  // Parse header
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase())

  // Find column indices
  const dateIndex = header.findIndex((h) => h === "date")
  const startTimeIndex = header.findIndex((h) => h === "start time")
  const endTimeIndex = header.findIndex((h) => h === "end time")

  // Check if required columns exist
  if (dateIndex === -1 || startTimeIndex === -1 || endTimeIndex === -1) {
    throw new Error("CSV must contain Date, Start Time, and End Time columns")
  }

  // Parse data rows
  const entries: WorkScheduleEntry[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(",").map((v) => v.trim())

    const date = values[dateIndex]
    const startTime = values[startTimeIndex]
    const endTime = values[endTimeIndex]

    if (!date || !startTime || !endTime) continue

    const scheduledHours = calculateScheduledHours(startTime, endTime)
    const breakTimeMinutes = calculateBreakTimeMinutes(scheduledHours)
    const breakTimeHours = minutesToHours(breakTimeMinutes)
    const payableHours = calculatePayableHours(scheduledHours, breakTimeHours)

    entries.push({
      date,
      startTime,
      endTime,
      scheduledHours,
      breakTimeMinutes,
      breakTimeHours,
      payableHours,
    })
  }

  return entries
}

export function parseCSVOld(file: File): Promise<WorkScheduleEntry[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const entries: WorkScheduleEntry[] = results.data.map((row: any) => {
            const date = row.Date
            const startTime = row["Start Time"]
            const endTime = row["End Time"]

            const scheduledHours = calculateScheduledHours(startTime, endTime)
            const breakTimeMinutes = calculateBreakTime(scheduledHours)
            const breakTimeHours = calculateBreakTimeHours(breakTimeMinutes)
            const payableHours = calculatePayableHours(scheduledHours, breakTimeMinutes)

            return {
              date,
              startTime,
              endTime,
              scheduledHours,
              breakTimeMinutes,
              breakTimeHours,
              payableHours,
            }
          })

          resolve(entries)
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

/**
 * Format a date as YYYY-MM-DD
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDateYYYYMMDD(date: Date): string {
  return date.toISOString().split("T")[0]
}

/**
 * Get the week number of a date
 * @param date The date to get the week number for
 * @returns Week number (1-53)
 */
export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

/**
 * Get the month name from a date
 * @param date The date to get the month name for
 * @returns Month name (Jan, Feb, etc.)
 */
export function getMonthName(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return months[date.getMonth()]
}

/**
 * Get the day of the month as a two-digit string
 * @param date The date to get the day for
 * @returns Day of the month as a two-digit string (01, 02, etc.)
 */
export function getDayOfMonth(date: Date): string {
  return date.getDate().toString().padStart(2, "0")
}

export function createWorkHoursData(date: Date, hours: number) {
  const year = date.getFullYear()
  const month = date.toLocaleString("en-US", { month: "short" })
  const day = date.getDate().toString().padStart(2, "0")

  return {
    data: {
      [year]: {
        [month]: {
          [day]: hours,
        },
      },
    },
  }
}

/**
 * Aggregate work hours data by day, week, month, and year
 * @param workRecords Array of work records
 * @returns Aggregated work hours data
 */
export function aggregateWorkHours(workRecords: any[]): any {
  const aggregated = {
    byDay: {},
    byWeek: {},
    byMonth: {},
    byYear: {},
  }

  workRecords.forEach((record) => {
    const date = new Date(record.work_date)
    const year = date.getFullYear()
    const month = getMonthName(date)
    const day = getDayOfMonth(date)
    const week = getWeekNumber(date)

    // Aggregate by day
    const dayKey = `${year}-${month}-${day}`
    if (!aggregated.byDay[dayKey]) {
      aggregated.byDay[dayKey] = {
        scheduledHours: 0,
        breakTimeMinutes: 0,
        payableHours: 0,
      }
    }
    aggregated.byDay[dayKey].scheduledHours += record.scheduled_hours || 0
    aggregated.byDay[dayKey].breakTimeMinutes += record.break_time_minutes || 0
    aggregated.byDay[dayKey].payableHours += record.payable_hours || 0

    // Aggregate by week
    const weekKey = `${year}-W${week}`
    if (!aggregated.byWeek[weekKey]) {
      aggregated.byWeek[weekKey] = {
        scheduledHours: 0,
        breakTimeMinutes: 0,
        payableHours: 0,
      }
    }
    aggregated.byWeek[weekKey].scheduledHours += record.scheduled_hours || 0
    aggregated.byWeek[weekKey].breakTimeMinutes += record.break_time_minutes || 0
    aggregated.byWeek[weekKey].payableHours += record.payable_hours || 0

    // Aggregate by month
    const monthKey = `${year}-${month}`
    if (!aggregated.byMonth[monthKey]) {
      aggregated.byMonth[monthKey] = {
        scheduledHours: 0,
        breakTimeMinutes: 0,
        payableHours: 0,
      }
    }
    aggregated.byMonth[monthKey].scheduledHours += record.scheduled_hours || 0
    aggregated.byMonth[monthKey].breakTimeMinutes += record.break_time_minutes || 0
    aggregated.byMonth[monthKey].payableHours += record.payable_hours || 0

    // Aggregate by year
    const yearKey = `${year}`
    if (!aggregated.byYear[yearKey]) {
      aggregated.byYear[yearKey] = {
        scheduledHours: 0,
        breakTimeMinutes: 0,
        payableHours: 0,
      }
    }
    aggregated.byYear[yearKey].scheduledHours += record.scheduled_hours || 0
    aggregated.byYear[yearKey].breakTimeMinutes += record.break_time_minutes || 0
    aggregated.byYear[yearKey].payableHours += record.payable_hours || 0
  })

  return aggregated
}
