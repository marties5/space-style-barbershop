"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateGroupAction } from "../actions";

export function GroupActions({ group }: any) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    setErrors({});

    const result = await updateGroupAction(formData);

    if (!result.ok) {
      setErrors(result.errors ?? {});
      setLoading(false);
      return;
    }

    toast.success("Group diperbarui");
    setOpen(false);
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
        </DialogHeader>

        <form action={handleUpdate} className="space-y-4">
          <input type="hidden" name="id" value={group.id} />

          <div>
            <Label>Nama</Label>
            <Input name="name" defaultValue={group.name} />
            {errors.name && (
              <p className="text-destructive text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label>Deskripsi</Label>
            <Input name="description" defaultValue={group.description || ""} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
