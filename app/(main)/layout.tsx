"use client"

import React, { useState } from "react"
import Nav from "@/components/Nav"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <Nav />
      {children}
    </QueryClientProvider>
  )
}

export default MainLayout
