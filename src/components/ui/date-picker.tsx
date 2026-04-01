"use client"

import * as React from "react"
import { format, parseISO, setHours, setMinutes } from "date-fns"
import { CalendarIcon, Clock, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date | string | null
  onChange: (date: Date | null) => void
  placeholder?: string
  enableTime?: boolean
  disabled?: boolean
  /** Month to show when the calendar opens (falls back to value, then today) */
  defaultMonth?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  enableTime = false,
  disabled = false,
  defaultMonth,
}: DatePickerProps) {
  const [showTime, setShowTime] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(new Date())

  // Parse value to Date
  const date = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    try {
      return parseISO(value)
    } catch {
      return undefined
    }
  }, [value])

  // Detect if incoming value has a non-midnight time
  React.useEffect(() => {
    if (date && enableTime) {
      const h = date.getHours()
      const m = date.getMinutes()
      if (h !== 0 || m !== 0) {
        setShowTime(true)
      }
    }
  }, []) // only on mount

  // Reset calendar month when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setCalendarMonth(defaultMonth ?? date ?? new Date())
    }
    setOpen(isOpen)
  }

  const hours = date ? date.getHours() : 9
  const minutes = date ? date.getMinutes() : 0
  const isPM = hours >= 12
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) {
      onChange(null)
      return
    }
    // Preserve existing time if time is shown
    if (showTime && date) {
      selected = setHours(selected, date.getHours())
      selected = setMinutes(selected, date.getMinutes())
    }
    onChange(selected)
  }

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let h = parseInt(e.target.value, 10)
    if (isNaN(h)) return
    if (h < 1) h = 1
    if (h > 12) h = 12
    // Convert to 24h
    const h24 = isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h)
    if (date) {
      onChange(setHours(date, h24))
    }
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let m = parseInt(e.target.value, 10)
    if (isNaN(m)) return
    if (m < 0) m = 0
    if (m > 59) m = 59
    if (date) {
      onChange(setMinutes(date, m))
    }
  }

  const handleAmPmToggle = () => {
    if (!date) return
    const newHours = isPM ? hours - 12 : hours + 12
    onChange(setHours(date, newHours))
  }

  const handleAddTime = () => {
    setShowTime(true)
    // Set a default time of 9:00 AM if date exists and time is midnight
    if (date && date.getHours() === 0 && date.getMinutes() === 0) {
      onChange(setHours(date, 9))
    }
  }

  const handleRemoveTime = () => {
    setShowTime(false)
    if (date) {
      // Reset to midnight
      let reset = setHours(date, 0)
      reset = setMinutes(reset, 0)
      onChange(reset)
    }
  }

  const formatDisplay = () => {
    if (!date) return null
    if (showTime) {
      return format(date, "MMM d, yyyy 'at' h:mm a")
    }
    return format(date, "MMM d, yyyy")
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          {formatDisplay() || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          initialFocus
        />

        {enableTime && (
          <div className="border-t px-3 py-3">
            {showTime ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={displayHour}
                  onChange={handleHourChange}
                  autoComplete="off"
                  className="w-12 rounded-md border bg-transparent px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Hour"
                />
                <span className="text-sm font-medium text-muted-foreground">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes.toString().padStart(2, "0")}
                  onChange={handleMinuteChange}
                  autoComplete="off"
                  className="w-12 rounded-md border bg-transparent px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Minute"
                />
                <button
                  type="button"
                  onClick={handleAmPmToggle}
                  className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-accent transition-colors"
                >
                  {isPM ? "PM" : "AM"}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveTime}
                  className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Remove time"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddTime}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                <Clock className="h-4 w-4" />
                Add time
              </button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
