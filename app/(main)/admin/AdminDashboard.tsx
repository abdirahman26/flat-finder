"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { signOutFunc, getPendingListingsCount, getUserSignupsStats, getVerifiedListingsCount, getUnresolvedComplaintsCount } from "@/app/(auth)/actions";
import DataTable from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { useListingsSubscription } from "@/hooks/useListingsSubscription";

import {
  Users,
  FileWarning,
  Home,
  MessageSquare,
} from "lucide-react";

import data from "./data.json";

function AdminDashboardPage() {
  const router = useRouter();
  useListingsSubscription(); // 👈 Add this line here


  const handleSignOut = async () => {
    console.log("Signing out...");
    const { error } = await signOutFunc();

    if (error) {
      console.log(error);
    } else {
      router.replace("/sign-in");
    }
  };

  // Fetch pending listing count
  const { data: pendingCount = 0, isLoading: loadingPending } = useQuery({
    queryKey: ["pending-listings"],
    queryFn: getPendingListingsCount,
  });
  
  const {
    data: userStats = { past7DaysCount: 0, todayCount: 0 },
    isLoading: loadingUserStats,
  } = useQuery({
    queryKey: ["user-signups-stats"],
    queryFn: getUserSignupsStats,
  });
  
  const { data: verifiedCount = 0, isLoading: loadingVerified } = useQuery({
    queryKey: ["verified-listings"],
    queryFn: getVerifiedListingsCount,
  });
  
  const { data: unresolvedComplaintsCount = 0, isLoading: loadingUnresolvedComplaints } = useQuery({
    queryKey: ["unresolved-complaints"],
    queryFn: getUnresolvedComplaintsCount,
  });

  return (
    <>
      <div className="max-w-7xl mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Pending Listings"
          value={loadingPending ? "..." : pendingCount}
          trend="Pending"
          icon={FileWarning}
        />
        <StatCard
          title="New Signups"
          value={loadingUserStats ? "..." : userStats.past7DaysCount}
          trend={loadingUserStats ? "..." : `+${userStats.todayCount} today`}
          icon={Users}
        />
        <StatCard
          title="Active Properties"
          value={loadingVerified ? "..." : verifiedCount}
          trend="Stable"
          icon={Home}
        />
        <StatCard
          title="User Complaints"
          value={loadingUnresolvedComplaints ? "..." : unresolvedComplaintsCount}
          trend="+1"
          icon={MessageSquare}
        />
      </div>

      <div>
        <DataTable data={data} />
      </div>
    </>
  );
}

export default AdminDashboardPage;
