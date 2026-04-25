// Test-only stub for `server-only` package.
// The real package throws on import to prevent server code from being
// bundled into the client. Vitest doesn't run inside Next.js so the
// guard isn't meaningful here; this stub is aliased in vitest.config.ts.
export {};
