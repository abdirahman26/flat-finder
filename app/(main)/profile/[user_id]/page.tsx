"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getListingById, getUserDetailsById } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { Separator } from "@/components/ui/separator";
import {
  Badge,
  Star,
  Mail,
  IdCard,
  MessageCircle,
  Home,
  Building,
  MapPin,
  Calendar,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";

interface OtherUserData {
  created_at: string;
  email: string;
  first_name: string;
  id: string;
  id_number: number;
  is_verified: boolean;
  role: string;
}

interface PropertyListing {
  area: string;
  area_code: string;
  bathrooms: number;
  bedrooms: number;
  city: string;
  created_at: string;
  description: string;
  is_verified: string;
  listing_id: string;
  price: number;
  title: string;
  user_id: string;
  listing_images: {
    url: string | null;
  } | null;
}

function Page() {
  const [mounted, setMounted] = useState(false);
  const [initials, setInitials] = useState("");
  const [otherUserData, setOtherUserData] = useState<OtherUserData | null>(
    null
  );
  const [properties, setProperties] = useState<PropertyListing[]>([]);

  const params = useParams();
  const userId = params.user_id?.toString();

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchImage = async (listingId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("listing_images")
        .select("url")
        .eq("listing_id", listingId)
        .maybeSingle(); // Assuming there's one image per listing

      if (error) {
        console.error("Error fetching image:", error);
        return null;
      }

      return data?.url || null; // Return the image URL or null if not found
    } catch (err) {
      console.error("Unexpected error fetching image:", err);
      return null;
    }
  };
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

      const { listingData, listingError } = await getListingById(userId);

      if (listingError) {
        console.error("Error fetching listings:", listingError);
        toast.error("Failed to load listings.");
      } else if (listingData) {
        setProperties(Array.isArray(listingData) ? listingData : [listingData]);
      }
    } catch (err) {
      console.error("Unexpected error fetching listings:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  const fetchUserDetails = async () => {
    if (!userId) return;
    const { data: otherData, error } = await getUserDetailsById(userId);

    if (error) {
      console.error("Error:", error);
      return;
    }

    setOtherUserData(otherData);
    setInitials(otherData.first_name.charAt(0).toUpperCase());
  };

  useEffect(() => {
    setMounted(true);
    fetchUserDetails();
    fetchListings();
  }, []);

  if (!otherUserData) {
    return <div className="text-white p-8">Loading user profile...</div>;
  }

  return (
    <div
      className={`min-h-screen bg-dark ${
        mounted ? "animate-fade-in" : "opacity-0"
      }`}
    >
      <div className="pt-16 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {/* Left Column */}
          <div className="md:w-1/3">
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex flex-col items-center text-center mb-4">
                <Avatar className="flex items-center justify-center h-24 w-24 bg-custom-lime text-dark mb-4">
                  <span className="text-3xl font-semibold">{initials}</span>
                </Avatar>
                <h1 className="text-gray-300 text-2xl font-semibold mb-1">
                  {otherUserData.first_name}
                </h1>
                <p className="text-gray-400 text-sm">
                  Joined on {otherUserData.created_at.split("T")[0]}
                </p>

                {otherUserData.is_verified && (
                  <Badge className="mt-2 bg-dark border border-custom-lime text-custom-lime">
                    <Star className="h-3 w-3 mr-1" /> FDM Approved
                  </Badge>
                )}
              </div>

              <Separator className="my-4 bg-white/10" />

              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-custom-lime mr-2" />
                  <p className="text-sm text-gray-300">{otherUserData.email}</p>
                </div>

                <div className="flex items-start">
                  <IdCard className="h-5 w-5 text-custom-lime mr-2" />
                  <p className="text-sm text-gray-300">
                    {otherUserData.id_number}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button className="w-full bg-custom-lime text-dark hover:bg-custom-lime/90">
                  <MessageCircle className="mr-2 h-4 w-4" /> Contact Host
                </Button>
              </div>
            </div>

            <div className="glass-card p-6 mt-6 animate-slide-up">
              <h2 className="text-lg font-semibold mb-4 text-custom-lime flex items-center">
                <Home className="mr-2 h-5 w-5" /> Landlord Stats
              </h2>

              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between">
                  <span>Total Properties</span>
                  <span className="font-medium">{properties.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:w-2/3">
            <div className="glass-card p-6 animate-slide-up">
              <h2 className="text-xl font-semibold mb-6 text-custom-lime flex items-center">
                <Building className="mr-2 h-5 w-5" /> {otherUserData.first_name}
                &apos;s Listings
              </h2>

              <div className="space-y-6">
                {properties.map((listing) => (
                  <Card
                    key={listing.listing_id}
                    className="bg-dark/60 border border-white/10"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 h-48 bg-gray-700">
                        {listing.listing_images?.url ? (
                          <img
                            src={listing.listing_images.url ?? undefined}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                            No Image Available
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4 md:w-2/3">
                        <h3 className="text-white font-semibold text-lg mb-1">
                          {listing.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-2 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" /> {listing.area},{" "}
                          {listing.city}
                        </p>
                        <p className="text-custom-lime font-medium mb-2">
                          £{listing.price}
                        </p>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            className="bg-custom-lime text-dark"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Check Availability
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
