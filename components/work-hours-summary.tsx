"use client"

import { Card, CardContent } from "@/components/ui/card"

interface WorkHoursSummaryProps {
  data: Record<string, { scheduledHours: number; breakTimeMinutes: number; payableHours: number }>
  type: "day" | "week" | "month" | "year"
}

export function WorkHoursSummary({ data, type }: WorkHoursSummaryProps) {
  // Sort the keys based on the type
  const sortedKeys = Object.keys(data).sort((a, b) => {
    if (type === "year") {
      return Number.parseInt(b) - Number.parseInt(a) // Sort years in descending order
    } else if (type === "month") {
      const [yearA, monthA] = a.split("-")
      const [yearB, monthB] = b.split("-")
      return yearB === yearA ? monthB.localeCompare(monthA) : yearB.localeCompare(yearA)
    } else if (type === "week") {
      const [yearA, weekA] = a.split("-W")
      const [yearB, weekB] = b.split("-W")
      return yearB === yearA ? Number.parseInt(weekB) - Number.parseInt(weekA) : yearB.localeCompare(yearA)
    }
    return b.localeCompare(a) // Default sort in descending order
  })

  // Format the key for display
  const formatKey = (key: string) => {
    if (type === "year") {
      return key
    } else if (type === "month") {
      const [year, month] = key.split("-")
      return `${month} ${year}`
    } else if (type === "week") {
      const [year, week] = key.split("-W")
      return `Week ${week}, ${year}`
    }
    return key
  }

  return (
    <div className="space-y-4">
      {sortedKeys.length > 0 ? (
        sortedKeys.map((key) => {
          const hours = data[key]
          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{formatKey(key)}</h3>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Scheduled</p>
                    <p className="font-medium">{hours.scheduledHours.toFixed(1)} hrs</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Break Time</p>
                    <p className="font-medium">{hours.breakTimeMinutes} mins</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payable</p>
                    <p className="font-medium">{hours.payableHours.toFixed(1)} hrs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      ) : (
        <div className="text-center p-4 text-muted-foreground">No data available for this period.</div>
      )}
    </div>
  )
}
