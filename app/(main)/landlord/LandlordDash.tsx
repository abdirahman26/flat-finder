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
import { Plus, Building, Trash2, Eye, Edit, Home } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { addListing, getListing, removeListing } from "@/app/(auth)/actions";

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

const LandlordDash = () => {
  // Sample initial data for properties
  const [properties, setProperties] = useState<PropertyListing[]>([]);

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

  useEffect(() => {
    fetchListings();
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

  // Add a new property
  const handleAddProperty = async () => {
    const newId = Date.now().toString();
    const createdAt = new Date().toISOString();
    const propertyToAdd = {
      listing_id: newId,
      created_at: createdAt,
      ...newProperty,
    };

    try {
      const { error } = await addListing(
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

      setProperties([...properties, propertyToAdd]);

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="w-full px-6 py-4 rounded-xl border-[1px] border-gray-700 bg-custom-dark mb-5 shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
        <h1 className="text-3xl font-bold text-accent">Landlord Dashboard</h1>
      </div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white">Manage Listings</h2>
          <p className="text-muted-foreground mt-1 font-medium">
            Add, view and manage your property listings
          </p>
        </div>
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

      {/* Property Listings Table */}
        <div className="overflow-hidden rounded-xl border border-gray-700 bg-custom-dark mb-8 text-white px-6 py-6 shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
          <h3 className="text-2xl text-white font-semibold flex items-center mb-8">
            <Building className="mr-2 h-5 w-5 text-accent" />
            Your Property Listings
          </h3>
          <Table>
            <TableHeader className="text-white">
              <TableRow className="hover:bg-transparent text-white relative border-gray-700">
                <TableHead className="text-white">Title</TableHead>
                <TableHead className="text-white">Location</TableHead>
                <TableHead className="text-white">Price</TableHead>
                <TableHead className="text-white">Bedrooms</TableHead>
                <TableHead className="text-white">Bathrooms</TableHead>
                <TableHead className="text-white text-right ">Actions</TableHead>
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
                  <TableRow key={property.listing_id} className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 hover:bg-custom-gray-hover data-[state=selected]:bg-custom-gray-selected border-gray-700">
                    <TableCell className="font-medium">
                      {property.title}
                    </TableCell>
                    <TableCell>
                      {property.area}, {property.city}
                    </TableCell>
                    <TableCell><span className="text-accent">${property.price}/month</span></TableCell>
                    <TableCell>{property.bedrooms}</TableCell>
                    <TableCell>{property.bathrooms}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewProperty(property)}
                          className="!border-gray-700 !bg-custom-dark"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
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
        </div>

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
