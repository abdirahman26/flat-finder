// components/SectionCards.tsx

import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import StatCard from "./StatCard"

export function SectionCards() {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4 text-white">
      <StatCard
        title="Pending Listings"
        value={10}
        trend="+12.5%"
        icon={TrendingUpIcon}
      />
      <StatCard
        title="New Signups"
        value={124}
        trend="+8.2%"
        icon={TrendingUpIcon}
      />
      <StatCard
        title="Active Properties"
        value={5}
        trend="-10%"
        icon={TrendingDownIcon}
      />
      <StatCard
        title="User Complaints"
        value={98}
        trend="+5.6%"
        icon={TrendingUpIcon}
      />
    </div>
  )
}
