import { randomUUID } from "node:crypto";
import { isDatabaseConfigured } from "@/lib/database";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { getPrisma } from "@/lib/prisma";

export type SafeAdminUser = {
  createdAt: string;
  email: string;
  id: string;
  isActive: boolean;
  name: string;
  updatedAt: string;
};

type AdminUserRecord = {
  createdAt: Date | string;
  email: string;
  id: string;
  isActive: boolean;
  name: string;
  passwordHash: string;
  updatedAt: Date | string;
};

function toSafeAdminUser(user: AdminUserRecord): SafeAdminUser {
  const createdAt =
    user.createdAt instanceof Date
      ? user.createdAt.toISOString()
      : new Date(user.createdAt).toISOString();
  const updatedAt =
    user.updatedAt instanceof Date
      ? user.updatedAt.toISOString()
      : new Date(user.updatedAt).toISOString();

  return {
    createdAt,
    email: user.email,
    id: user.id,
    isActive: user.isActive,
    name: user.name,
    updatedAt,
  };
}

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}

function createAdminUserId() {
  return `admin_${randomUUID().replaceAll("-", "")}`;
}

async function findAdminUserByEmail(email: string) {
  const prisma = getPrisma();

  if (prisma.adminUser) {
    return prisma.adminUser.findUnique({
      where: {
        email,
      },
    });
  }

  const users = await prisma.$queryRaw<AdminUserRecord[]>`
    SELECT
      "id",
      "name",
      "email",
      "passwordHash",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "AdminUser"
    WHERE "email" = ${email}
    LIMIT 1
  `;

  return users[0] || null;
}

async function findAdminUserById(id: string) {
  const prisma = getPrisma();

  if (prisma.adminUser) {
    return prisma.adminUser.findUnique({
      where: {
        id,
      },
    });
  }

  const users = await prisma.$queryRaw<AdminUserRecord[]>`
    SELECT
      "id",
      "name",
      "email",
      "passwordHash",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "AdminUser"
    WHERE "id" = ${id}
    LIMIT 1
  `;

  return users[0] || null;
}

async function countOtherActiveAdminUsers(id: string) {
  const prisma = getPrisma();

  if (prisma.adminUser) {
    return prisma.adminUser.count({
      where: {
        isActive: true,
        id: {
          not: id,
        },
      },
    });
  }

  const result = await prisma.$queryRaw<Array<{ count: bigint | number }>>`
    SELECT COUNT(*) AS count
    FROM "AdminUser"
    WHERE "isActive" = true AND "id" <> ${id}
  `;

  return Number(result[0]?.count || 0);
}

export async function authorizeAdminUser(email: string, password: string) {
  const normalizedEmail = normalizeAdminEmail(email);

  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const user = await findAdminUserByEmail(normalizedEmail);

    if (
      user?.isActive &&
      (await verifyPassword(password, user.passwordHash))
    ) {
      return {
        email: user.email,
        id: user.id,
        name: user.name,
      };
    }
  } catch (error) {
    console.error("Admin user authorization error:", error);
  }

  return null;
}

export async function listAdminUsers() {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const prisma = getPrisma();

  const users = prisma.adminUser
    ? await prisma.adminUser.findMany({
        orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      })
    : await prisma.$queryRaw<AdminUserRecord[]>`
        SELECT
          "id",
          "name",
          "email",
          "passwordHash",
          "isActive",
          "createdAt",
          "updatedAt"
        FROM "AdminUser"
        ORDER BY "isActive" DESC, "createdAt" ASC
      `;

  return users.map(toSafeAdminUser);
}

export async function createAdminUser(input: {
  email: string;
  name: string;
  password: string;
}) {
  const prisma = getPrisma();
  const email = normalizeAdminEmail(input.email);
  const passwordHash = await hashPassword(input.password);

  const user = prisma.adminUser
    ? await prisma.adminUser.create({
        data: {
          email,
          name: input.name.trim(),
          passwordHash,
        },
      })
    : (
        await prisma.$queryRaw<AdminUserRecord[]>`
          INSERT INTO "AdminUser" (
            "id",
            "name",
            "email",
            "passwordHash",
            "isActive",
            "updatedAt"
          )
          VALUES (
            ${createAdminUserId()},
            ${input.name.trim()},
            ${email},
            ${passwordHash},
            true,
            CURRENT_TIMESTAMP
          )
          RETURNING
            "id",
            "name",
            "email",
            "passwordHash",
            "isActive",
            "createdAt",
            "updatedAt"
        `
      )[0];

  return toSafeAdminUser(user);
}

export async function updateAdminUser(
  id: string,
  input: {
    currentAdminEmail?: string | null;
    email: string;
    isActive: boolean;
    name: string;
    password?: string;
  },
) {
  const prisma = getPrisma();
  const existing = await findAdminUserById(id);

  if (!existing) {
    throw new Error("Admin user was not found.");
  }

  const currentAdminEmail = input.currentAdminEmail
    ? normalizeAdminEmail(input.currentAdminEmail)
    : "";

  if (!input.isActive && existing.email === currentAdminEmail) {
    throw new Error("You cannot deactivate your own admin account.");
  }

  if (!input.isActive) {
    const activeCount = await countOtherActiveAdminUsers(id);

    if (activeCount === 0) {
      throw new Error("At least one active admin user is required.");
    }
  }

  const email = normalizeAdminEmail(input.email);
  const name = input.name.trim();
  const user = prisma.adminUser
    ? await prisma.adminUser.update({
        data: {
          email,
          isActive: input.isActive,
          name,
          ...(input.password
            ? {
                passwordHash: await hashPassword(input.password),
              }
            : {}),
        },
        where: {
          id,
        },
      })
    : input.password
      ? (
          await prisma.$queryRaw<AdminUserRecord[]>`
            UPDATE "AdminUser"
            SET
              "email" = ${email},
              "isActive" = ${input.isActive},
              "name" = ${name},
              "passwordHash" = ${await hashPassword(input.password)},
              "updatedAt" = CURRENT_TIMESTAMP
            WHERE "id" = ${id}
            RETURNING
              "id",
              "name",
              "email",
              "passwordHash",
              "isActive",
              "createdAt",
              "updatedAt"
          `
        )[0]
      : (
          await prisma.$queryRaw<AdminUserRecord[]>`
            UPDATE "AdminUser"
            SET
              "email" = ${email},
              "isActive" = ${input.isActive},
              "name" = ${name},
              "updatedAt" = CURRENT_TIMESTAMP
            WHERE "id" = ${id}
            RETURNING
              "id",
              "name",
              "email",
              "passwordHash",
              "isActive",
              "createdAt",
              "updatedAt"
          `
        )[0];

  return toSafeAdminUser(user);
}

export async function deleteAdminUser(
  id: string,
  currentAdminEmail?: string | null,
) {
  const prisma = getPrisma();
  const existing = await findAdminUserById(id);

  if (!existing) {
    return;
  }

  if (
    currentAdminEmail &&
    existing.email === normalizeAdminEmail(currentAdminEmail)
  ) {
    throw new Error("You cannot delete your own admin account.");
  }

  const activeCount = await countOtherActiveAdminUsers(id);

  if (existing.isActive && activeCount === 0) {
    throw new Error("At least one active admin user is required.");
  }

  if (prisma.adminUser) {
    await prisma.adminUser.delete({
      where: {
        id,
      },
    });
  } else {
    await prisma.$executeRaw`
      DELETE FROM "AdminUser"
      WHERE "id" = ${id}
    `;
  }
}
