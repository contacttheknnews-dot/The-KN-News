// Refuses to run a destructive DB operation against anything that looks like
// production. Used by the `db:reset:dev` script. Local dev must point
// DATABASE_URL at a throwaway Neon dev branch, never the live database.
//
// Override for an intentional dev reset:  ALLOW_DB_RESET=yes npm run db:reset:dev

const url = process.env.DATABASE_URL ?? "";

// Endpoint identifiers that indicate the live production database. Add your own
// production host fragment here if it differs.
const PROD_HINTS = [/ep-noisy-sun/i, /neondb_owner/i, /theknnews/i];

const looksProd =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL_ENV === "production" ||
  PROD_HINTS.some((re) => re.test(url));

if (looksProd && process.env.ALLOW_DB_RESET !== "yes") {
  console.error(
    "\n\x1b[31mRefusing destructive DB reset — DATABASE_URL looks like production.\x1b[0m\n" +
      "Point DATABASE_URL at a dev branch, or set ALLOW_DB_RESET=yes if you are certain.\n"
  );
  process.exit(1);
}

console.log("guard-not-prod: DATABASE_URL is not production — proceeding.");
