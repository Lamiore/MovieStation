// Stub for the `server-only` package during Vitest runs.
// In Next.js, importing "server-only" from a Client Component throws at build
// time. Vitest doesn't understand that runtime, so we alias it to this empty
// module via vitest.config.ts so server-only utilities can still be unit-tested.
export {};
