import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    
    // Admin routes require ADMIN or OWNER role
    if (path.startsWith("/dashboard/admin")) {
      if (!token || !["ADMIN", "OWNER"].includes(token.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*"],
} 