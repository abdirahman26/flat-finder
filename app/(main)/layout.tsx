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
      {" "}
      {children}
      <Nav />
    </>
  );
}

export default MainLayout;
