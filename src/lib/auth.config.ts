import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute =
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/novo-cliente" ||
        nextUrl.pathname.startsWith("/api/novo-cliente") ||
        nextUrl.pathname.startsWith("/api/auth");

      if (!isLoggedIn && !isPublicRoute) return false;
      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [],
  session: { strategy: "jwt" },
};
