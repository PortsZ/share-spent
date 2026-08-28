/**
 * Config readable from client components. Only NEXT_PUBLIC_* variables are
 * inlined into the browser bundle, so server-only keys must never be consulted
 * here — a flag that ANDs in a secret would be true on the server and false in
 * the browser, and hydrate inconsistently.
 */
export const isClerkConfiguredPublic = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);
