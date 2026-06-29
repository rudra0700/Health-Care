/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import z from "zod";
import { parse } from "cookie";
import { redirect } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  getDefaultDashboardRoute,
  isValidRouterForRole,
  UserRole,
} from "@/lib/auth-utills";
import { setCookie } from "./tokenHandler";

const loginValidationZodSchema = z.object({
  email: z.email({
    message: "Email is required",
  }),
  password: z
    .string("Password is required")
    .min(6, {
      error: "Password is required and must be at least 6 characters long",
    })
    .max(100, {
      error: "Password must be at most 100 characters long",
    }),
});

export const loginUser = async (
  _currentState: any,
  formData: any,
): Promise<any> => {
  try {
    const redirectTo = formData.get("redirect") || null;
    let accessTokenObject: null | any = null;
    let refreshTokenObject: null | any = null;

    const loginData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validatedFields = loginValidationZodSchema.safeParse(loginData);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.issues.map((issue) => {
          return {
            field: issue.path[0],
            message: issue.message,
          };
        }),
      };
    }

    const res = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(loginData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const setCookieHeaders = res.headers.getSetCookie();

    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        const parsedCookie = parse(cookie);
        console.log(parsedCookie);

        if (parsedCookie["accessToken"]) {
          accessTokenObject = parsedCookie;
        }
        if (parsedCookie["refreshToken"]) {
          refreshTokenObject = parsedCookie;
        }
      });
    } else {
      throw new Error("No Set-Cookie headers found in the response");
    }

    if (!accessTokenObject) {
      throw new Error("Tokens not found in cookies");
    }

    if (!refreshTokenObject) {
      throw new Error("Tokens not found in cookies");
    }

    await setCookie("accessToken", accessTokenObject.accessToken, {
      secure: true,
      httpOnly: true,
      maxAge: parseInt(accessTokenObject["Max-Age"]) || 1000 * 60 * 60,
      path: accessTokenObject.Path || "/",
      sameSite: accessTokenObject["SameSite"] || "none",
    });

    await setCookie("refreshToken", refreshTokenObject.refreshToken, {
      secure: true,
      httpOnly: true,
      maxAge:
        parseInt(refreshTokenObject["Max-Age"]) || 1000 * 60 * 60 * 24 * 90,
      path: refreshTokenObject.Path || "/",
      sameSite: refreshTokenObject["SameSite"] || "none",
    });

    const verifyToken: JwtPayload | string = jwt.verify(
      accessTokenObject.accessToken,
      process.env.JWT_ACCESS_SECRET as string,
    );

    if (typeof verifyToken === "string") {
      throw new Error("Invalid access token");
    }

    const userRole = verifyToken.role as UserRole;

    if (redirectTo) {
      const requestedPath = redirectTo.toString();
      if (isValidRouterForRole(requestedPath, userRole)) {
        redirect(requestedPath);
      } else {
        redirect(getDefaultDashboardRoute(userRole));
      }
    } else {
      redirect(getDefaultDashboardRoute(userRole));
    }
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    console.log(error);
    return { error: "Login failed" };
  }
};
