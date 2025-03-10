"use client"

import { useState, useEffect } from "react"
import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProcrastinationAlertProps {
  behaviors: string[]
  onClose: () => void
}

export function ProcrastinationAlert({ behaviors, onClose }: ProcrastinationAlertProps) {
  const [countdown, setCountdown] = useState(15)
  const [isPledged, setIsPledged] = useState(false)

  useEffect(() => {
    if (isPledged) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isPledged])

  useEffect(() => {
    if (countdown === 0) {
      onClose()
    }
  }, [countdown, onClose])

  // Generate a random message
  const messages = [
    "Hey! I caught you procrastinating!",
    "Focus! You're getting distracted!",
    "Back to work! You can do this!",
    "Eyes on the prize! Stay focused!",
    "Distraction detected! Get back on track!",
  ]

  const randomMessage = messages[Math.floor(Math.random() * messages.length)]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full p-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center text-red-500">
            <AlertCircle className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-bold">Procrastination Detected!</h2>
          </div>
          {isPledged && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>

        <div className="mb-4">
          <p className="text-lg font-medium mb-2">{randomMessage}</p>
          <p className="text-sm text-muted-foreground mb-2">I detected the following behaviors:</p>
          <ul className="text-sm space-y-1 mb-4">
            {behaviors.map((behavior, index) => (
              <li key={index} className="text-red-500">
                • {behavior}
              </li>
            ))}
          </ul>

          {isPledged ? (
            <div className="text-center p-4 border rounded-lg">
              <p className="mb-2">You have {countdown} seconds to close distractions</p>
              <div className="text-2xl font-bold">{countdown}</div>
            </div>
          ) : (
            <p className="text-sm">Please pledge to get back on track and close any distractions.</p>
          )}
        </div>

        {!isPledged && (
          <Button className="w-full" onClick={() => setIsPledged(true)}>
            I pledge to stop procrastinating
          </Button>
        )}
      </div>
    </div>
  )
}

