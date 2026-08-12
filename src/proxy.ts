  // before update
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import {
  //   getDefaultDashboardRoute,
  //   getRouteOwner,
  //   isAuthRoutes,
  //   UserRole,
  // } from "./lib/auth-utills";
  // import { deleteCookie, getCookie } from "./services/auth/tokenHandler";
  


// before update
// export async function proxy(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;
//   let userRole: UserRole | null = null;

//   // const accessToken = request.cookies.get("accessToken")?.value || null;
//   const accessToken = await getCookie("accessToken");

//   if (accessToken) {
//     const verifyToken: JwtPayload | string = jwt.verify(
//       accessToken,
//       process.env.JWT_ACCESS_SECRET as string,
//     );

//     if (typeof verifyToken === "string") {
//       await deleteCookie("accessToken");
//       await deleteCookie("refreshToken");
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     userRole = verifyToken.role as UserRole;
//   }

//   const routeOwner = getRouteOwner(pathname);
//   const isAuth = isAuthRoutes(pathname);

//   if (accessToken && isAuth) {
//     const dashboardRoute = getDefaultDashboardRoute(userRole as UserRole);
//     return NextResponse.redirect(new URL(dashboardRoute, request.url));
//   }

//   if (routeOwner === null) {
//     return NextResponse.next();
//   }

//   if (!accessToken) {
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("redirect", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   if (routeOwner === "COMMON") {
//     return NextResponse.next();
//   }

//   if (
//     routeOwner === "ADMIN" ||
//     routeOwner === "DOCTOR" ||
//     routeOwner === "PATIENT"
//   ) {
//     if (routeOwner !== userRole) {
//       const dashboardRoute = getDefaultDashboardRoute(userRole as UserRole);
//       return NextResponse.redirect(new URL(dashboardRoute, request.url));
//     }

//     return NextResponse.next();
//   }

//   return NextResponse.next();
// }

// before update
// export const config = {
//   matcher: [
//     "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
//   ],
// };


// after update
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
// import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from './lib/auth-utils';
import { getUserInfo } from './services/auth/getUserInfo';
import { getNewAccessToken } from './services/auth/auth.service';
import { deleteCookie, getCookie } from './services/auth/tokenHandler';
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoutes, UserRole } from './lib/auth-utills';



// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const hasTokenRefreshedParam = request.nextUrl.searchParams.has('tokenRefreshed');

    // If coming back after token refresh, remove the param and continue
    if (hasTokenRefreshedParam) {
        const url = request.nextUrl.clone();
        url.searchParams.delete('tokenRefreshed');
        return NextResponse.redirect(url);
    }

    const tokenRefreshResult = await getNewAccessToken();

    // If token was refreshed, redirect to same page to fetch with new token
    if (tokenRefreshResult?.tokenRefreshed) {
        const url = request.nextUrl.clone();
        url.searchParams.set('tokenRefreshed', 'true');
        return NextResponse.redirect(url);
    }

    // const accessToken = request.cookies.get("accessToken")?.value || null;

    const accessToken = await getCookie("accessToken") || null;

    let userRole: UserRole | null = null;
    if (accessToken) {
        const verifiedToken: JwtPayload | string = jwt.verify(accessToken, process.env.JWT_SECRET as string);

        if (typeof verifiedToken === "string") {
            await deleteCookie("accessToken");
            await deleteCookie("refreshToken");
            return NextResponse.redirect(new URL('/login', request.url));
        }

        userRole = verifiedToken.role;
    }

    const routerOwner = getRouteOwner(pathname);
    //path = /doctor/appointments => "DOCTOR"
    //path = /my-profile => "COMMON"
    //path = /login => null

    const isAuth = isAuthRoutes(pathname)

    // Rule 1 : User is logged in and trying to access auth route. Redirect to default dashboard
    if (accessToken && isAuth) {
        return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
    }


    // Rule 2 : User is trying to access open public route
    if (routerOwner === null) {
        return NextResponse.next();
    }

    // Rule 1 & 2 for open public routes and auth routes

    if (!accessToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Rule 3 : User need password change

    if (accessToken) {
        const userInfo = await getUserInfo();
        if (userInfo.needPasswordChange) {
            if (pathname !== "/reset-password") {
                const resetPasswordUrl = new URL("/reset-password", request.url);
                resetPasswordUrl.searchParams.set("redirect", pathname);
                return NextResponse.redirect(resetPasswordUrl);
            }
            return NextResponse.next();
        }

        if (userInfo && !userInfo.needPasswordChange && pathname === '/reset-password') {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
        }
    }

    // Rule 4 : User is trying to access common protected route
    if (routerOwner === "COMMON") {
        return NextResponse.next();
    }

    // Rule 5 : User is trying to access role based protected route
    if (routerOwner === "ADMIN" || routerOwner === "DOCTOR" || routerOwner === "PATIENT") {
        if (userRole !== routerOwner) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
        }
    }

    return NextResponse.next();
}



export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
    ],
}