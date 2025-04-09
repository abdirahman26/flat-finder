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
import { getListingAvailability, updateListingAvailability } from "@/app/(auth)/actions";
import { DatePickerWithRange } from "@/components/DateRangePicker";
import { toast } from "sonner";

interface UpdateAvailabilityProps {
  listingId: string;
}

const UpdateAvailability: React.FC<UpdateAvailabilityProps> = ({ listingId }) => {
  const [availability, setAvailability] = useState<DateRange[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
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

  const handleAddAvailability = (range: DateRange | undefined) => {
      if (!range?.from || !range?.to) return;
  
      // output all dates selected so for teh array
      const allDates = availability.map((a) => ({
        from: a.from,
        to: a.to,
      }));
  
      let overlap = false;
  
      for (const a of availability) {
        if (range.from && range.to && a.from && a.to) {
          const isOverlap = range.from <= a.to && range.to >= a.from;
          console.log("Checking overlap with:", a.from, "-", a.to, "→", isOverlap);
          if (isOverlap) {
            overlap = true;
            break;
          }
        }
      }
  
      if (overlap) {
        console.log("overlap", overlap);
        setShowErrorDialog(true);
        return;
      }
  
      setAvailability((prev) => [...prev, range]);
    };

  const handleRemoveAvailability = (index: number) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    const payload = availability.map((range) => ({
      available_from: range.from?.toISOString() ?? "",
      available_to: range.to?.toISOString() ?? "",
    }));
  
    const { error } = await updateListingAvailability(listingId, payload);
  
    if (error) {
      console.error("Failed to update availability:", error);
      toast.error("Failed to update availability.");
    } else {
      toast.success("Availability updated successfully!");
      setDialogOpen(false); 
    }
  };

  return (
    <>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Something went wrong</AlertDialogTitle>
            <AlertDialogDescription>
              This availability range overlaps with an existing one. Please select a different date.
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
            <Calendar className="h-3 w-3 mr-1" /> Check Availability
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Listing Availability</DialogTitle>
            <DialogDescription>
              Add or remove available dates for this listing.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="date" className="text-right">
              Availability
            </label>
            <DatePickerWithRange className="col-span-3" onAdd={handleAddAvailability} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4 mt-4">
            <div className="col-span-4 col-start-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="destructive" size="icon" onClick={() => handleRemoveAvailability(i)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
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
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateAvailability;