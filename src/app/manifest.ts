import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Robot Task Board",
    short_name: "Task Board",
    description:
      "Mission-driven task board for robotics competition teams, focused on projects, subsystems, integration, and milestones.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#151a1d",
    theme_color: "#151a1d",
    icons: [
      {
        src: "/icons/robot-task-board-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/robot-task-board-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
