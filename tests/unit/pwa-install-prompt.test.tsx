import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

type MockBeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

function createBeforeInstallPromptEvent(prompt: () => Promise<void>) {
  const event = new Event("beforeinstallprompt") as MockBeforeInstallPromptEvent;

  Object.defineProperty(event, "prompt", {
    value: prompt,
  });

  Object.defineProperty(event, "userChoice", {
    value: Promise.resolve({
      outcome: "accepted",
      platform: "web",
    }),
  });

  event.preventDefault = vi.fn();

  return event;
}

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({
      matches: false,
      media: "(display-mode: standalone)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("shows install button after browser exposes install prompt", async () => {
  const prompt = vi.fn().mockResolvedValue(undefined);

  render(<PwaInstallPrompt variant="hero" />);

  window.dispatchEvent(createBeforeInstallPromptEvent(prompt));

  expect(await screen.findByRole("button", { name: "安装到设备" })).toBeInTheDocument();
});

test("calls browser install prompt when install button is clicked", async () => {
  const user = userEvent.setup();
  const prompt = vi.fn().mockResolvedValue(undefined);

  render(<PwaInstallPrompt variant="compact" />);

  window.dispatchEvent(createBeforeInstallPromptEvent(prompt));

  await user.click(await screen.findByRole("button", { name: "安装到设备" }));

  await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
});
