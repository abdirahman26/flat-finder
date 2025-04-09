"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Home,
  Calendar,
  Star,
  MapPin,
  User,
  Building,
  Mail,
  IdCard,
  ChartLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/supabase/client";
import { getListing, getUserDetails } from "@/app/(auth)/actions";
import { toast } from "sonner";

import UpdateAvailability from "@/components/UpdateAvailabiliity";


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
  image?: string | null;
}

interface UserData {
  first_name: string;
  created_at: string;
  email: string;
  id_number: number;
}

const LandlordProfile = () => {
  const [mounted, setMounted] = useState(false);
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [userData, setUserData] = useState<UserData>({
    first_name: "",
    created_at: "",
    email: "",
    id_number: 0,
  });
  const [initials, setInitials] = useState("");

  // Function to fetch images for each listing
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

  // Function to fetch listings and images
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
        const listingsWithImages = await Promise.all(
          listingData.map(async (listing: PropertyListing) => {
            const imageUrl = await fetchImage(listing.listing_id);
            return {
              ...listing,
              image: imageUrl,
            };
          })
        );
        setProperties(listingsWithImages);
      }
    } catch (err) {
      console.error("Unexpected error fetching listings:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  // Function to format the date
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function to fetch user details
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
          created_at: formatDate(userData.created_at),
        });
        setInitials(userData.first_name.charAt(0).toUpperCase());
      }
    } catch (err) {
      console.error("Unexpected error fetching user data:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  // Use effect hook to run on component mount
  useEffect(() => {
    setMounted(true);
    fetchListings();
    fetchUserData();
  }, []);

  // mock data for user
  const user = {
    verified: true,
    tripStats: {
      totalTrips: 27,
    },
  };

  return (
    <div
      className={`min-h-screen bg-dark ${
        mounted ? "animate-fade-in" : "opacity-0"
      }`}
    >
      <div className="pt-16 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {/* Left Column - Profile info */}
          <div className="md:w-1/3">
            <div
              className="glass-card p-6 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex flex-col items-center text-center mb-4">
                <Avatar className="flex items-center justify-center h-24 w-24 bg-custom-lime text-dark mb-4">
                  <span className="text-3xl font-semibold">{initials}</span>
                </Avatar>
                <h1 className="text-gray-300 text-2xl font-semibold mb-1">
                  {userData.first_name}
                </h1>
                <p className="text-gray-400 text-sm">{userData.created_at}</p>

                {user.verified && (
                  <Badge className="mt-2 bg-dark border border-custom-lime text-custom-lime">
                    <Star className="h-3 w-3 mr-1" /> FDM Approved
                  </Badge>
                )}
              </div>

              <Separator className="my-4 bg-white/10" />

              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-custom-lime shrink-0 mt-0.5 mr-2" />
                  <p className="text-sm text-gray-300">{userData.email}</p>
                </div>

                <div className="flex items-start">
                  <IdCard className="h-5 w-5 text-custom-lime shrink-0 mt-0.5 mr-2" />
                  <p className="text-sm text-gray-300">
                    {userData.id_number.toString()}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button className="w-full bg-custom-lime text-dark hover:bg-custom-lime/90">
                  <MessageCircle className="mr-2 h-4 w-4" /> Contact Host
                </Button>
              </div>
            </div>

            <div
              className="glass-card p-6 mt-6 animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <h2 className="text-lg font-semibold mb-4 text-custom-lime flex items-center">
                <ChartLine className="mr-2 h-5 w-5" /> Analytics
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Total Properties</span>
                  <span className="font-medium">{properties.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Listings */}
          <div className="md:w-2/3">
            <div
              className="glass-card p-6 animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <h2 className="text-xl font-semibold mb-6 text-custom-lime flex items-center">
                <Building className="mr-2 h-5 w-5" /> {userData.first_name}'s
                Listings
              </h2>

              <div className="space-y-6">
                {properties.map((listing) => (
                  <Card
                    key={listing.listing_id}
                    className="bg-dark/60 border border-white/10 overflow-hidden hover:border-custom-lime/50 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 h-48 md:h-auto relative">
                        {listing.image ? (
                          <img
                            src={listing.image}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                            No Image Available
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 md:w-2/3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-1 text-white">
                            {listing.title}
                          </h3>
                          <p className="text-gray-400 text-sm flex items-center mb-2">
                            <MapPin className="h-3 w-3 mr-1" /> {listing.area},{" "}
                            {listing.city}
                          </p>
                          <p className="text-custom-lime font-medium mb-2">
                            £{listing.price}
                          </p>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-custom-lime fill-custom-lime mr-1" />
                            <span className="mr-1 text-white">4.97</span>
                            <span className="text-gray-400 text-sm">
                              Listing reviews here
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-sm"
                          >
                            View Details
                          </Button>
                          <UpdateAvailability listingId={listing.listing_id}/>
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
};

export default LandlordProfile;
