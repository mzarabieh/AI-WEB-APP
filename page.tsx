"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Brain, Pause, Play, Settings, AlertTriangle } from "lucide-react"
import { StudyTimer } from "@/components/study-timer"
import { ProcrastinationDetector } from "@/components/procrastination-detector"
import { ProcrastinationAlert } from "@/components/procrastination-alert"

export default function StudyPage() {
  const [isStudying, setIsStudying] = useState(false)
  const [procrastinationScore, setProcrastinationScore] = useState(0)
  const [focusLevel, setFocusLevel] = useState(100)
  const [detections, setDetections] = useState<string[]>([])
  const [sessionGoal, setSessionGoal] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)

  const handleProcrastinationUpdate = (score: number, detectedBehaviors: string[]) => {
    setProcrastinationScore(score)
    setFocusLevel(Math.max(0, 100 - score * 20))
    setDetections(detectedBehaviors)

    // If procrastination score is high enough, show the alert
    if (score > 3 && detectedBehaviors.length > 0 && isStudying) {
      setShowAlert(true)
    }
  }

  const handleStartSession = () => {
    if (sessionGoal.trim().length < 10) {
      alert("Please enter a more detailed session goal (at least 10 characters)")
      return
    }

    setSessionStarted(true)
    setIsStudying(true)
  }

  const handleCloseAlert = () => {
    setShowAlert(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-4 flex items-center gap-2 font-bold text-xl">
            <Brain className="h-6 w-6" />
            <span>FocusGuard</span>
          </Link>
          <nav className="flex flex-1 items-center justify-end space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Study Session</h1>
        </div>

        {!sessionStarted ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Session Setup</CardTitle>
              <CardDescription>Define what you'll be working on during this session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="session-goal" className="text-sm font-medium">
                  Session Goal
                </label>
                <Textarea
                  id="session-goal"
                  placeholder="I will be working on my math homework. I'm allowed to use calculator websites but not social media."
                  value={sessionGoal}
                  onChange={(e) => setSessionGoal(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about what you're working on and what websites or activities are allowed.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleStartSession} className="w-full">
                Start Session
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Camera Feed</CardTitle>
                  <CardDescription>Your camera is used to detect procrastination behaviors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProcrastinationDetector
                    isActive={isStudying}
                    onProcrastinationUpdate={handleProcrastinationUpdate}
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {isStudying ? "Camera active - detecting procrastination" : "Camera paused"}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => setIsStudying(!isStudying)}>
                    {isStudying ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause Detection
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume Detection
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Study Timer</CardTitle>
                  <CardDescription>Track your study session duration</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <StudyTimer isRunning={isStudying} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Focus Metrics</CardTitle>
                  <CardDescription>Real-time analysis of your focus level</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Focus Level</span>
                      <span className="text-sm font-medium">{focusLevel}%</span>
                    </div>
                    <Progress value={focusLevel} />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Detected Behaviors:</h4>
                    {detections.length > 0 ? (
                      <ul className="text-sm space-y-1">
                        {detections.map((behavior, index) => (
                          <li key={index} className="text-red-500 flex items-start">
                            <AlertTriangle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{behavior}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No procrastination behaviors detected</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Session Goal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{sessionGoal}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {showAlert && <ProcrastinationAlert behaviors={detections} onClose={handleCloseAlert} />}
    </div>
  )
}

