import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Seed Groups
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

  // Seed Menus
const menus = await Promise.all([
  prisma.menu.upsert({
    where: { path: "/dashboard" }, // sekarang valid
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

  // Seed Staff
  const staff = await Promise.all([
    prisma.staff.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Wahyudi",
        role: "Senior Barber",
        commissionRate: 150,
      },
    }),
    prisma.staff.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Suneo",
        role: "Barber",
        commissionRate: 120,
      },
    }),
    prisma.staff.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "Djarwo",
        role: "Junior Barber",
        commissionRate: 100,
      },
    }),
  ]);

  console.log("✅ Staff seeded");

  // Seed Services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Hair Cut",
        price: 25000,
        imageUrl: "/hair-cut-barber.png",
      },
    }),
    prisma.service.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Hair Trim",
        price: 20000,
        imageUrl: "/hair-trim-scissors.png",
      },
    }),
    prisma.service.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "Shaving",
        price: 15000,
        imageUrl: "/shaving-razor.png",
      },
    }),
    prisma.service.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: "Hair Coloring",
        price: 75000,
        imageUrl: "/hair-coloring-dye.png",
      },
    }),
  ]);

  console.log("✅ Services seeded");

  // Seed Products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Pomade",
        price: 50000,
        costPrice: 35000,
        stockQuantity: 45,
        imageUrl: "/pomade-hair-product-gold.png",
      },
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Hair Vitamin",
        price: 40000,
        costPrice: 28000,
        stockQuantity: 32,
        imageUrl: "/hair-vitamin-spray-bottle.png",
      },
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "Hair Tonic",
        price: 30000,
        costPrice: 20000,
        stockQuantity: 28,
        imageUrl: "/hair-tonic-green-bottle.png",
      },
    }),
    prisma.product.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: "Shampoo",
        price: 35000,
        costPrice: 25000,
        stockQuantity: 18,
        imageUrl: "/black-shampoo-bottle.png",
      },
    }),
    prisma.product.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: "Hair Powder A",
        price: 75000,
        costPrice: 50000,
        stockQuantity: 12,
        imageUrl: "/hair-powder-green-bottle.png",
      },
    }),
    prisma.product.upsert({
      where: { id: 6 },
      update: {},
      create: {
        name: "Hair Powder D",
        price: 95000,
        costPrice: 65000,
        stockQuantity: 8,
        imageUrl: "/hair-powder-green-bottle.png",
      },
    }),
  ]);

  console.log("✅ Products seeded");

  // Seed Menu Roles - Grant superadmin access to all menus
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
  }

  // Grant partner group access to Dashboard and Profile only
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
  }

  console.log("✅ Menu roles seeded");

 

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
