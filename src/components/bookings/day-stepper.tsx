'use client'

import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'

interface DayStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label: string
}

export function DayStepper({ value, onChange, min = 0, max = 14, label }: DayStepperProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-zinc-400 uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-xl font-bold text-white w-8 text-center">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <span className="text-xs text-zinc-500">{value === 1 ? 'day' : 'days'}</span>
    </div>
  )
}
