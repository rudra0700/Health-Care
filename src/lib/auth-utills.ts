export type UserRole = "ADMIN" | "PATIENT" | "DOCTOR";

export type RouteConfig = {
  exact: string[];
  patterns: RegExp[];
};

export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export const commontProtectedRoutes: RouteConfig = {
  exact: ["/my-profile", "/settings"],
  patterns: [],
};

export const doctorProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/doctor/],
};

export const adminProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/admin/],
};

export const patientProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/dashboard/],
};

export const isAuthRoutes = (pathname: string) => {
  return authRoutes.some((route) => route === pathname);
};

export const isRouteMatched = (
  pathname: string,
  routes: RouteConfig,
): boolean => {
  if (routes.exact.includes(pathname)) {
    return true;
  }
  return routes.patterns.some((pattern) => pattern.test(pathname));
};

export const getRouteOwner = (
  pathname: string,
): "ADMIN" | "DOCTOR" | "PATIENT" | "COMMON" | null => {
  if (isRouteMatched(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  }
  if (isRouteMatched(pathname, doctorProtectedRoutes)) {
    return "DOCTOR";
  }
  if (isRouteMatched(pathname, patientProtectedRoutes)) {
    return "PATIENT";
  }
  if (isRouteMatched(pathname, commontProtectedRoutes)) {
    return "COMMON";
  }
  return null;
};

export const getDefaultDashboardRoute = (role: UserRole): string => {
  if (role === "ADMIN") {
    return "/admin/dashboard";
  } else if (role === "DOCTOR") {
    return "/doctor/dashboard";
  } else if (role === "PATIENT") {
    return "/dashboard";
  }
  return "/";
};

export const isValidRouterForRole = (
  pathname: string,
  role: UserRole,
): boolean => {
  const routeOwner = getRouteOwner(pathname);

  if (routeOwner === null || routeOwner === "COMMON") {
    return true;
  }

  if (routeOwner === role) {
    return true;
  }

  return false;
};
