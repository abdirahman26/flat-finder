import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Building,
  Trash2,
  Eye,
  Edit,
  Home,
  ImageIcon,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import {
  addListing,
  addListingImage,
  getListing,
  removeListing,
  addListingAvailability,
  getUserDetails,
} from "@/app/(auth)/actions";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { DatePickerWithRange } from "@/components/DateRangePicker";

// Define the PropertyListing type
interface PropertyListing {
  listing_id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  area_code: string;
}

interface UserData {
  first_name: string;
  created_at: string;
  email: string;
  id_number: number;
}

const LandlordDash = () => {
  const [userData, setUserData] = useState<UserData>({
    first_name: "",
    created_at: "",
    email: "",
    id_number: 0o000,
  });
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // New property form state
  const [newProperty, setNewProperty] = useState<
    Omit<PropertyListing, "listing_id">
  >({
    title: "",
    description: "",
    price: 0,
    city: "",
    area: "",
    bedrooms: 1,
    bathrooms: 1,
    area_code: "",
  });

  // Property view state
  const [viewingProperty, setViewingProperty] = useState<Omit<
    PropertyListing,
    "listing_id"
  > | null>(null);

  const fetchListings = async () => {
    try {
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData?.user) {
        console.error("Error fetching user:", authError);
        toast.error("Failed to retrieve user data.");
        return;
      }

      const landlordId = authData.user.id;
      const { listingData, listingError } = await getListing(landlordId);

      if (listingError) {
        console.error("Error fetching listings:", listingError);
        toast.error("Failed to load listings.");
      } else if (listingData) {
        setProperties(Array.isArray(listingData) ? listingData : [listingData]); // Handle single or multiple results
      }
    } catch (err) {
      console.error("Unexpected error fetching listings:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  const fetchUserData = async () => {
    try {
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData?.user) {
        console.error("Error fetching user:", authError);
        toast.error("Failed to retrieve user data.");
        return;
      }

      const { data: userData, error: userError } = await getUserDetails();

      if (userError) {
        console.error("Error fetching user details:", userError);
        toast.error("Failed to retrieve user details.");
        return;
      } else if (userData) {
        setUserData({
          ...userData,
        });
      }
    } catch (err) {
      console.error("Unexpected error fetching user data:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  useEffect(() => {
    fetchListings();
    fetchUserData();
  }, []);

  // Handle input changes for new property form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewProperty({
      ...newProperty,
      [name]:
        name === "price" || name === "bedrooms" || name === "bathrooms"
          ? Number(value)
          : value,
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Image upload error:", uploadError);
      toast.error("Failed to upload image.");
      return;
    }

    const publicUrl = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath).data.publicUrl;
    setPreviewUrl(publicUrl);

    toast.success("Image uploaded successfully!");
  };

  const handleAddProperty = async () => {
    if (availability.length === 0) {
      toast.error(
        "Please add at least one availability range before adding the listing."
      );
      return;
    }

    const createdAt = new Date().toISOString();
    const propertyToAdd = {
      created_at: createdAt,
      ...newProperty,
    };

    try {
      const { data: addedListing, error } = await addListing(
        propertyToAdd.area,
        propertyToAdd.area_code,
        propertyToAdd.bathrooms,
        propertyToAdd.bedrooms,
        propertyToAdd.city,
        propertyToAdd.created_at,
        propertyToAdd.description,
        propertyToAdd.price,
        propertyToAdd.title
      );

      if (error) {
        toast.error("Failed to add listing. Please try again.");
        console.error("Error adding listing:", error ?? "Unknown error");
        console.log(error);
        return;
      }

      if (addedListing?.listing_id && availability.length > 0) {
        const availabilityPayload = availability.map((range) => ({
          available_from: range.from?.toISOString() ?? "",
          available_to: range.to?.toISOString() ?? "",
        }));

        const { error: availError } = await addListingAvailability(
          addedListing.listing_id,
          availabilityPayload
        );

        if (availError) {
          toast.error("Failed to save availability.");
          console.error("Availability error:", availError);
        }
      }

      if (previewUrl && addedListing?.listing_id) {
        const { error: imageError } = await addListingImage(
          addedListing?.listing_id,
          previewUrl
        );
        if (imageError) {
          console.error("Error adding listing image:", imageError);
          toast.error("Failed to save listing image.");
        }
      }
      //@ts-ignore
      setProperties([...properties, addedListing]);

      // Reset form
      setNewProperty({
        title: "",
        description: "",
        price: 0,
        city: "",
        area: "",
        bedrooms: 1,
        bathrooms: 1,
        area_code: "",
      });

      setPreviewUrl(null);

      toast.success("Property listing added successfully!");
    } catch (err) {
      console.error("Unexpected error adding listing:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  // Remove a property
  const handleRemoveProperty = async (id: string) => {
    try {
      const { listingError } = await removeListing(id);

      if (listingError) {
        toast.error("Failed to remove listing from database.");
        console.error("Error removing listing:", listingError);
        return;
      }

      // Remove from UI state after successful deletion
      setProperties((prevProperties) =>
        prevProperties.filter((property) => property.listing_id !== id)
      );

      toast.success("Property listing removed successfully!");
    } catch (err) {
      console.error("Unexpected error removing listing:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  // View property details
  const handleViewProperty = (property: PropertyListing) => {
    setViewingProperty(property);
  };

  const [availability, setAvailability] = useState<DateRange[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleRemoveAvailability = (index: number) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  // receive dates from picker
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
        console.log(
          "Checking overlap with:",
          a.from,
          "-",
          a.to,
          "→",
          isOverlap
        );
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mt-8 glass-card p-6 animate-slide-up">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {userData.first_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your property listings
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/80">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Listing
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Property Listing</DialogTitle>
                  <DialogDescription>
                    Enter the details of your new property listing.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="title" className="text-right">
                      Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      value={newProperty.title}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  {/* Image Upload Field */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <label htmlFor="image" className="text-right pt-2">
                      Image
                    </label>
                    <div className="col-span-3">
                      <label
                        htmlFor="image"
                        className="flex flex-col items-center justify-center w-full border border-input border-dashed rounded-md bg-background px-4 py-6 text-sm text-muted-foreground cursor-pointer hover:bg-gray-100 transition"
                      >
                        <ImageIcon className="mb-2 h-6 w-6 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, GIF up to 5MB
                        </span>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>

                      {previewUrl && (
                        <div className="relative mt-3 h-20 w-20 rounded-xl overflow-hidden border border-muted shadow">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />

                          {/* ✖ Close Button on top-right of the image */}
                          <button
                            onClick={() => setPreviewUrl(null)}
                            className="absolute top-1 right-1 bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md hover:bg-gray-200 transition"
                            aria-label="Remove image"
                            style={{ zIndex: 10 }}
                          >
                            &times;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="description" className="text-right">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newProperty.description}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  {/* Select availability */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="date" className="text-right">
                      Availability
                    </label>
                    <DatePickerWithRange
                      className="col-span-3"
                      onAdd={handleAddAvailability}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-span-4 col-start-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {availability.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className="text-center text-muted-foreground"
                              >
                                No availability added.
                              </TableCell>
                            </TableRow>
                          ) : (
                            availability.map((range, i) => (
                              <TableRow key={i}>
                                <TableCell>
                                  {range.from
                                    ? format(range.from, "LLL dd, y")
                                    : "—"}
                                </TableCell>
                                <TableCell>
                                  {range.to
                                    ? format(range.to, "LLL dd, y")
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      onClick={() =>
                                        handleRemoveAvailability(i)
                                      }
                                    >
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

                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="price" className="text-right">
                      Price ($)
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={newProperty.price.toString()}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="city" className="text-right">
                      City
                    </label>
                    <Input
                      id="city"
                      name="city"
                      value={newProperty.city}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="area" className="text-right">
                      Area
                    </label>
                    <Input
                      id="area"
                      name="area"
                      value={newProperty.area}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="area_code" className="text-right">
                      Zip-Code
                    </label>
                    <Input
                      id="area_code"
                      name="area_code"
                      value={newProperty.area_code}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="bedrooms" className="text-right">
                      Bedrooms
                    </label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      value={newProperty.bedrooms.toString()}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="bathrooms" className="text-right">
                      Bathrooms
                    </label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      value={newProperty.bathrooms.toString()}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" onClick={handleAddProperty}>
                    Add Property
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Property Listings Table */}
      <Card className="bg-custom-dark mb-8 text-white mt-7">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-8 w-8 text-accent " />
            <span className="text-2xl text-white">Your Property Listings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Bedrooms</TableHead>
                <TableHead>Bathrooms</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No properties listed yet. Add your first property!
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property) => (
                  <TableRow key={property.listing_id}>
                    <TableCell className="font-medium">
                      {property.title}
                    </TableCell>
                    <TableCell>
                      {property.area}, {property.city}
                    </TableCell>
                    <TableCell>${property.price}/month</TableCell>
                    <TableCell>{property.bedrooms}</TableCell>
                    <TableCell>{property.bathrooms}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="default"
                          size="icon"
                          onClick={() => handleViewProperty(property)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 text-custom-dark" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() =>
                            handleRemoveProperty(property.listing_id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Property Details Dialog */}
      <Dialog
        open={!!viewingProperty}
        onOpenChange={(open) => !open && setViewingProperty(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          {viewingProperty && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingProperty.title}</DialogTitle>
                <DialogDescription>
                  {viewingProperty.city}, {viewingProperty.area}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center justify-center p-2 border rounded-md">
                    <span className="text-muted-foreground">Price</span>
                    <span className="text-lg font-semibold">
                      ${viewingProperty.price}/mo
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 border rounded-md">
                    <span className="text-muted-foreground">Bedrooms</span>
                    <span className="text-lg font-semibold">
                      {viewingProperty.bedrooms}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 border rounded-md">
                    <span className="text-muted-foreground">Bathrooms</span>
                    <span className="text-lg font-semibold">
                      {viewingProperty.bathrooms}
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-muted-foreground">
                    {viewingProperty.description}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewingProperty(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandlordDash;
