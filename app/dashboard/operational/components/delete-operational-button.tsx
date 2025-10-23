"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteOperational } from "../action";

interface DeleteOperationalButtonProps {
  id: number;
}

export function DeleteOperationalButton({ id }: DeleteOperationalButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus catatan ini?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteOperational(id);
    } catch (error) {
      console.error("Error deleting operational:", error);
      alert("Terjadi kesalahan saat menghapus data");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
