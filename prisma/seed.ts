import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 🧩 1. Seed Groups
  const groups = await Promise.all([
    prisma.group.upsert({
      where: { name: "superadmin" },
      update: {},
      create: {
        name: "superadmin",
        description: "System administrators with full access",
      },
    }),
    prisma.group.upsert({
      where: { name: "manager" },
      update: {},
      create: {
        name: "manager",
        description: "Department managers with limited admin access",
      },
    }),
    prisma.group.upsert({
      where: { name: "partner" },
      update: {},
      create: {
        name: "partner",
        description: "Regular users with basic access",
      },
    }),
  ]);
  console.log("✅ Groups seeded");

  // 🧩 2. Seed Menus
  const menus = await Promise.all([
    prisma.menu.upsert({
      where: { path: "/dashboard" },
      update: {},
      create: {
        name: "Dashboard",
        path: "/dashboard",
        icon: "LayoutDashboard",
        sortOrder: 1,
      },
    }),
    prisma.menu.upsert({
      where: { path: "/dashboard/users" },
      update: {},
      create: {
        name: "Users",
        path: "/dashboard/users",
        icon: "Users",
        sortOrder: 2,
      },
    }),
    prisma.menu.upsert({
      where: { path: "/dashboard/groups" },
      update: {},
      create: {
        name: "Groups",
        path: "/dashboard/groups",
        icon: "Shield",
        sortOrder: 3,
      },
    }),
    prisma.menu.upsert({
      where: { path: "/dashboard/menus" },
      update: {},
      create: {
        name: "Menus",
        path: "/dashboard/menus",
        icon: "Menu",
        sortOrder: 4,
      },
    }),
    prisma.menu.upsert({
      where: { path: "/profile" },
      update: {},
      create: {
        name: "Profile",
        path: "/profile",
        icon: "User",
        sortOrder: 5,
      },
    }),
  ]);
  console.log("✅ Menus seeded");

  // 🧩 3. Seed Staff
  const staff = await Promise.all([
    prisma.staff.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Wahyudi",
        role: "Senior Barber",
        commissionRate: new Prisma.Decimal(150),
      },
    }),
    prisma.staff.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Suneo",
        role: "Barber",
        commissionRate: new Prisma.Decimal(120),
      },
    }),
    prisma.staff.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "Djarwo",
        role: "Junior Barber",
        commissionRate: new Prisma.Decimal(100),
      },
    }),
  ]);
  console.log("✅ Staff seeded");

  // 🧩 4. Seed Services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Hair Cut",
        price: new Prisma.Decimal(25000),
        imageUrl: "/hair-cut-barber.png",
      },
    }),
    prisma.service.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Hair Trim",
        price: new Prisma.Decimal(20000),
        imageUrl: "/hair-trim-scissors.png",
      },
    }),
    prisma.service.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "Shaving",
        price: new Prisma.Decimal(15000),
        imageUrl: "/shaving-razor.png",
      },
    }),
    prisma.service.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: "Hair Coloring",
        price: new Prisma.Decimal(75000),
        imageUrl: "/hair-coloring-dye.png",
      },
    }),
  ]);
  console.log("✅ Services seeded");

  // 🧩 5. Seed Products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Pomade",
        price: new Prisma.Decimal(50000),
        costPrice: new Prisma.Decimal(35000),
        stockQuantity: 45,
        imageUrl: "/pomade-hair-product-gold.png",
      },
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Hair Vitamin",
        price: new Prisma.Decimal(40000),
        costPrice: new Prisma.Decimal(28000),
        stockQuantity: 32,
        imageUrl: "/hair-vitamin-spray-bottle.png",
      },
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "Hair Tonic",
        price: new Prisma.Decimal(30000),
        costPrice: new Prisma.Decimal(20000),
        stockQuantity: 28,
        imageUrl: "/hair-tonic-green-bottle.png",
      },
    }),
    prisma.product.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: "Shampoo",
        price: new Prisma.Decimal(35000),
        costPrice: new Prisma.Decimal(25000),
        stockQuantity: 18,
        imageUrl: "/black-shampoo-bottle.png",
      },
    }),
    prisma.product.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: "Hair Powder A",
        price: new Prisma.Decimal(75000),
        costPrice: new Prisma.Decimal(50000),
        stockQuantity: 12,
        imageUrl: "/hair-powder-green-bottle.png",
      },
    }),
    prisma.product.upsert({
      where: { id: 6 },
      update: {},
      create: {
        name: "Hair Powder D",
        price: new Prisma.Decimal(95000),
        costPrice: new Prisma.Decimal(65000),
        stockQuantity: 8,
        imageUrl: "/hair-powder-green-bottle.png",
      },
    }),
  ]);
  console.log("✅ Products seeded");

  // 🧩 6. Menu Roles
  const superadminGroup = groups.find((g) => g.name === "superadmin");
  const partnerGroup = groups.find((g) => g.name === "partner");

  if (superadminGroup) {
    for (const menu of menus) {
      await prisma.menuRole.upsert({
        where: {
          groupId_menuId: {
            groupId: superadminGroup.id,
            menuId: menu.id,
          },
        },
        update: {},
        create: {
          groupId: superadminGroup.id,
          menuId: menu.id,
          canRead: true,
          canWrite: true,
          canDelete: true,
        },
      });
    }
    console.log("✅ Superadmin menu roles seeded");
  }

  if (partnerGroup) {
    const allowedMenus = menus.filter((m) =>
      ["Dashboard", "Profile"].includes(m.name)
    );
    for (const menu of allowedMenus) {
      await prisma.menuRole.upsert({
        where: {
          groupId_menuId: {
            groupId: partnerGroup.id,
            menuId: menu.id,
          },
        },
        update: {},
        create: {
          groupId: partnerGroup.id,
          menuId: menu.id,
          canRead: true,
          canWrite: false,
          canDelete: false,
        },
      });
    }
    console.log("✅ Partner menu roles seeded");
  }

  console.log("🌱 Seeding complete!");
}

// ✅ Correct way to call main
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
