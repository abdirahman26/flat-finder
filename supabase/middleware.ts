import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

    // Retrieve the 'role' column from the 'users' table
    let role = null;
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
  
      if (error) {
        console.error('Error fetching role:', error);
      } else {
        role = data.role;
      }
    }

    

  const publicRoutes = ['/', '/sign-in', '/sign-up']
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/sign') &&
    request.nextUrl.pathname != "/"
  ) {
    // no user, potentially respond by redirecting the user to the login page
    console.log('user does not exist')
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route)
  if(user && isPublicRoute){
    console.log('user exists')
    const url = request.nextUrl.clone()
    url.pathname = `/${role.charAt(0).toLowerCase() + role.slice(1)}`;
    return NextResponse.redirect(url)
  }

    // Restrict access to role-specific pages
    const rolePages = ['/landlord', '/consultant', '/admin'];
    if (user && rolePages.includes(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      if (request.nextUrl.pathname !== `/${role.charAt(0).toLowerCase() + role.slice(1)}`) {
        // Redirect to the correct role page if trying to access another role's page
        url.pathname = `/${role.charAt(0).toLowerCase() + role.slice(1)}`;;
        return NextResponse.redirect(url);
      }
    }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}