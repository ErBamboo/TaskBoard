export const DESKTOP_CLIENT_USER_AGENT_MARKER = "RobotTaskBoardDesktop/";

export function isDesktopClientUserAgent(userAgent: string | null | undefined) {
  return (
    typeof userAgent === "string" &&
    userAgent.includes(DESKTOP_CLIENT_USER_AGENT_MARKER)
  );
}

export function getDesktopClientVersionFromUserAgent(
  userAgent: string | null | undefined,
) {
  if (!isDesktopClientUserAgent(userAgent) || typeof userAgent !== "string") {
    return null;
  }

  const desktopClientVersion = userAgent
    .split(" ")
    .find((userAgentPart) =>
      userAgentPart.startsWith(DESKTOP_CLIENT_USER_AGENT_MARKER),
    )
    ?.slice(DESKTOP_CLIENT_USER_AGENT_MARKER.length);

  return desktopClientVersion && desktopClientVersion.length > 0
    ? desktopClientVersion
    : null;
}
