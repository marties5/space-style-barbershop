"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { CheckCircle, Shield, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface Permission {
  menu_id: string;
  menu_name: string;
  menu_path: string;
  can_read: boolean;
  can_write: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export function RoleTestComponent() {
  const { user } = useUser();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/user/permissions");
        if (response.ok) {
          const data = await response.json();
          setPermissions(data.permissions || []);
        } else {
          setError("Failed to fetch permissions");
        }
      } catch (err) {
        setError("Error fetching permissions");
        console.error("Permission fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role-Based Access Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading permissions...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role-Based Access Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role-Based Access Test
        </CardTitle>
        <CardDescription>
          Testing role-based access control for current user
        </CardDescription>
      </CardHeader>
      <CardContent>
        {permissions.length > 0 ? (
          <div className="space-y-3">
            {permissions.map((permission) => (
              <div
                key={permission.menu_id}
                className="p-3 border border-border rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{permission.menu_name}</h4>
                  <Badge variant="outline">{permission.menu_path}</Badge>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={permission.can_read ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {permission.can_read ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    View
                  </Badge>
                  <Badge
                    variant={permission.can_write ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {permission.can_write ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    Create
                  </Badge>
                  <Badge
                    variant={permission.can_update ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {permission.can_update ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    Edit
                  </Badge>
                  <Badge
                    variant={permission.can_delete ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {permission.can_delete ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    Delete
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              No permissions found. User may not be assigned to any groups.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
