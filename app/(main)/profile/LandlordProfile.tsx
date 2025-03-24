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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const LandlordProfile = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  //mock data for user and listings
  const user = {
    name: "Sophie",
    joinDate: "Joined January 2019",
    location: "Seattle, Washington",
    verified: true,
    avatar: "SW",
    bio: "Hi there! I love to travel and explore new places. When I'm not traveling, I enjoy hiking and photography. I'm a clean, quiet guest and responsive host.",
    languages: ["English", "French", "Spanish"],
    responseRate: "98%",
    responseTime: "within an hour",
    hostingStats: {
      totalListings: 3,
      totalReviews: 152,
      averageRating: 4.92,
    },
    tripStats: {
      totalTrips: 27,
      countries: 12,
      upcomingTrips: 2,
    },
  };

  // Mock listings data
  const listings = [
    {
      id: 1,
      title: "Mountain View Cabin",
      location: "Aspen, Colorado",
      price: "$195/night",
      rating: 4.97,
      reviews: 68,
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027",
      superhost: false,
    },
    {
      id: 2,
      title: "Urban Loft with Skyline View",
      location: "Seattle, Washington",
      price: "$135/night",
      rating: 4.89,
      reviews: 43,
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
      superhost: false,
    },
    {
      id: 3,
      title: "Cozy Studio in Historic District",
      location: "Portland, Oregon",
      price: "$105/night",
      rating: 4.85,
      reviews: 41,
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
      superhost: false,
    },
  ];

  return (
    <div
      className={`min-h-screen bg-dark ${
        mounted ? "animate-fade-in" : "opacity-0"
      }`}
    >
      {/* Navigation */}
      {/* <nav className="fixed top-0 left-0 right-0 z-10 glass-card bg-dark/90 backdrop-blur-lg px-4 py-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center">
          <div className="text-custom-lime font-semibold text-xl">
            Wanderlust
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <div className="flex items-center bg-dark/60 rounded-full px-3 py-1 border border-white/10">
            <Avatar className="h-8 w-8 bg-custom-lime text-dark mr-2">
              <span>{user.avatar}</span>
            </Avatar>
            <span className="hidden md:inline-block text-sm">Profile</span>
          </div>
        </div>
      </nav> */}

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
                  <span className="text-3xl font-semibold">{user.avatar}</span>
                </Avatar>
                <h1 className="text-gray-300 text-2xl font-semibold mb-1">
                  {user.name}
                </h1>
                <p className="text-gray-400 text-sm">{user.joinDate}</p>

                {user.verified && (
                  <Badge className="mt-2 bg-dark border border-custom-lime text-custom-lime">
                    <Star className="h-3 w-3 mr-1" /> FDM Approved
                  </Badge>
                )}
              </div>

              <Separator className="my-4 bg-white/10" />

              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-custom-lime shrink-0 mt-0.5 mr-2" />
                  <p className="text-sm text-gray-300">{user.location}</p>
                </div>

                <div className="flex items-start">
                  <User className="h-5 w-5 text-custom-lime shrink-0 mt-0.5 mr-2" />
                  <p className="text-sm text-gray-300">{user.bio}</p>
                </div>

                <div className="flex items-start">
                  <MessageCircle className="h-5 w-5 text-custom-lime shrink-0 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-white font-medium">Languages</p>
                    <p className="text-sm text-gray-300">
                      {user.languages.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Building className="h-5 w-5 text-custom-lime shrink-0 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-white font-medium">
                      Response Rate & Time
                    </p>
                    <p className="text-sm text-gray-300">
                      {user.responseRate} response rate
                    </p>
                    <p className="text-sm text-gray-300">
                      Typically responds {user.responseTime}
                    </p>
                  </div>
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
              style={{ animationDelay: "0.2s" }}
            >
              <h2 className="text-lg font-semibold mb-4 text-custom-lime flex items-center">
                <Star className="mr-2 h-5 w-5" /> Host Stats
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Listings</span>
                  <span className="font-medium text-gray-300">
                    {user.hostingStats.totalListings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Reviews</span>
                  <span className="font-medium text-gray-300">
                    {user.hostingStats.totalReviews}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Average Rating</span>
                  <span className="font-medium flex items-center">
                    <Star className="h-4 w-4 text-custom-lime mr-1 fill-custom-lime" />
                    <span className="text-gray-300">
                      {user.hostingStats.averageRating}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div
              className="glass-card p-6 mt-6 animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <h2 className="text-lg font-semibold mb-4 text-custom-lime flex items-center">
                <Home className="mr-2 h-5 w-5" /> Traveler Stats
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Trips</span>
                  <span className="font-medium">
                    {user.tripStats.totalTrips}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Countries Visited</span>
                  <span className="font-medium">
                    {user.tripStats.countries}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Upcoming Trips</span>
                  <span className="font-medium">
                    {user.tripStats.upcomingTrips}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Listings */}
          {/* CONDITIONALLY RENDER THIS IF USER IS A LANDLORD*/}
          <div className="md:w-2/3">
            <div
              className="glass-card p-6 animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <h2 className="text-xl font-semibold mb-6 text-custom-lime flex items-center">
                <Building className="mr-2 h-5 w-5" /> Sophie's Listings
              </h2>

              <div className="space-y-6">
                {listings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="bg-dark/60 border border-white/10 overflow-hidden hover:border-custom-lime/50 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 h-48 md:h-auto relative">
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                        {listing.superhost && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-custom-lime text-dark">
                              Superhost
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 md:w-2/3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {listing.title}
                          </h3>
                          <p className="text-gray-400 text-sm flex items-center mb-2">
                            <MapPin className="h-3 w-3 mr-1" />{" "}
                            {listing.location}
                          </p>
                          <p className="text-custom-lime font-medium mb-2">
                            {listing.price}
                          </p>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-custom-lime fill-custom-lime mr-1" />
                            <span className="mr-1">{listing.rating}</span>
                            <span className="text-gray-400 text-sm">
                              ({listing.reviews} reviews)
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
                          <Button
                            size="sm"
                            className="bg-custom-lime text-dark hover:bg-custom-lime/90 text-sm"
                          >
                            <Calendar className="h-3 w-3 mr-1" /> Check
                            Availability
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* <div
              className="mt-6 glass-card p-6 animate-slide-up"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-custom-lime flex items-center">
                  <Calendar className="mr-2 h-5 w-5" /> Upcoming Trips
                </h2>
                <Button variant="outline" size="sm" className="border-white/20">
                  View All
                </Button>
              </div>

              <div className="p-6 text-center border border-dashed border-white/20 rounded-lg">
                <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-300">No upcoming trips to display.</p>
                <Button className="mt-4 bg-custom-lime text-dark hover:bg-custom-lime/90">
                  Book a Place
                </Button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordProfile;
