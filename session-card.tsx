import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, AlertCircle } from "lucide-react"

interface SessionCardProps {
  title: string
  date: string
  duration: string
  focusScore: number
  distractions: number
}

export function SessionCard({ title, date, duration, focusScore, distractions }: SessionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{date}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{duration}</span>
          </div>
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{distractions} distractions</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Focus Score</span>
            <span className="text-sm font-medium">{focusScore}%</span>
          </div>
          <Progress value={focusScore} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}

