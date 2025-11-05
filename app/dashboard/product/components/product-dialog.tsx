"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductForm from "./product-form";

interface ProductDialogProps {
  mode: "create" | "edit";
  product?: any;
  children: React.ReactNode;
}

export default function ProductDialog({
  mode,
  product,
  children,
}: ProductDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{children}</div>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Produk Baru" : "Edit Produk"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Tambahkan produk baru ke inventory"
              : "Ubah informasi produk"}
          </DialogDescription>
        </DialogHeader>
        <ProductForm product={product} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
