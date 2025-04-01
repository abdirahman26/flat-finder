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
    <Card className={`@container/card !bg-white/10 text-white ${className}`}>
      <CardHeader className="relative">
        <CardDescription className="text-white">{title}</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-white">
            <Icon className="size-3" />
            {trend}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  )
}
