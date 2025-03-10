"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

interface StudyTimerProps {
  isRunning: boolean
}

export function StudyTimer({ isRunning }: StudyTimerProps) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":")
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Clock className="h-12 w-12 mb-2 text-primary" />
      <div className="text-4xl font-mono font-bold">{formatTime(seconds)}</div>
      <p className="text-sm text-muted-foreground mt-2">{isRunning ? "Timer running" : "Timer paused"}</p>
    </div>
  )
}

