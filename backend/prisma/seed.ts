import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'haubtm699@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Goldcuber123@';

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      role: UserRole.admin,
      isActive: true,
      email: adminEmail,
      passwordHash,
    },
    create: {
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      displayName: 'System Admin',
      role: UserRole.admin,
      isActive: true,
      emailVerified: true,
      subscriptionType: 'premium',
    },
  });

  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
