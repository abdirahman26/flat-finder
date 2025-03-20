'use client'
import React from 'react'
import { signOutFunc } from "@/app/(auth)/actions";
import { useRouter } from "next/navigation";

function Consultant() {
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
        <div className="flex items-center justify-center text-4xl text-custom-lime">
        WELCOME TO THE Consultant DASHBOARD!
        <button
            onClick={handleSignOut}
            className="ml-3.5 border-4 rounded-2xl cursor-pointer"
        >
            Sign Out
        </button>
        </div>
    );
}

export default Consultant
