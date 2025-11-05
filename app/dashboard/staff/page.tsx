import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

import { getAllStaff, getStaffLevels } from "./action";
import { StaffForm } from "./components/staff-form";
import { StaffTable } from "./components/staff-table";

export const metadata = {
  title: "Manajemen Staff",
  description: "Kelola data staff dan informasi mereka",
};

export default async function StaffPage() {
  const [staffResult, levelsResult] = await Promise.all([
    getAllStaff(false),
    getStaffLevels(),
  ]);

  const staff = staffResult.success ? staffResult.data : [];
  const levels = levelsResult.success ? levelsResult.data : [];

  const activeCount = staff.filter((s: any) => s.isActive).length;
  const totalTransactions = staff.reduce(
    (sum: number, s: any) => sum + (s.transactions?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="w-8 h-8" />
                Manajemen Staff
              </h1>
              <p className="text-muted-foreground mt-1">
                Kelola informasi dan data staff
              </p>
            </div>
          </div>
          <StaffForm levels={levels} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Staff Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffTable staff={staff} levels={levels} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
