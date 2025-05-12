/**
 * Get the first day of the previous month
 */
export function getFirstDayOfPreviousMonth(): Date {
  const date = new Date()
  // Set to first day of current month
  date.setDate(1)
  // Go back one month
  date.setMonth(date.getMonth() - 1)
  return date
}

/**
 * Get the last day of the previous month
 */
export function getLastDayOfPreviousMonth(): Date {
  const date = new Date()
  // Set to first day of current month
  date.setDate(1)
  // Subtract one day to get last day of previous month
  date.setDate(0)
  return date
}

/**
 * Get the first day of the current month
 */
export function getFirstDayOfCurrentMonth(): Date {
  const date = new Date()
  date.setDate(1)
  return date
}

/**
 * Get the last day of the current month
 */
export function getLastDayOfCurrentMonth(): Date {
  const date = new Date()
  // Set to first day of next month
  date.setMonth(date.getMonth() + 1)
  date.setDate(1)
  // Subtract one day to get last day of current month
  date.setDate(0)
  return date
}
