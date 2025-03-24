"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  Home,
  Star,
  MapPin,
  User,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";

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
};

function ConsultantProfile() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`min-h-screen bg-dark flex justify-center items-center px-6 ${
        mounted ? "animate-fade-in" : "opacity-0"
      }`}
    >
      <div className="max-w-5xl w-full">
        <div className="flex flex-col md:flex-row gap-10 justify-center items-center">
          {/* Profile Card - Now takes up more width */}
          <div className="w-full md:w-2/3 bg-custom-dark p-8 rounded-2xl shadow-lg glass-card animate-slide-up">
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="h-28 w-28 bg-custom-lime text-dark flex items-center justify-center mb-4 rounded-full">
                <span className="text-4xl font-semibold">{user.avatar}</span>
              </Avatar>
              <h1 className="text-gray-300 text-3xl font-semibold mb-1">
                {user.name}
              </h1>
              <p className="text-gray-400 text-lg">{user.joinDate}</p>

              {user.verified && (
                <Badge className="mt-2 bg-dark border border-custom-lime text-custom-lime px-3 py-1 text-sm flex items-center">
                  <Star className="h-4 w-4 mr-1" /> FDM Approved
                </Badge>
              )}
            </div>

            <Separator className="my-6 bg-white/10" />

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-custom-lime mr-3" />
                <p className="text-lg text-gray-300">{user.location}</p>
              </div>

              <div className="flex items-start">
                <User className="h-6 w-6 text-custom-lime mr-3" />
                <p className="text-lg text-gray-300">{user.bio}</p>
              </div>

              <div className="flex items-start">
                <MessageCircle className="h-6 w-6 text-custom-lime mr-3" />
                <div>
                  <p className="text-lg text-white font-medium">Languages</p>
                  <p className="text-lg text-gray-300">
                    {user.languages.join(", ")}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Building className="h-6 w-6 text-custom-lime mr-3" />
                <div>
                  <p className="text-lg text-white font-medium">
                    Response Rate & Time
                  </p>
                  <p className="text-lg text-gray-300">
                    {user.responseRate} response rate
                  </p>
                  <p className="text-lg text-gray-300">
                    Typically responds {user.responseTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button className="w-full bg-custom-lime text-dark text-lg font-semibold py-3 hover:bg-custom-lime/90">
                <MessageCircle className="mr-2 h-5 w-5" /> Contact Host
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsultantProfile;
