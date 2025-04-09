"use client";
import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { signOutFunc, getPendingListingsCount, getUserSignupsStats, getVerifiedListingsCount, getUnresolvedComplaintsCount, getAllListingsOrderedByStatus, getUniqueReviewers, getAllComplaints, getComplaintMessages } from "@/app/(auth)/actions";
import DataTable from "@/components/DataTable";
import StatCard from "@/components/StatCard";
import { useListingsSubscription } from "@/hooks/useListingsSubscription";
// import { OldDataTable } from "@/Downloads/flat-finder-main 2/components/OldDataTable";

import {
  Users,
  FileWarning,
  Home,
  MessageSquare,
} from "lucide-react";

function AdminDashboardPage() {
  const router = useRouter();
  useListingsSubscription(); 

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

  const { data: listingsData = [], isLoading: loadingListings } = useQuery({
    queryKey: ["listings"],
    queryFn: getAllListingsOrderedByStatus,
  });

  const { data: uniqueReviewers = [], isLoading: loadingUniqueReviewers } = useQuery({
    queryKey: ["unique-reviewers"],
    queryFn: getUniqueReviewers,
  });

  const { data: complaintsData = [], isLoading: loadingComplaints } = useQuery({
    queryKey: ["complaints"],
    queryFn: getAllComplaints,
  });

  const { data: messagesData = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["complaint-messages", "2e00a1ec-0b97-4ed8-9fca-d84b09a5acc8"],
    queryFn: () => getComplaintMessages("2e00a1ec-0b97-4ed8-9fca-d84b09a5acc8"),
  });

  useEffect(() => {
    if (!loadingMessages) {
      console.log("Messages Data:", messagesData);
    }
  }, [messagesData, loadingMessages]);

  // useeffet for complaints
  useEffect(() => {
    if (!loadingComplaints) {
      console.log("Complaints Data:", complaintsData);
    }
  }, [complaintsData, loadingComplaints]);

  useEffect(() => {
    if (!loadingListings) {
      console.log("Listings Data:", listingsData);
    }
  }, [listingsData, loadingListings]);

  useEffect(() => {
    if (!loadingUniqueReviewers) {
      console.log("Unique Reviewers:", uniqueReviewers);
    }
  }, [uniqueReviewers, loadingUniqueReviewers]);
  
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
      {loadingListings ? (
          <div>Loading listings...</div>
        ) : loadingComplaints ? (
          <div>Loading complaints...</div>
        ) : (
          <DataTable
            data={listingsData}
            uniqueReviewers={uniqueReviewers}
            complaintData={complaintsData}
          />
        )}
      </div>



      
    </>
  );
}

export default AdminDashboardPage;
