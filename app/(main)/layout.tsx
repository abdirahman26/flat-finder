"use client";

import React from "react";

function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <> {children}</>;
}

export default MainLayout;
