"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllGroups() {
  return prisma.group.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}
export async function createGroupAction(formData: FormData) {
  const name = formData.get("name")?.toString().trim() || "";
  const description = formData.get("description")?.toString().trim() || "";

  if (!name) {
    return { ok: false, errors: { name: "Nama grup wajib diisi" } };
  }

  const active = await prisma.group.findFirst({
    where: { name, isActive: true },
  });

  if (active) {
    return { ok: false, errors: { name: "Nama grup sudah ada" } };
  }

  const softDeleted = await prisma.group.findFirst({
    where: { name, isActive: false },
  });

  if (softDeleted) {
    await prisma.group.update({
      where: { id: softDeleted.id },
      data: { isActive: true, description },
    });

    revalidatePath("/groups");
    return { ok: true };
  }

  await prisma.group.create({
    data: { name, description, isActive: true },
  });

  revalidatePath("/groups");
  return { ok: true };
}

export async function updateGroupAction(formData: FormData) {
  const id = formData.get("id")?.toString() || "";
  const name = formData.get("name")?.toString().trim() || "";
  const description = formData.get("description")?.toString().trim() || "";

  if (!name) {
    return { ok: false, errors: { name: "Nama grup wajib diisi" } };
  }

  const exists = await prisma.group.findFirst({
    where: { name, isActive: true, NOT: { id } },
  });
  if (exists) {
    return { ok: false, errors: { name: "Nama grup sudah ada" } };
  }

  await prisma.group.update({
    where: { id },
    data: { name, description },
  });

  revalidatePath("/groups");
  return { ok: true };
}

export async function deleteGroupAction(id: string) {
  await prisma.group.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/groups");
  return { ok: true };
}
