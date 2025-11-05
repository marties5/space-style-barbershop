"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  assignMenuToGroup,
  removeMenuFromGroup,
  getMenuById,
  getAllGroups,
} from "./actions";

interface PermissionDialogProps {
  menuId: string;
  menuName: string;
  children: React.ReactNode;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
}

interface MenuPermission {
  groupId: string;
  groupName: string;
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export function PermissionDialog({
  menuId,
  menuName,
  children,
}: PermissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [groups, setGroups] = useState<Group[]>([]);
  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [newPermission, setNewPermission] = useState({
    canRead: true,
    canWrite: false,
    canUpdate: false,
    canDelete: false,
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, menuId]);

  const loadData = async () => {
    try {
      const [groupsData, menuData] = await Promise.all([
        getAllGroups(),
        getMenuById(menuId),
      ]);

      setGroups(groupsData);

      if (menuData && menuData.groups) {
        setMenuPermissions(
          menuData.groups.map((group) => ({
            groupId: group.id,
            groupName: group.name,
            canRead: true,
            canWrite: false,
            canUpdate: false,
            canDelete: false,
          }))
        );
      }
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  const handleAddPermission = () => {
    if (!selectedGroupId) {
      toast.error("Please select a group");
      return;
    }

    startTransition(async () => {
      try {
        await assignMenuToGroup(menuId, {
          groupId: selectedGroupId,
          ...newPermission,
        });
        toast.success("Permission added successfully");
        await loadData();
        setSelectedGroupId("");
        setNewPermission({
          canRead: true,
          canWrite: false,
          canUpdate: false,
          canDelete: false,
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add permission"
        );
      }
    });
  };

  const handleRemovePermission = (groupId: string) => {
    startTransition(async () => {
      try {
        await removeMenuFromGroup(menuId, groupId);
        toast.success("Permission removed successfully");
        await loadData();
      } catch (error) {
        toast.error("Failed to remove permission");
      }
    });
  };

  const availableGroups = groups.filter(
    (g) => !menuPermissions.some((mp) => mp.groupId === g.id)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>
            Configure group access permissions for <strong>{menuName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Permission */}
          <div className="space-y-4 border rounded-lg p-4">
            <h4 className="font-medium text-sm">Add Group Permission</h4>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Select Group</Label>
                <Select
                  value={selectedGroupId}
                  onValueChange={setSelectedGroupId}
                  disabled={isPending || availableGroups.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canRead"
                    checked={newPermission.canRead}
                    onCheckedChange={(checked) =>
                      setNewPermission({
                        ...newPermission,
                        canRead: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="canRead" className="cursor-pointer">
                    Can Read
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canWrite"
                    checked={newPermission.canWrite}
                    onCheckedChange={(checked) =>
                      setNewPermission({
                        ...newPermission,
                        canWrite: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="canWrite" className="cursor-pointer">
                    Can Write
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canUpdate"
                    checked={newPermission.canUpdate}
                    onCheckedChange={(checked) =>
                      setNewPermission({
                        ...newPermission,
                        canUpdate: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="canUpdate" className="cursor-pointer">
                    Can Update
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canDelete"
                    checked={newPermission.canDelete}
                    onCheckedChange={(checked) =>
                      setNewPermission({
                        ...newPermission,
                        canDelete: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="canDelete" className="cursor-pointer">
                    Can Delete
                  </Label>
                </div>
              </div>

              <Button
                onClick={handleAddPermission}
                disabled={isPending || !selectedGroupId}
                className="w-full"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Permission
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Current Permissions */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Current Permissions</h4>

            {menuPermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No groups assigned yet
              </p>
            ) : (
              <div className="space-y-2">
                {menuPermissions.map((permission) => (
                  <div
                    key={permission.groupId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {permission.groupName}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {permission.canRead && (
                          <Badge variant="secondary" className="text-xs">
                            Read
                          </Badge>
                        )}
                        {permission.canWrite && (
                          <Badge variant="secondary" className="text-xs">
                            Write
                          </Badge>
                        )}
                        {permission.canUpdate && (
                          <Badge variant="secondary" className="text-xs">
                            Update
                          </Badge>
                        )}
                        {permission.canDelete && (
                          <Badge variant="secondary" className="text-xs">
                            Delete
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePermission(permission.groupId)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
