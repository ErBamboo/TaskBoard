import { expect, test } from "@playwright/test";

const protectedRoutes = ["/my-tasks", "/projects", "/admin"];

test("root shows welcome landing and allows unauthenticated user to enter login", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "战队任务中枢",
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "进入任务面板" }).click();

  await expect(page).toHaveURL(/\/login$/);
});

for (const protectedRoute of protectedRoutes) {
  test(`protected route ${protectedRoute} redirects to login`, async ({ page }) => {
    await page.goto(protectedRoute);

    await expect(page).toHaveURL(/\/login/);
  });
}
