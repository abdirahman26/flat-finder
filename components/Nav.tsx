"use client";

import { pageRouting } from "@/app/(auth)/actions";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";

const Nav = () => {
  const router = useRouter();
  const supabase = createClient();

  const navItems = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Profile", link: "/profile" },
    { name: "Sign Out", link: "/sign-in" },
  ];

  const handleRouting = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: string
  ) => {
    e.preventDefault();

    if (link === "/sign-in") {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Sign out error:", error);
      router.push("/sign-in");

      return;
    }

    if (link === "/dashboard") {
      const { error, role } = await pageRouting();

      if (error) {
        console.log(error);
        return;
      }

      router.push(`/${role}`);
    }

    if (link === "/profile") {
      router.push("/profile");
    }
  };

  return (
    <nav className="bg-transparent fixed top-0 left-0 w-full z-50 px-8 py-4">
      <div className="relative max-w-7xl mx-auto flex items-center h-16">
        <div className="text-3xl font-bold text-gray-900 tracking-tight mr-auto">
          FDM
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-md px-12 py-4">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.link}
                onClick={(e) => handleRouting(e, item.link)} // Pass event and link
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
