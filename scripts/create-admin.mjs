// Create or reset a SUPER_ADMIN account directly in the database.
//
// Use this to recover access when nobody can log in to /admin — it talks to the
// database in DATABASE_URL, so it works even with the admin dashboard locked.
//
//   node --env-file=.env scripts/create-admin.mjs --list
//   node --env-file=.env scripts/create-admin.mjs you@example.com "Your Name"
//
// The password is never taken from the command line (shell history keeps those).
// It is read from the ADMIN_PASSWORD environment variable, or prompted for with
// the input hidden. Re-running for an existing email resets that user's
// password and reactivates the account.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "node:readline";

const prisma = new PrismaClient();
const MIN_PASSWORD_LENGTH = 12;

function fail(message) {
  console.error(`\n  Error: ${message}\n`);
  process.exit(1);
}

// Reads a line from the terminal without echoing what is typed.
function promptHidden(question) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(
        new Error(
          "No interactive terminal available. Set the ADMIN_PASSWORD environment variable instead."
        )
      );
      return;
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const onData = (char) => {
      // Redraw the prompt without the typed characters.
      if (![ "\n", "\r", "" ].includes(char)) {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(question);
      }
    };
    process.stdin.on("data", onData);
    rl.question(question, (answer) => {
      process.stdin.removeListener("data", onData);
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function listUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, active: true },
    orderBy: { id: "asc" },
  });
  if (users.length === 0) {
    console.log("\n  No user accounts exist in this database — nobody can log in.");
    console.log("  Create one:  node --env-file=.env scripts/create-admin.mjs you@example.com \"Your Name\"\n");
    return;
  }
  console.log(`\n  ${users.length} account(s):`);
  for (const u of users) {
    console.log(
      `    #${u.id}  ${u.email.padEnd(32)} ${u.role.padEnd(12)} ${u.active ? "active" : "DISABLED"}`
    );
  }
  console.log();
}

async function main() {
  if (!process.env.DATABASE_URL) {
    fail(
      "DATABASE_URL is not set. Run with --env-file=.env, and make sure that file\n" +
        "  points at the SAME database the production site uses."
    );
  }

  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
  Create or reset a SUPER_ADMIN account.

    node --env-file=.env scripts/create-admin.mjs --list
    node --env-file=.env scripts/create-admin.mjs <email> [full name]

  Password is read from ADMIN_PASSWORD, or prompted for (hidden).
  Minimum length: ${MIN_PASSWORD_LENGTH} characters.
`);
    return;
  }

  if (args.includes("--list")) {
    await listUsers();
    return;
  }

  const email = String(args[0]).trim().toLowerCase();
  // The login action lowercases the submitted email before looking it up, so the
  // stored address must be lowercase or the account can never be found.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail(`"${args[0]}" is not a valid email address.`);
  }
  const name = args[1]?.trim() || "Administrator";

  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = await promptHidden(`  New password for ${email}: `);
    const confirm = await promptHidden("  Confirm password: ");
    if (password !== confirm) fail("The two passwords do not match.");
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (password === "admin123") {
    fail("Refusing to use the seed password. Choose a unique password.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "SUPER_ADMIN", active: true },
    create: { email, name, passwordHash, role: "SUPER_ADMIN", active: true },
  });

  console.log(
    `\n  ${existing ? "Password reset for" : "Created"} SUPER_ADMIN  #${user.id}  ${user.email}`
  );
  console.log("  Sign in at /admin/login with that email and the password you just set.\n");
}

main()
  .catch((e) => {
    console.error(`\n  Failed: ${e.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
