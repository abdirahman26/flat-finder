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
import { getAllListings, getUserDetails } from "@/app/(auth)/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define property type
interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  rating: number;
  reviews: number;
  image: string;
  host: string;
  superhost: boolean;
  watchlisted: boolean;
}

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
  const [propertiess, setPropertiess] = useState<PropertyListing[]>([]);

  const router = useRouter();

  // Mock user data
  const user = {
    name: "Alex",
    role: "Real Estate Consultant",
    avatar: "AS",
  };

  // Mock properties data
  const [properties, setProperties] = useState<Property[]>([
    {
      id: "1",
      title: "Modern Downtown Apartment",
      description:
        "Stylish apartment in the heart of downtown with amazing city views and amenities.",
      location: "Seattle, Washington",
      price: 1800,
      bedrooms: 2,
      bathrooms: 2,
      rating: 4.92,
      reviews: 68,
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027",
      host: "Sophie",
      superhost: true,
      watchlisted: false,
    },
    {
      id: "2",
      title: "Cozy Suburban Home",
      description:
        "Family-friendly home with a spacious backyard in a quiet neighborhood.",
      location: "Portland, Oregon",
      price: 2200,
      bedrooms: 3,
      bathrooms: 2,
      rating: 4.85,
      reviews: 43,
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
      host: "Michael",
      superhost: false,
      watchlisted: false,
    },
    {
      id: "3",
      title: "Luxury Waterfront Condo",
      description:
        "High-end condo with spectacular water views and resort-style amenities.",
      location: "San Diego, California",
      price: 3200,
      bedrooms: 2,
      bathrooms: 2,
      rating: 4.98,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
      host: "Emily",
      superhost: true,
      watchlisted: true,
    },
    {
      id: "4",
      title: "Urban Studio Loft",
      description:
        "Contemporary open-concept studio in the arts district with industrial finishes.",
      location: "Austin, Texas",
      price: 1600,
      bedrooms: 1,
      bathrooms: 1,
      rating: 4.87,
      reviews: 96,
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
      host: "David",
      superhost: false,
      watchlisted: false,
    },
    {
      id: "5",
      title: "Mountain View Cabin",
      description:
        "Rustic cabin with stunning mountain views, perfect for a weekend getaway.",
      location: "Aspen, Colorado",
      price: 2800,
      bedrooms: 3,
      bathrooms: 2,
      rating: 4.96,
      reviews: 72,
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027",
      host: "Sophie",
      superhost: true,
      watchlisted: false,
    },
    {
      id: "6",
      title: "Beachfront Paradise",
      description:
        "Step directly onto the sand from this beautiful beachfront property.",
      location: "Miami, Florida",
      price: 4200,
      bedrooms: 4,
      bathrooms: 3,
      rating: 4.99,
      reviews: 153,
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
      host: "James",
      superhost: true,
      watchlisted: false,
    },
  ]);

  // Filter options
  const filterOptions = [
    "All",
    "Apartments",
    "Houses",
    "Cabins",
    "Beachfront",
    "Downtown",
  ];

  // Handle watchlist toggle
  const toggleWatchlist = (id: string) => {
    setProperties(
      properties.map((property) =>
        property.id === id
          ? { ...property, watchlisted: !property.watchlisted }
          : property
      )
    );

    const property = properties.find((p) => p.id === id);
    if (property) {
      if (!property.watchlisted) {
        toast.success(`${property.title} added to your watchlist!`);
      } else {
        toast.success(`${property.title} removed from your watchlist!`);
      }
    }
  };

  // Filter properties based on search and filters
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice =
      property.price >= priceFilter[0] && property.price <= priceFilter[1];

    const matchesBedrooms =
      bedroomsFilter === 0 || property.bedrooms >= bedroomsFilter;

    const matchesFilter =
      selectedFilter === "All" ||
      (selectedFilter === "Apartments" &&
        property.title.includes("Apartment")) ||
      (selectedFilter === "Houses" && property.title.includes("Home")) ||
      (selectedFilter === "Cabins" && property.title.includes("Cabin")) ||
      (selectedFilter === "Beachfront" &&
        property.title.includes("Beachfront")) ||
      (selectedFilter === "Downtown" && property.title.includes("Downtown"));

    return matchesSearch && matchesPrice && matchesBedrooms && matchesFilter;
  });

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

  const handleProfileRoute = (userId: string) => {
    router.push(`profile/${userId}`);
  };

  useEffect(() => {
    setMounted(true);
    fetchUserData();
    fetchListings();
  }, []);
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
              {properties.filter((p) => p.watchlisted).length}
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
                <Calendar className="mr-2 h-4 w-4" /> Schedule Viewings
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
            {filteredProperties.length})
          </h2>

          {filteredProperties.length === 0 ? (
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
              {propertiess.map((listing) => (
                <Card
                  key={listing.listing_id}
                  className="glass-card overflow-hidden hover:border-accent/50 transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      // src={property.image}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleWatchlist(listing.area_code)}
                      className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 rounded-full"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          true ? "fill-accent text-accent" : "text-white"
                        }`}
                      />
                    </Button>
                    {false && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-accent text-dark">Superhost</Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{listing.title}</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-accent fill-accent mr-1" />
                        <span>Property rating here</span>
                      </div>
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
              {filteredProperties.map((property) => (
                <Card
                  key={property.id}
                  className="glass-card overflow-hidden hover:border-accent/50 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleWatchlist(property.id)}
                        className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 rounded-full"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            property.watchlisted
                              ? "fill-accent text-accent"
                              : "text-white"
                          }`}
                        />
                      </Button>
                      {property.superhost && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-accent text-dark">
                            Superhost
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4 md:w-2/3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">
                            {property.title}
                          </h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-accent fill-accent mr-1" />
                            <span>{property.rating}</span>
                            <span className="text-gray-400 text-sm ml-1">
                              ({property.reviews})
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-400 text-sm flex items-center mb-2">
                          <MapPin className="h-3 w-3 mr-1" />{" "}
                          {property.location}
                        </p>

                        <p className="text-sm text-gray-400 mb-3">
                          {property.description}
                        </p>

                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="text-gray-400 text-sm">
                              Hosted by {property.host}
                            </span>
                          </div>
                          <div className="flex items-center text-sm space-x-2 text-gray-400">
                            <span>{property.bedrooms} bed</span>
                            <span>•</span>
                            <span>{property.bathrooms} bath</span>
                          </div>
                        </div>

                        <p className="text-accent font-medium">
                          ${property.price}/month
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

        {/* Watchlist Section */}
        <div
          className="mt-8 mb-6 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-accent flex items-center">
            <Heart className="mr-2 h-5 w-5" /> Your Watchlist (
            {properties.filter((p) => p.watchlisted).length})
          </h2>

          {properties.filter((p) => p.watchlisted).length === 0 ? (
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
                {properties
                  .filter((p) => p.watchlisted)
                  .map((property) => (
                    <Card
                      key={property.id}
                      className="glass-card w-80 overflow-hidden hover:border-accent/50 transition-all duration-300"
                    >
                      <div className="relative">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-full h-40 object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleWatchlist(property.id)}
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
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-accent fill-accent mr-1" />
                            <span>{property.rating}</span>
                          </div>
                        </div>

                        <p className="text-gray-400 text-sm flex items-center mb-1">
                          <MapPin className="h-3 w-3 mr-1" />{" "}
                          {property.location}
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
