import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoutes,
  UserRole,
} from "./lib/auth-utills";
import { deleteCookie, getCookie } from "./services/auth/tokenHandler";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let userRole: UserRole | null = null;

  // const accessToken = request.cookies.get("accessToken")?.value || null;
  const accessToken = await getCookie("accessToken");

  if (accessToken) {
    const verifyToken: JwtPayload | string = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET as string,
    );

    if (typeof verifyToken === "string") {
      await deleteCookie("accessToken");
      await deleteCookie("refreshToken");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    userRole = verifyToken.role as UserRole;
  }

  const routeOwner = getRouteOwner(pathname);
  const isAuth = isAuthRoutes(pathname);

  if (accessToken && isAuth) {
    const dashboardRoute = getDefaultDashboardRoute(userRole as UserRole);
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  if (routeOwner === null) {
    return NextResponse.next();
  }

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (routeOwner === "COMMON") {
    return NextResponse.next();
  }

  if (
    routeOwner === "ADMIN" ||
    routeOwner === "DOCTOR" ||
    routeOwner === "PATIENT"
  ) {
    if (routeOwner !== userRole) {
      const dashboardRoute = getDefaultDashboardRoute(userRole as UserRole);
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
