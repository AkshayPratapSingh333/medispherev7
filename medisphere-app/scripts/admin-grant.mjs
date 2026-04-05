import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import nextEnvPkg from "@next/env";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { loadEnvConfig } = nextEnvPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectDir = resolve(__dirname, "..");

// Load .env/.env.local like Next.js before Prisma initializes.
loadEnvConfig(projectDir);

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is missing. Add it to medisphere-app/.env.local (or .env) and run again."
  );
  process.exit(1);
}

const prisma = new PrismaClient();

function parseArgs(argv) {
  const args = {
    email: "",
    password: "",
    name: "MediSphere Admin",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--email") args.email = argv[i + 1] || "";
    if (item === "--password") args.password = argv[i + 1] || "";
    if (item === "--name") args.name = argv[i + 1] || "MediSphere Admin";
  }

  return args;
}

async function main() {
  const { email, password, name } = parseArgs(process.argv.slice(2));

  if (!email || !password) {
    console.error(
      "Usage: npm run admin:grant -- --email admin@medisphere.com --password YourStrongPass123 --name \"Admin\""
    );
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN",
        password: hashedPassword,
        name: existingUser.name || name,
      },
    });

    console.log(`Updated existing user ${email} to ADMIN.`);
  } else {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    });

    console.log(`Created new ADMIN user ${email}.`);
  }

  console.log("You can now sign in from /auth/admin or /auth/signin with this email/password.");
}

main()
  .catch((error) => {
    console.error("Failed to grant admin access:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
