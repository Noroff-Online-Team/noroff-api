import { NextResponse, type NextRequest } from "next/server"

const allowed = ["v1", "v2"]

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (pathname.startsWith("/docs/") && !allowed.includes(pathname.split("/")[2])) {
    // Redirect to v1 if the path starts with /docs/v1
    if (pathname.startsWith("/docs/v1")) {
      const url = new URL("/docs/v1/", req.url)
      return NextResponse.redirect(url)
    }

    // Redirect to v2 if the path starts with /docs/v2
    if (pathname.startsWith("/docs/v2")) {
      const url = new URL("/docs/v2/", req.url)
      return NextResponse.redirect(url)
    }

    // Redirect everything else starting with /docs/ to landing page
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Redirect /docs to /docs/v2
  if (pathname === "/docs") {
    return NextResponse.redirect(new URL("/docs/v2", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/docs/:path*"]
}
