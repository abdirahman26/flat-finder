"use client";
import React from "react";
import { signOutFunc } from "@/app/(auth)/actions";
import { useRouter } from "next/navigation";
import { SectionCards } from "@/components/SectionCards";

function Page() {
  const router = useRouter();

  const handleSignOut = async () => {
    console.log("Signing out...");
    const { error } = await signOutFunc();

    if (error) {
      console.log(error);
    } else {
      router.replace("/sign-in");
    }
  };
  return (
  
    <div className="">
      <SectionCards />
    </div>
  );
}

export default Page;
