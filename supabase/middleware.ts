import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Create response first
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if it exists
  await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Add some debugging
  console.log("Current path:", request.nextUrl.pathname);
  console.log("User:", user);

 

  // If we have a user and they're on an auth route, redirect to consultant
  if (user && ["/sign-in", "/sign-up"].includes(request.nextUrl.pathname)) {
    console.log("Redirecting to consultant");
    return NextResponse.redirect(new URL('/consultant', request.url));
  }

  // If we don't have a user and they're on a protected route, redirect to sign-in
  // if (!user && ["/consultant"].includes(request.nextUrl.pathname)) {
  //   return NextResponse.redirect(new URL('/sign-in', request.url));
  // }

  return response;
}

