"use client";
import React from "react";
import { signOutFunc } from "@/app/(auth)/actions";
import { useRouter } from "next/navigation";
import { SectionCards } from "@/components/SectionCards";
import DataTable from "@/components/DataTable";

import data from "./data.json"

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
    <>
      <div >
        <SectionCards />
      </div>
      <div>
            <DataTable data={data} />
      </div>
    </>
  );
}

export default Page;
