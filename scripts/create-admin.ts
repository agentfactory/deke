import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set")
  process.exit(1)
}

const pool = new Pool({ connectionString })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function createAdmin() {
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4] || undefined

  if (!email || !password) {
    console.error("Usage: npm run create-admin <email> <password> [name]")
    console.error("Example: npm run create-admin deke@dekesharon.com MyPassword123 \"Deke Sharon\"")
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { hashedPassword, ...(name ? { name } : {}) },
    create: {
      email,
      hashedPassword,
      name: name || null,
      role: "admin",
    },
  })

  console.log(`Admin user created/updated: ${user.email} (id: ${user.id})`)
}

createAdmin()
  .catch((err) => {
    console.error("Failed to create admin:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
