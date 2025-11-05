import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Layers, ArrowLeft } from "lucide-react";
import { StaffLevelForm } from "./components/staff-level-form";
import { getAllStaffLevels } from "./actions";
import { StaffLevelTable } from "./components/staff-level-table";


export const metadata = {
  title: "Manajemen Level Staff",
  description: "Kelola level dan hierarki staff",
};

export default async function StaffLevelPage() {
  const levelsResult = await getAllStaffLevels(false);
  const levels = levelsResult.success ? levelsResult.data : [];

  const activeCount = levels.filter((l: any) => l.isActive).length;
  const totalStaffInLevels = levels.reduce(
    (sum: number, l: any) => sum + (l.staff?.length || 0),
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
                <Layers className="w-8 h-8" />
                Manajemen Level Staff
              </h1>
              <p className="text-muted-foreground mt-1">
                Kelola level dan hierarki staff
              </p>
            </div>
          </div>
          <StaffLevelForm />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Level Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{levels.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStaffInLevels}</div>
            </CardContent>
          </Card>
        </div>

        {/* Level Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Level Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffLevelTable levels={levels} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
