"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Camera, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProcrastinationDetectorProps {
  isActive: boolean
  onProcrastinationUpdate: (score: number, detectedBehaviors: string[]) => void
}

export function ProcrastinationDetector({ isActive, onProcrastinationUpdate }: ProcrastinationDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [status, setStatus] = useState<string>("Initializing...")
  const [isMounted, setIsMounted] = useState(false)

  const procrastinationBehaviors = [
    "Looking away from screen",
    "Phone usage detected",
    "Slouching posture",
    "Frequent yawning",
    "Distracted hand movements",
  ]

  // Set mounted state
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const setupCamera = useCallback(async () => {
    // Don't proceed if component is not mounted
    if (!isMounted) return

    try {
      setIsLoading(true)
      setError(null)
      setStatus("Checking camera permissions...")

      // Ensure video element exists
      if (!videoRef.current) {
        throw new Error("Camera initialization failed. Please try again.")
      }

      // Stop any existing stream
      stopCamera()

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported in this browser")
      }

      setStatus("Requesting camera access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })

      // Check mounted state again after async operation
      if (!isMounted) return

      if (!stream) {
        throw new Error("Failed to get camera stream")
      }

      streamRef.current = stream
      videoRef.current.srcObject = stream

      setStatus("Initializing video stream...")

      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) return reject("Camera initialization failed")

        const timeoutId = setTimeout(() => {
          reject("Camera initialization timed out")
        }, 10000) // 10 second timeout

        videoRef.current.onloadedmetadata = () => {
          clearTimeout(timeoutId)
          if (!videoRef.current) return reject("Camera initialization failed")

          videoRef.current
            .play()
            .then(() => {
              if (!isMounted) return
              setStatus("Loading ML models...")
              // Simulate ML model loading
              setTimeout(() => {
                if (!isMounted) return
                setIsModelLoaded(true)
                setIsLoading(false)
                setStatus("Ready")
              }, 1500)
              resolve()
            })
            .catch(reject)
        }

        videoRef.current.onerror = () => {
          clearTimeout(timeoutId)
          reject("Failed to load video stream")
        }
      })
    } catch (err) {
      if (!isMounted) return
      console.error("Camera setup error:", err)
      stopCamera()
      setError(err instanceof Error ? err.message : "Failed to initialize camera")
      setStatus("Error")
      setIsLoading(false)
    }
  }, [isMounted, stopCamera])

  const retrySetup = useCallback(() => {
    setupCamera()
  }, [setupCamera])

  // Only start camera setup after component is mounted
  useEffect(() => {
    if (isMounted) {
      setupCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isMounted, setupCamera, stopCamera])

  useEffect(() => {
    let animationFrameId: number
    let lastUpdateTime = 0
    const updateInterval = 1000 // Update every second

    const detectProcrastination = (timestamp: number) => {
      if (!isActive || !isModelLoaded) {
        animationFrameId = requestAnimationFrame(detectProcrastination)
        return
      }

      const elapsed = timestamp - lastUpdateTime

      if (elapsed > updateInterval) {
        lastUpdateTime = timestamp

        // Simulate procrastination detection
        const randomScore = Math.random() * 5
        const detectedBehaviors = []

        if (randomScore > 1) {
          // Randomly select 1-3 behaviors based on the score
          const numBehaviors = Math.min(Math.floor(randomScore), 3)
          const shuffled = [...procrastinationBehaviors].sort(() => 0.5 - Math.random())
          detectedBehaviors.push(...shuffled.slice(0, numBehaviors))
        }

        onProcrastinationUpdate(randomScore, detectedBehaviors)

        // Draw landmarks on canvas (simulated)
        if (canvasRef.current && videoRef.current) {
          const ctx = canvasRef.current.getContext("2d")
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

            // Draw video frame
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)

            // Simulate drawing landmarks if procrastination detected
            if (detectedBehaviors.length > 0) {
              ctx.strokeStyle = "red"
              ctx.lineWidth = 2

              // Draw face oval
              ctx.beginPath()
              ctx.ellipse(canvasRef.current.width / 2, canvasRef.current.height / 3, 60, 80, 0, 0, 2 * Math.PI)
              ctx.stroke()

              // Draw some random points for hands/pose
              for (let i = 0; i < 10; i++) {
                const x = Math.random() * canvasRef.current.width
                const y = Math.random() * canvasRef.current.height
                ctx.beginPath()
                ctx.arc(x, y, 3, 0, 2 * Math.PI)
                ctx.fill()
              }
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(detectProcrastination)
    }

    if (isActive && isModelLoaded) {
      animationFrameId = requestAnimationFrame(detectProcrastination)
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isActive, isModelLoaded, onProcrastinationUpdate])

  useEffect(() => {
    // Resize canvas to match video dimensions
    const resizeCanvas = () => {
      if (videoRef.current && canvasRef.current) {
        canvasRef.current.width = videoRef.current.clientWidth
        canvasRef.current.height = videoRef.current.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  if (!isMounted) {
    return (
      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera className="h-8 w-8 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <Alert variant="destructive" className="w-full max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Camera Error</AlertTitle>
            <AlertDescription className="mt-2">{error}</AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" onClick={retrySetup}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry Camera Access
          </Button>
        </div>
      ) : isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Camera className="h-8 w-8 mb-2 animate-pulse" />
          <p className="text-sm font-medium">{status}</p>
          <p className="text-xs text-muted-foreground mt-1">{isModelLoaded ? "Camera ready" : "Please wait..."}</p>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={isActive ? "hidden" : "w-full h-full object-cover"}
            style={{ transform: "scaleX(-1)" }}
          />
          <canvas ref={canvasRef} className={isActive ? "w-full h-full" : "hidden"} />
          {!isActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <p className="text-white">Click Start to begin detection</p>
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex gap-2">
            <Button variant="secondary" size="sm" onClick={retrySetup}>
              <RefreshCcw className="mr-2 h-3 w-3" />
              Restart Camera
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

