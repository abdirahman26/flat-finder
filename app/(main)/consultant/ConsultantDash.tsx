"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  addFavourite,
  removeFavourite,
  getAllFavouritesByUserID,
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
    first_name: string;
  };
  favourited: boolean;
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
  const [bedroomsFilter, setBedroomsFilter] = useState<number>(0);
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
  const [listings, setListings] = useState<PropertyListing[]>([]);

  const router = useRouter();

  const fetchAllListings = async (): Promise<PropertyListing[]> => {
    try {
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData?.user) {
        console.error("Error fetching user:", authError);
        toast.error("Failed to retrieve user data.");
        return [];
      }

      const user_id = authData.user.id;

      const { listingData, listingError } = await getAllListings();

      if (listingError) {
        console.error("Error fetching listings:", listingError);
        toast.error("Failed to retrieve listings.");
        return [];
      }

      if (!listingData || !Array.isArray(listingData)) {
        throw new Error("Listing data is missing or not an array");
      }

      const { data: favouritedListings, error: favouritesError } =
        await getAllFavouritesByUserID(user_id);

      if (favouritesError) {
        console.error("Error fetching favourites:", favouritesError);
        toast.error("Failed to retrieve favourites.");
        return [];
      }

      const favouritedListingIDs = new Set(
        favouritedListings.map((fav) => fav.listing_id),
      );

      return listingData.map((listing) => ({
        ...listing,
        favourited: favouritedListingIDs.has(listing.listing_id),
      }));
    } catch (error) {
      console.error("Error fetching listings:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadListings = async () => {
      const data = await fetchAllListings();
      setListings(data);
    };

    loadListings();
  }, []);

  const toggleFavourite = async (id: string) => {
    setListings((prevListings) =>
      prevListings.map((listing) =>
        listing.listing_id === id
          ? { ...listing, favourited: !listing.favourited }
          : listing,
      ),
    );

    const updatedListing = listings.find((l) => l.listing_id === id);

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      console.error("Error fetching user:", authError);
      toast.error("Failed to retrieve user data.");
      return;
    }

    if (updatedListing) {
      const user_id = authData.user.id;

      if (updatedListing.favourited) {
        console.log("removed favourite");
        await removeFavourite(user_id, updatedListing.listing_id);
        toast.success(`${updatedListing.title} removed from your watchlist!`);
      } else {
        console.log("added favourite");
        await addFavourite(user_id, updatedListing.listing_id);
        toast.success(`${updatedListing.title} added to your watchlist!`);
      }
    }
  };

  // Filter listings based on search and filters
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${listing.city}, ${listing.area}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesPrice =
      listing.price >= priceFilter[0] && listing.price <= priceFilter[1];

    const matchesBedrooms =
      bedroomsFilter === 0 || listing.bedrooms >= bedroomsFilter;

    const matchesFilter =
      selectedFilter === "All" ||
      (selectedFilter === "Apartments" &&
        listing.title.includes("Apartment")) ||
      (selectedFilter === "Houses" && listing.title.includes("Home")) ||
      (selectedFilter === "Cabins" && listing.title.includes("Cabin")) ||
      (selectedFilter === "Beachfront" &&
        listing.title.includes("Beachfront")) ||
      (selectedFilter === "Downtown" && listing.title.includes("Downtown"));

    return matchesSearch && matchesPrice && matchesBedrooms && matchesFilter;
  });

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

  const handleProfileRoute = (userId: string) => {
    router.push(`profile/${userId}`);
  };

  useEffect(() => {
    setMounted(true);
    fetchUserData();
  }, []);

  // Filter options
  const filterOptions = [
    "All",
    "Apartments",
    "Houses",
    "Cabins",
    "Beachfront",
    "Downtown",
  ];

  return (
    <div
      className={`min-h-screen bg-dark ${
        mounted ? "animate-fade-in" : "opacity-0"
      }`}
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-10 glass-card bg-dark/90 backdrop-blur-lg px-4 py-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center space-x-6 ">
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-accent text-dark text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {listings.filter((l) => l.favourited).length}
            </span>
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <div className="flex items-center bg-dark/60 rounded-full px-3 py-1 border border-white/10">
            <div className="h-8 w-8 bg-accent text-dark rounded-full flex items-center justify-center mr-2">
              <span>{initials}</span>
            </div>
            <span className="hidden md:inline-block text-sm text-white">
              {userData.first_name}
            </span>
          </div>
        </div>
      </nav>

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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-dark/60 border-white/10"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceFilter[0]}
                      onChange={(e) =>
                        setPriceFilter([
                          parseInt(e.target.value) || 0,
                          priceFilter[1],
                        ])
                      }
                      className="bg-dark/60 border-white/10"
                    />
                    <span className="text-gray-400">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceFilter[1]}
                      onChange={(e) =>
                        setPriceFilter([
                          priceFilter[0],
                          parseInt(e.target.value) || 5000,
                        ])
                      }
                      className="bg-dark/60 border-white/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Minimum Bedrooms
                  </label>
                  <div className="flex space-x-2">
                    {[0, 1, 2, 3, 4, "5+"].map((num) => (
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
                        setBedroomsFilter(0);
                        setSelectedFilter("All");
                      }}
                      className="border-white/20 hover:bg-white/10 text-white"
                    >
                      Reset Filters
                    </Button>
                    <Button
                      size="sm"
                      className="bg-accent text-dark hover:bg-accent/90"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div
          className="mt-4 flex flex-wrap gap-2 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          {filterOptions.map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter)}
              className={
                selectedFilter === filter
                  ? "bg-accent text-dark hover:bg-accent/90"
                  : "border-white/20 hover:bg-white/10 text-white"
              }
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Property Results */}
        <div
          className="mt-6 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-accent flex items-center">
            <Building className="mr-2 h-5 w-5" /> Properties (
            {filteredListings.length})
          </h2>

          {filteredListings.length === 0 ? (
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
                  setBedroomsFilter(0);
                  setSelectedFilter("All");
                }}
                className="bg-accent text-dark hover:bg-accent/90"
              >
                Reset All Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card
                  key={listing.listing_id}
                  className="glass-card overflow-hidden hover:border-accent/50 transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      // src={listing.image}
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
                          listing.favourited
                            ? "fill-accent text-accent"
                            : "text-white"
                        }`}
                      />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{listing.title}</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-accent fill-accent mr-1" />
                        <span>0</span>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm flex items-center mb-2">
                      <MapPin className="h-3 w-3 mr-1" /> {listing.city},{" "}
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
                        <User className="h-3 w-3 mr-1 text-gray-400" />
                        <span className="text-gray-400">
                          Hosted by: {listing.users.first_name}
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
              {filteredListings.map((listing) => (
                <Card
                  key={listing.listing_id}
                  className="glass-card overflow-hidden hover:border-accent/50 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      <img
                        // src={listing.image}
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
                            listing.favourited
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
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-accent fill-accent mr-1" />
                            <span>0</span>
                          </div>
                        </div>

                        <p className="text-gray-400 text-sm flex items-center mb-2">
                          <MapPin className="h-3 w-3 mr-1" /> {listing.city},{" "}
                          {listing.area}
                        </p>

                        <p className="text-sm text-gray-400 mb-3">
                          {listing.description}
                        </p>

                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="text-gray-400 text-sm">
                              Hosted by {listing.users.first_name}
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

        {/* Favourites Section */}
        <div
          className="mt-8 mb-6 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-accent flex items-center">
            <Heart className="mr-2 h-5 w-5" /> Your Favourites (
            {listings.filter((l) => l.favourited).length})
          </h2>

          {listings.filter((l) => l.favourited).length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">
                Your favourites list is empty
              </h3>
              <p className="text-gray-400 mb-4">
                Save properties you're interested in by clicking the heart icon.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {listings
                  .filter((l) => l.favourited)
                  .map((listing) => (
                    <Card
                      key={listing.listing_id}
                      className="glass-card w-80 overflow-hidden hover:border-accent/50 transition-all duration-300"
                    >
                      <div className="relative">
                        <img
                          // src={listing.image}
                          alt={listing.title}
                          className="w-full h-40 object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavourite(listing.listing_id)}
                          className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 rounded-full"
                        >
                          <Heart className="h-5 w-5 fill-accent text-accent" />
                        </Button>
                      </div>

                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-base">
                            {listing.title}
                          </h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-accent fill-accent mr-1" />
                            <span>0</span>
                          </div>
                        </div>

                        <p className="text-gray-400 text-sm flex items-center mb-1">
                          <MapPin className="h-3 w-3 mr-1" /> {listing.city},{" "}
                          {listing.area}
                        </p>

                        <p className="text-accent font-medium">
                          ${listing.price}/month
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
