"use client";

import { navRouting } from "@/app/(auth)/actions";
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
      const { error, role } = await navRouting();
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
    <nav className="w-full z-50 bg-gradient-to-b from-dark to-transparent px-6 md:px-12 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Logo */}
        <div className="text-4xl font-bold text-lime-400 tracking-tight">
          FDM
        </div>

        {/* Nav Items */}
        <div className="bg-white backdrop-blur-sm rounded-full px-8 py-3 shadow-lg">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.link}
                  onClick={(e) => handleRouting(e, item.link)}
                  className="text-custom-dark hover:text-custom-lime/100 transition-colors duration-200 text-base font-medium"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
