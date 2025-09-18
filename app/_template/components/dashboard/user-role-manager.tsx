"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
  description?: string;
}

interface UserRoleManagerProps {
  userId: string;
  currentGroups: Group[];
}

// Mock groups data - in real app, fetch from API
const availableGroups = [
  { id: "1", name: "Admin", description: "Full system access" },
  { id: "2", name: "Manager", description: "Department management" },
  { id: "3", name: "User", description: "Basic user access" },
];

export function UserRoleManager({
  userId,
  currentGroups,
}: UserRoleManagerProps) {
  const [open, setOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    currentGroups.map((g) => g.id)
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real app, make API call to update user groups
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating user groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Manage Roles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage User Roles</DialogTitle>
          <DialogDescription>
            Select the groups this user should belong to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Current Groups:</h4>
            <div className="flex flex-wrap gap-2">
              {currentGroups.length > 0 ? (
                currentGroups.map((group) => (
                  <Badge key={group.id} variant="secondary">
                    {group.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No groups assigned
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Available Groups:</h4>
            <div className="space-y-3">
              {availableGroups.map((group) => (
                <div key={group.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={group.id}
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={() => handleGroupToggle(group.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={group.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {group.name}
                    </label>
                    {group.description && (
                      <p className="text-xs text-muted-foreground">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
