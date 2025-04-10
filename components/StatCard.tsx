// components/StatCard.tsx

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  trend: string
  icon: LucideIcon
  className?: string
}

export default function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={`@container/card border-gray-700 bg-custom-dark shadow-[0_4px_10px_rgba(0,0,0,0.4)] text-white ${className}`}>
      <CardHeader className="relative">
        <CardDescription className="text-white">{title}</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        <div className="absolute right-4 top-0">
          <Badge variant="outline" className="flex gap-1 rounded-sm text-xs text-white border-gray-700 py-1.5" style={{backgroundColor: trend.startsWith("+") ? "rgba(11, 156, 49, 0.4)" : "rgba(255, 0, 0, 0.4)"}}>
            <Icon className="size-3" />
            {trend}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  )
}