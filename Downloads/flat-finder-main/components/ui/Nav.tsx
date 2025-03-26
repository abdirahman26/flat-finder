"use client";

import { useState } from "react";

const Nav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navItems = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Profile", link: "/profile" },
    !isLoggedIn && { name: "Sign In", link: "/sign-in" },
    isLoggedIn && {
      name: "Sign Out",
      link: "#",
      onClick: () => setIsLoggedIn(false),
    },
  ].filter(Boolean); // Remove nulls

  return (
    <nav className="bg-transparent fixed top-0 left-0 w-full z-50 px-8 py-4">
      <div className="relative max-w-7xl mx-auto flex items-center h-16">
        <div className="text-3xl font-bold text-gray-900 tracking-tight mr-auto">
          FDM
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-md px-12 py-4">
          <div className="flex space-x-8">
            {navItems.map((item: any) => (
              <a
                key={item.name}
                href={item.link}
                onClick={item.onClick}
                className="text-gray-800 hover:text-lime-500 transition-colors text-lg cursor-pointer"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
