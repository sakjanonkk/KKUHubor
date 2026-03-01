/**
 * Get or create a cryptographically secure session ID.
 * Uses crypto.randomUUID() instead of Math.random() for security.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("session_id", sessionId);
  }
  return sessionId;
}
