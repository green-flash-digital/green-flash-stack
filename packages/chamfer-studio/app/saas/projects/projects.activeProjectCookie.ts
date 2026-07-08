import { createCookie } from "react-router";

/**
 * Not signed — ownership of the referenced project is re-verified against D1 on
 * every request (see projects.middleware.ts), so a tampered value just fails
 * closed rather than leaking cross-user data.
 */
export const activeProjectCookie = createCookie("active_project", {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 365
});
