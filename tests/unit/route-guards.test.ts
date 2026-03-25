import {
  buildLoginRedirectUrl,
  hasSupabaseAuthCookie,
  isProtectedRoute,
} from "@/lib/auth/route-guards";

test("protected routes require authentication", () => {
  expect(isProtectedRoute("/my-tasks")).toBe(true);
  expect(isProtectedRoute("/projects")).toBe(true);
  expect(isProtectedRoute("/admin")).toBe(true);
  expect(isProtectedRoute("/setup")).toBe(true);
  expect(isProtectedRoute("/login")).toBe(false);
});

test("redirect url preserves the requested route", () => {
  expect(buildLoginRedirectUrl("/projects/robot-1")).toBe(
    "/login?redirectTo=%2Fprojects%2Frobot-1",
  );
});

test("supabase cookie detection matches auth cookie names", () => {
  expect(
    hasSupabaseAuthCookie([
      "sb-sample-auth-token",
      "another-cookie",
    ]),
  ).toBe(true);
  expect(hasSupabaseAuthCookie(["theme"])).toBe(false);
});
