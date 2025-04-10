"use client";

import React, { useEffect, useState } from "react";
import { getBookingsWithDetailsByUserId, getUserDetails } from "@/app/(auth)/actions";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";

const UserBookingsTable = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch logged-in user ID
  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await getUserDetails();
      if (error || !data?.id) {
        toast.error("Failed to fetch user ID.");
        return;
      }
      setUserId(data.id);
    };
    fetchUserId();
  }, []);

  // Fetch bookings with listing & user info
  useEffect(() => {
    if (!userId) return;

    const fetchBookings = async () => {
      const { data, error } = await getBookingsWithDetailsByUserId(userId);
      console.log(data);
      if (error) {
        toast.error("Failed to fetch bookings.");
        console.error(error);
        return;
      }
      setBookings(data || []);
    };

    fetchBookings();
  }, [userId]);

  return (
    <div className="pt-16 px-4 md:px-6 max-w-7xl mx-auto">
      <h2 className="text-xl text-accent font-bold mb-4">My Bookings</h2>
      <Table className="text-white">
        <TableHeader>
          <TableRow>
            <TableHead>Booking From</TableHead>
            <TableHead>Booking To</TableHead>
            <TableHead>Listing Title</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Area Code</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No bookings found.
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((b, i) => (
              <TableRow key={i}>
                <TableCell>{format(new Date(b.booking_from), "LLL dd, yyyy")}</TableCell>
                <TableCell>{format(new Date(b.booking_to), "LLL dd, yyyy")}</TableCell>
                <TableCell>{b.listings?.title || "—"}</TableCell>
                <TableCell>{b.listings?.price || "—"}</TableCell>
                <TableCell>{b.listings?.city || "—"}</TableCell>
                <TableCell>{b.listings?.area_code || "—"}</TableCell>
                <TableCell>{b.users?.first_name || "—"}</TableCell>
                <TableCell>{b.users?.email || "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserBookingsTable;
