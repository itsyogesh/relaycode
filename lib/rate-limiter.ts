/**
 * Simple in-memory rate limiter for the compile API route.
 *
 * Hackathon-scope: does not coordinate across instances/cold starts.
 * IP from x-forwarded-for is only trustable behind Vercel proxy.
 */

const hits = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_WINDOW = 10;
const WINDOW_MS = 60_000; // 1 minute

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;
  entry.count++;
  return true;
}

export function getRateLimitReset(ip: string): number {
  const entry = hits.get(ip);
  if (!entry) return 0;
  return Math.max(0, Math.ceil((entry.resetAt - Date.now()) / 1000));
}
