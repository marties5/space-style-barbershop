"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAllGroups } from "../groups/actions";
import { assignUserToGroup, createManualUser } from "./actions";

const addUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  avatarUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  groupIds: z.array(z.string()).optional(),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

interface Group {
  id: string;
  name: string;
  description: string | null;
}

export function AddUserForm() {
  const [isPending, startTransition] = useTransition();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const router = useRouter();

  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      avatarUrl: "",
      groupIds: [],
    },
  });

  useEffect(() => {
    getAllGroups()
      .then((groupsData) => {
        setGroups(groupsData);
      })
      .catch((error) => {
        console.error("Error loading groups:", error);
        toast.error("Failed to load groups");
      })
      .finally(() => {
        setIsLoadingGroups(false);
      });
  }, []);

  const onSubmit = (data: AddUserFormData) => {
    startTransition(async () => {
      try {
        const newUser = await createManualUser({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          avatarUrl: data.avatarUrl || "",
        });

        if (data.groupIds && data.groupIds.length > 0) {
          const assignmentPromises = data.groupIds.map((groupId) =>
            assignUserToGroup({
              userId: newUser.id,
              groupId,
            })
          );

          try {
            await Promise.all(assignmentPromises);
          } catch (groupError) {
            console.warn("Some group assignments failed:", groupError);
            toast.warning("User created but some group assignments failed");
          }
        }

        toast.success("User created successfully!");

        // Redirect to users page
        router.push("/users");
      } catch (error) {
        console.error("Error creating user:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create user";
        toast.error(errorMessage);
      }
    });
  };

  const selectedGroupIds = form.watch("groupIds") || [];

  return (
    <div className="space-y-6">
      {/* Form validation errors display */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Basic Information</h3>
              <p className="text-sm text-muted-foreground">
                Enter the user's basic details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The user will receive an invitation to this email address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL to the user's profile picture
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Group Assignment */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Group Assignment</h3>
              <p className="text-sm text-muted-foreground">
                Select groups to assign to this user
              </p>
            </div>

            {isLoadingGroups ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading groups...
                </span>
              </div>
            ) : groups.length > 0 ? (
              <FormField
                control={form.control}
                name="groupIds"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groups.map((group) => (
                        <FormField
                          key={group.id}
                          control={form.control}
                          name="groupIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={group.id}
                                className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-lg"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(group.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            group.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== group.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-medium cursor-pointer">
                                    {group.name}
                                  </FormLabel>
                                  {group.description && (
                                    <FormDescription className="text-xs">
                                      {group.description}
                                    </FormDescription>
                                  )}
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="text-center py-8 border rounded-lg border-dashed">
                <p className="text-sm text-muted-foreground">
                  No groups available. Create groups first to assign them to
                  users.
                </p>
              </div>
            )}
          </div>

          {/* Selected Groups Summary */}
          {selectedGroupIds.length > 0 && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">
                  Selected Groups ({selectedGroupIds.length}):
                </FormLabel>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedGroupIds.map((groupId) => {
                  const group = groups.find((g) => g.id === groupId);
                  return group ? (
                    <div
                      key={groupId}
                      className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                    >
                      {group.name}
                      <button
                        type="button"
                        onClick={() => {
                          const currentGroupIds =
                            form.getValues("groupIds") || [];
                          form.setValue(
                            "groupIds",
                            currentGroupIds.filter((id) => id !== groupId)
                          );
                        }}
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <Button type="submit" disabled={isPending} className="min-w-32">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/users")}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
