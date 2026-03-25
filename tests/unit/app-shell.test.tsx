import { renderToStaticMarkup } from "react-dom/server";

import RootLayout from "@/app/layout";

test("renders application shell title", () => {
  const markup = renderToStaticMarkup(
    <RootLayout>
      <div>child</div>
    </RootLayout>,
  );

  expect(markup).toContain("Robot Task Board");
});
