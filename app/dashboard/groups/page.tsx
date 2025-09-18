// components/dashboard/user-role-manager.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useEffect } from "react";
import { getAllGroups } from "./actions";
import { assignUserToGroup, removeUserFromGroup } from "../users/actions";

interface Group {
  id: string;
  name: string;
  description: string | null;
}

interface UserRoleManagerProps {
  userId: string;
  currentGroups: Group[];
}

export function UserRoleManager({ userId, currentGroups }: UserRoleManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load available groups when dialog opens
  useEffect(() => {
    if (isOpen && availableGroups.length === 0) {
      setIsLoadingGroups(true);
      getAllGroups()
        .then((groups) => {
          setAvailableGroups(groups);
        })
        .catch((error) => {
          console.error("Error loading groups:", error);
          toast.error("Failed to load groups");
        })
        .finally(() => {
          setIsLoadingGroups(false);
        });
    }
  }, [isOpen, availableGroups.length]);

  // Get groups that user is not already assigned to
  const unassignedGroups = availableGroups.filter(
    (group) => !currentGroups.some((currentGroup) => currentGroup.id === group.id)
  );

  const handleAddToGroup = () => {
    if (!selectedGroupId) return;

    startTransition(async () => {
      try {
        await assignUserToGroup({
          userId,
          groupId: selectedGroupId,
        });
        
        toast.success("User successfully added to group");
        setSelectedGroupId("");
        // Refresh available groups
        setAvailableGroups([]);
      } catch (error) {
        console.error("Error adding user to group:", error);
        toast.error("Failed to add user to group");
      }
    });
  };

  const handleRemoveFromGroup = (groupId: string) => {
    startTransition(async () => {
      try {
        await removeUserFromGroup({
          userId,
          groupId,
        });
        
        toast.success("User successfully removed from group");
        // Refresh available groups
        setAvailableGroups([]);
      } catch (error) {
        console.error("Error removing user from group:", error);
        toast.error("Failed to remove user from group");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage User Groups</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Groups */}
          <div>
            <h4 className="text-sm font-medium mb-3">Current Groups</h4>
            {currentGroups.length > 0 ? (
              <div className="space-y-2">
                {currentGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{group.name}</p>
                      {group.description && (
                        <p className="text-xs text-muted-foreground">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFromGroup(group.id)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No groups assigned</p>
            )}
          </div>

          {/* Add to Group */}
          <div>
            <h4 className="text-sm font-medium mb-3">Add to Group</h4>
            
            {isLoadingGroups ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading groups...</span>
              </div>
            ) : unassignedGroups.length > 0 ? (
              <div className="flex gap-2">
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div>
                          <p className="font-medium">{group.name}</p>
                          {group.description && (
                            <p className="text-xs text-muted-foreground">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddToGroup}
                  disabled={!selectedGroupId || isPending}
                  size="sm"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                All available groups have been assigned
              </p>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}