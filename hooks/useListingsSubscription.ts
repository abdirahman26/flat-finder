"use client";

import { useEffect } from "react";
import { createClient } from "@/supabase/client"; 
import { useQueryClient } from "@tanstack/react-query";

export function useListingsSubscription() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("realtime-updates")

      // Listings table
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "listings",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pending-listings"] });
          queryClient.invalidateQueries({ queryKey: ["verified-listings"] });
        }
      )

      // Complaints table
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["unresolved-complaints"] });
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, supabase]);
}
