"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Heart,
  Search,
  MapPin,
  Star,
  Filter,
  Calendar,
  MessageCircle,
  Home,
  User,
  Building,
  List,
  Grid,
  GripHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import {
  getAllListings,
  getUserDetails,
  getAllFavouritesByUserID,
  removeFavourite,
  addFavourite,
} from "@/app/(auth)/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PropertyListing {
  listing_id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  area_code: string;
  users: {
    first_name: string | null;
  } | null;
  listing_images: {
    url: string | null;
  } | null;
}

interface UserData {
  first_name: string;
  created_at: string;
  email: string;
  id_number: number;
}

const ConsultantDash = () => {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<[number, number]>([0, 5000]);
  const [bedroomsFilter, setBedroomsFilter] = useState<number>(1);
  const [bathroomsFilter, setBathroomsFilter] = useState<number>(1);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [initials, setInitials] = useState("");
  const [userData, setUserData] = useState<UserData>({
    first_name: "",
    created_at: "",
    email: "",
    id_number: 0o000,
  });
  const [propertiess, setPropertiess] = useState<PropertyListing[]>([]);

  //array of listing_ids that are present in favourites for a given user_id
  const [favouritedListingIds, setFavouritedListingIds] = useState<string[]>(
    []
  );

  const router = useRouter();

  // Toggles Favourite for a given listing_id
  const toggleFavourite = async (id: string) => {
    const isFavorited = favouritedListingIds.includes(id);

    try {
      if (isFavorited) {
        await removeFavourite(id);
        setFavouritedListingIds((prev) =>
          prev.filter((listing_id) => listing_id !== id)
        );
        toast.success("Removed from favorites");
      } else {
        await addFavourite(id);
        setFavouritedListingIds((prev) => [...prev, id]);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Filter properties based on search and filters
  const filteredProperties = propertiess.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    // listing.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice =
      listing.price >= priceFilter[0] && listing.price <= priceFilter[1];

    const matchesBedrooms =
      bedroomsFilter === 0 || listing.bedrooms >= bedroomsFilter;

    const matchesBathrooms = // added for bathrooms filter
      bathroomsFilter === 0 || listing.bathrooms >= bathroomsFilter;

    const matchesFilter =
      selectedFilter === "All" ||
      (selectedFilter === "Apartments" &&
        listing.title.includes("Apartment")) ||
      (selectedFilter === "Houses" && listing.title.includes("Home")) ||
      (selectedFilter === "Cabins" && listing.title.includes("Cabin")) ||
      (selectedFilter === "Beachfront" &&
        listing.title.includes("Beachfront")) ||
      (selectedFilter === "Downtown" && listing.title.includes("Downtown"));

    return (
      matchesSearch &&
      matchesPrice &&
      matchesBedrooms &&
      matchesFilter &&
      matchesBathrooms
    );
  });

  //The favourited properties (essentially goes through the array of favourited listingIDs and filters the propertiess array into a new array)
  const favouritedProperties = propertiess.filter((property) =>
    favouritedListingIds.includes(property.listing_id)
  );

  const searchListings = async (query = "") => {
    try {
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData?.user) {
        console.error("Error fetching user:", authError);
        toast.error("Failed to retrieve user data.");
        return;
      }

      let supabaseQuery = supabase.from("listings").select(`
    listing_id,
    user_id,
    title,
    description,
    price,
    city,
    area,
    bedrooms,
    bathrooms,
    area_code,
    users!listings_user_id_fkey(
      first_name
    ),
    listing_images (
      url
    )
  `);

      if (query.trim() !== "") {
        const keyword = `%${query.trim()}%`;
        console.log("[searchListings] Called with query:", keyword);
        supabaseQuery = supabaseQuery.or(
          `title.ilike."${keyword}",description.ilike."${keyword}",city.ilike."${keyword}"`
        );
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        console.error("Error fetching listings:", error.message);
        toast.error("Could not fetch listings.");
      } else {
        setPropertiess(data);
        console.log(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching listings:", err);
      toast.error("An unexpected error occurred.");
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

      const { listingData, listingError } = await getAllListings();

      if (listingError) {
        console.error("Error fetching listings:", listingError);
        toast.error("Failed to load listings.");
      } else if (listingData) {
        setPropertiess(
          Array.isArray(listingData) ? listingData : [listingData]
        );
      }
    } catch (err) {
      console.error("Unexpected error fetching listings:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        setInitials(userData.first_name.charAt(0).toUpperCase());
      }
    } catch (err) {
      console.error("Unexpected error fetching user data:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  const fetchFavourites = async () => {
    const { data, error } = await getAllFavouritesByUserID();
    if (data) setFavouritedListingIds(data);
    if (error) toast.error("Failed to load favorites");
  };

  const handleProfileRoute = (userId: string) => {
    router.push(`profile/${userId}`);
  };

  useEffect(() => {
    setMounted(true);
    fetchUserData();
    fetchListings();
    fetchFavourites();
  }, []);
  return (
    <div
      className={`min-h-screen bg-dark ${
        mounted ? "animate-fade-in" : "opacity-0"
      }`}
    >
      <div className="pt-16 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mt-8 glass-card p-6 animate-slide-up">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {userData.first_name}
              </h1>
              <p className="text-muted-foreground mt-1">
                Browse properties or search for specific listings
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-accent text-dark hover:bg-accent/90">
                <Calendar className="mr-2 h-4 w-4" /> View Schedulings
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div
          className="mt-6 glass-card p-4 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by location, property type, or keywords..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  searchListings(value);
                }}
                className="pl-9 bg-dark/60 border-white/10 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-white/20 hover:bg-white/10 text-white"
              >
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
              <div className="flex border border-white/20 rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-none border-0"
                >
                  <GripHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-between">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <Slider
                      value={priceFilter}
                      onValueChange={(value) => {
                        const [newMin, newMax] = value;
                        if (newMin >= priceFilter[1]) return;
                        if (newMax <= priceFilter[0]) return;

                        setPriceFilter(value as [number, number]);
                      }}
                      min={0}
                      max={5000}
                      step={50}
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>${priceFilter[0]}</span>
                      <span>${priceFilter[1]}</span>
                    </div>
                  </div>
                </div>
                <div className="mx-auto">
                  <label className="block text-sm text-gray-400 mb-2">
                    Minimum Bedrooms
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, "5+"].map((num) => (
                      <Button
                        key={num}
                        variant={
                          bedroomsFilter === (num === "5+" ? 5 : Number(num))
                            ? "secondary"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setBedroomsFilter(num === "5+" ? 5 : Number(num))
                        }
                        className={
                          bedroomsFilter === (num === "5+" ? 5 : Number(num))
                            ? "bg-accent text-dark hover:bg-accent/90"
                            : "border-white/20 hover:bg-white/10"
                        }
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mx-auto">
                  <label className="block text-sm text-gray-400 mb-2">
                    Minimum Bathrooms
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, "5+"].map((num) => (
                      <Button
                        key={num}
                        variant={
                          bathroomsFilter === (num === "5+" ? 5 : Number(num))
                            ? "secondary"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setBathroomsFilter(num === "5+" ? 5 : Number(num))
                        }
                        className={
                          bathroomsFilter === (num === "5+" ? 5 : Number(num))
                            ? "bg-accent text-dark hover:bg-accent/90"
                            : "border-white/20 hover:bg-white/10"
                        }
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Apply Reset
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setPriceFilter([0, 5000]);
                        setBedroomsFilter(1);
                        setBathroomsFilter(1);
                        setSelectedFilter("All");
                      }}
                      className="border-white/20 hover:bg-white/10 text-white"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Property Results */}
        <div
          className="mt-6 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-accent flex items-center">
            <Building className="mr-2 h-5 w-5" /> Properties (
            {filteredProperties.length})
          </h2>

          {propertiess.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">No properties found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setPriceFilter([0, 5000]);
                  setBedroomsFilter(1);
                  setBathroomsFilter(1);
                  setSelectedFilter("All");
                }}
                className="bg-accent text-dark hover:bg-accent/90"
              >
                Reset All Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((listing) => (
                <Card
                  key={listing.listing_id}
                  className="glass-card overflow-hidden hover:border-accent/50 transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={listing.listing_images?.url ?? undefined}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavourite(listing.listing_id)}
                      className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 rounded-full"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favouritedListingIds.includes(listing.listing_id)
                            ? "fill-accent text-accent"
                            : "text-white"
                        }`}
                      />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{listing.title}</h3>
                    </div>

                    <p className="text-gray-400 text-sm flex items-center mb-2">
                      <MapPin className="h-3 w-3 mr-1" /> {listing.area_code}
                      {""}
                      {listing.area}
                    </p>

                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {listing.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-accent font-medium">
                        ${listing.price}/month
                      </p>
                      <div className="flex items-center text-sm">
                        <User className="h-3 w-3 mr-1 text-gray-600" />
                        <span className="text-gray-400">
                          Host: {listing.users?.first_name}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center text-sm space-x-2 text-gray-400">
                      <span>{listing.bedrooms} bed</span>
                      <span>•</span>
                      <span>{listing.bathrooms} bath</span>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProfileRoute(listing.user_id)}
                        className="border-white/20 text-sm flex-1"
                      >
                        Contact Host
                      </Button>
                      <Button
                        size="sm"
                        className="bg-accent text-dark hover:bg-accent/90 text-sm flex-1"
                      >
                        <Calendar className="h-3 w-3 mr-1" /> Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProperties.map((listing) => (
                <Card
                  key={listing.listing_id}
                  className="glass-card overflow-hidden hover:border-accent/50 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      <img
                        src={listing.listing_images?.url ?? undefined}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavourite(listing.listing_id)}
                        className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 rounded-full"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            favouritedListingIds.includes(listing.listing_id)
                              ? "fill-accent text-accent"
                              : "text-white"
                          }`}
                        />
                      </Button>
                    </div>

                    <CardContent className="p-4 md:w-2/3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">
                            {listing.title}
                          </h3>
                        </div>

                        <p className="text-gray-400 text-sm flex items-center mb-2">
                          <MapPin className="h-3 w-3 mr-1" />{" "}
                          {listing.area_code}
                          {""}
                          {listing.area}
                        </p>

                        <p className="text-sm text-gray-400 mb-3">
                          {listing.description}
                        </p>

                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 text-gray-600" />
                            <span className="text-gray-400 text-sm">
                              Host: {listing.users?.first_name}
                            </span>
                          </div>
                          <div className="flex items-center text-sm space-x-2 text-gray-400">
                            <span>{listing.bedrooms} bed</span>
                            <span>•</span>
                            <span>{listing.bathrooms} bath</span>
                          </div>
                        </div>

                        <p className="text-accent font-medium">
                          ${listing.price}/month
                        </p>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-sm"
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-accent text-dark hover:bg-accent/90 text-sm"
                        >
                          <Calendar className="h-3 w-3 mr-1" /> Schedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProfileRoute(listing.user_id)}
                          className="border-white/20 text-sm"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" /> Contact
                          Host
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Watchlist Section */}
        <div
          className="mt-8 mb-6 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-accent flex items-center">
            <Heart className="mr-2 h-5 w-5" /> Your Watchlist (
            {favouritedProperties.length})
          </h2>

          {favouritedProperties.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">
                Your watchlist is empty
              </h3>
              <p className="text-gray-400 mb-4">
                Save properties you're interested in by clicking the heart icon.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {favouritedProperties.map((property) => (
                  <Card
                    key={property.listing_id}
                    className="glass-card w-80 overflow-hidden hover:border-accent/50 transition-all duration-300"
                  >
                    <div className="relative">
                      <img
                        src={property.listing_images?.url ?? undefined}
                        alt={property.title}
                        className="w-full h-40 object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavourite(property.listing_id)}
                        className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 rounded-full"
                      >
                        <Heart className="h-5 w-5 fill-accent text-accent" />
                      </Button>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-base">
                          {property.title}
                        </h3>
                      </div>

                      <p className="text-gray-400 text-sm flex items-center mb-1">
                        <MapPin className="h-3 w-3 mr-1" /> {property.area_code}
                      </p>

                      <p className="text-accent font-medium">
                        ${property.price}/month
                      </p>

                      <div className="mt-3 flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-accent text-dark hover:bg-accent/90 text-sm flex-1"
                        >
                          <Calendar className="h-3 w-3 mr-1" /> Schedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultantDash;
