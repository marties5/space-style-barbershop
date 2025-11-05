"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getOperationalCostToday } from "../staff-daily-actions";

export function OperationalStatsToday() {
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getOperationalCostToday();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Error loading operational stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Biaya Operational Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.count === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Biaya Operational Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Tidak ada pengeluaran hari ini
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Biaya Operational Hari Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-2xl font-bold">
              Rp {stats.totalCost.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.count} transaksi
            </p>
          </div>
          <div className="space-y-2">
            {Object.entries(stats.byCategory)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 3)
              .map(([category, amount]) => (
                <div
                  key={category}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-muted-foreground">{category}</span>
                  <Badge variant="outline">
                    Rp {(amount as number).toLocaleString("id-ID")}
                  </Badge>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
