"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Trash2, Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";
import { getListingAvailability, updateListingAvailability, addBooking } from "@/app/(auth)/actions";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { toast } from "sonner";
import { getUserDetails } from '@/app/(auth)/actions';
import { Toaster } from "@components/ui/sonner";

interface UpdateAvailabilityProps {
  listingId: string;
}

const ScheduleBooking: React.FC<UpdateAvailabilityProps> = ({ listingId}) => {

  const [availability, setAvailability] = useState<DateRange[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  const [userId, setUserId] = useState<string | null>(null);

  // get userId from session
  const fetchUserId = async () => {
    const { data, error } = await getUserDetails();
    if (error) {
      console.error("Failed to load userId:", error);
      return;
    }
    if (data?.id ){
      setUserId(data.id);
    }
  };

  useEffect(() => {
    console.log("Logged-in consultant userId:", userId);
  }, [userId]);

  useEffect(() => {
    fetchUserId();
  }, []);
  
  
  useEffect(() => {
    const fetchAvailability = async () => {
      const { data, error } = await getListingAvailability(listingId);

      if (error) {
        console.error("Failed to load availability:", error);
        return;
      }

      const mapped = data
        .map((entry: { available_from: string | null; available_to: string | null }) => ({
          from: entry.available_from ? new Date(entry.available_from) : null,
          to: entry.available_to ? new Date(entry.available_to) : null,
        }))
        .filter((range) => range.from && range.to) as { from: Date; to: Date }[];

      setAvailability(mapped);
    };

    fetchAvailability();
  }, [listingId]);

  const mergeAdjacentRanges = (ranges: DateRange[]): DateRange[] => {
    const sorted = [...ranges]
      .filter((r) => r.from && r.to)
      .sort((a, b) => a.from!.getTime() - b.from!.getTime());
  
    const merged: DateRange[] = [];
  
    for (const range of sorted) {
      const from = range.from!;
      const to = range.to!;
  
      if (merged.length === 0) {
        merged.push({ from, to });
        continue;
      }
  
      const last = merged[merged.length - 1];
  
      // If last.to and current.from are same day (ignoring time), merge
      const lastTo = new Date(last.to!);
      const nextFrom = new Date(from);
  
      if (
        lastTo.getFullYear() === nextFrom.getFullYear() &&
        lastTo.getMonth() === nextFrom.getMonth() &&
        lastTo.getDate() === nextFrom.getDate()
      ) {
        merged[merged.length - 1].to = to; // extend previous
      } else {
        merged.push({ from, to });
      }
    }
  
    return merged;
  };

  const isWithinMultipleRanges = (from: Date, to: Date): boolean => {
    const merged = mergeAdjacentRanges(availability);
  
    return merged.some((range) => {
      return from >= range.from! && to <= range.to!;
    });
  };
  


  const handleSaveChanges = async () => {
    if (!selectedRange?.from || !selectedRange?.to) {
      toast.error("Please select a booking range.");
      return;
    }
  
    const bookingFrom = new Date(Date.UTC(
      selectedRange.from.getFullYear(),
      selectedRange.from.getMonth(),
      selectedRange.from.getDate(),
      15, 0, 0, 0
    ));
  
    const bookingTo = new Date(Date.UTC(
      selectedRange.to.getFullYear(),
      selectedRange.to.getMonth(),
      selectedRange.to.getDate(),
      12, 0, 0, 0
    ));
  
    const isCovered = availability.some(a =>
      a.from && a.to &&
      bookingFrom >= a.from &&
      bookingTo <= a.to
    ) || isWithinMultipleRanges(bookingFrom, bookingTo);
  
    if (!isCovered) {
      toast.error("Selected booking is not fully within the available dates.");
      console.log("Selected booking is not fully within the available dates.");
      setShowErrorDialog(true);
      return;
    }

    // Replace previous toast.success and dialog close:
    const newAvailability = subtractBookingFromAvailability(availability, {
      from: bookingFrom,
      to: bookingTo,
    });



    setAvailability(newAvailability);

    const payload = newAvailability.map((range) => ({
      available_from: range.from!.toISOString(),
      available_to: range.to!.toISOString(),
    }));
  
    const { error: updateError } = await updateListingAvailability(listingId, payload);
  
    if (updateError) {
      toast.error("Failed to update availability in the database.");
      console.error("Supabase update error:", updateError);
      return;
    }

    console.log("userId:", userId);
    console.log("listingId:", listingId);
    console.log("bookingFrom:", bookingFrom);
    console.log("bookingTo:", bookingTo);


    if (userId) {
      const { error: bookingError } = await addBooking(
        listingId,
        userId,
        bookingFrom.toISOString(),
        bookingTo.toISOString()
      );
    
      if (bookingError) {
        toast.error("Booking could not be saved.");
        console.error("Booking insert error:", bookingError);
        return;
      }
    
      console.log("Booking saved to DB:", {
        listing_id: listingId,
        user_id: userId,
        booked_from: bookingFrom,
        booked_to: bookingTo,
      });
    }

    console.log("Updated availability:", newAvailability);
  
    toast.success("Booking confirmed!", {
      description: `Your booking has been scheduled.`,
      duration: 4000, // milliseconds
    });
    console.log("Booking confirmed!");
    // console.log("Selected range:", selectedRange);
    // out put the actual selected range without condering timezone
    console.log("Booking submitted with range:", {
      from: selectedRange?.from?.toISOString(),
      to: selectedRange?.to?.toISOString(),
    });
    setDialogOpen(false);
  };

  const subtractBookingFromAvailability = (
    original: DateRange[],
    booking: DateRange
  ): DateRange[] => {
    const newAvailability: DateRange[] = [];
  
    const isSameDay = (date1: Date, date2: Date) =>
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  
    for (const range of mergeAdjacentRanges(original)) {
      const aFrom = range.from!;
      const aTo = range.to!;
      const bFrom = booking.from!;
      const bTo = booking.to!;
  
      if (bTo <= aFrom || bFrom >= aTo) {
        newAvailability.push({ from: aFrom, to: aTo });
      } else {
        if (bFrom > aFrom && !isSameDay(aFrom, bFrom)) {
          newAvailability.push({ from: aFrom, to: bFrom });
        }
  
        if (bTo < aTo && !isSameDay(bTo, aTo)) {
          newAvailability.push({ from: bTo, to: aTo });
        }
      }
    }
  
    return newAvailability;
  };
  
  return (
    <>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unavailable Booking Range</AlertDialogTitle>
            <AlertDialogDescription>
              The selected booking dates are not fully within any available date range.
              Please choose a different range that fits the available schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowErrorDialog(false)}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>

        
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="bg-custom-lime text-dark hover:bg-custom-lime/90 text-sm"
            onClick={() => setDialogOpen(true)}
          >
            <Calendar className="h-3 w-3 mr-1" /> Schedule
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Booking Availability</DialogTitle>
            <DialogDescription>
              This listing has the following available dates. Please select one range to schedule a booking.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="date" className="text-right">
              Choose from Available Ranges
            </label>
            <DatePickerWithRange className="col-span-3" onAdd={setSelectedRange} />

          </div>

          <div className="grid grid-cols-4 items-center gap-4 mt-4">
            <div className="col-span-4 col-start-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
            
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availability.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No availability added.
                      </TableCell>
                    </TableRow>
                  ) : (
                    availability.map((range, i) => (
                      <TableRow key={i}>
                        <TableCell>{range.from ? format(range.from, "LLL dd, y") : "—"}</TableCell>
                        <TableCell>{range.to ? format(range.to, "LLL dd, y") : "-"}</TableCell>
                     
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={handleSaveChanges}  disabled={availability.length === 0}
              title={availability.length === 0 ? "Add at least one availability before saving" : ""}>
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScheduleBooking;