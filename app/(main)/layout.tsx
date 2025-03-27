"use client";

import React from "react";
import Nav from "@/components/Nav";

function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav />
      <div
        className="mt-14
      "
      >
        {" "}
        {children}
      </div>
    </>
  );
}

export default MainLayout;
