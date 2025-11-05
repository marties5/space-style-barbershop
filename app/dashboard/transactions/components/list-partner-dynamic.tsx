"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStaffDailyData } from "../staff-daily-actions";

interface StaffDaily {
  id: number;
  name: string;
  role: string;
  jumlah_hari_ini: number;
  revenue_hari_ini: number;
  service_count: number;
  product_count: number;
  commission: number;
}

export default function ListPartnerDynamic() {
  const [staffData, setStaffData] = useState<StaffDaily[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = () => {
    const date = new Date();
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getStaffDailyData();
        if (result.success) {
          setStaffData(result.data);
        }
      } catch (error) {
        console.error("Error loading staff data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  console.log(staffData);
  return (
    <div className="w-full col-span-1 border-l px-8">
      <h2 className="text-lg font-semibold mb-4">Staff Hari Ini {today()}</h2>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : staffData.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Tidak ada transaksi hari ini
        </div>
      ) : (
        <div className="space-y-2">
          {staffData
            .sort((a, b) => b.jumlah_hari_ini - a.jumlah_hari_ini)
            .map((staff) => (
              <Card
                key={staff.id}
                className="flex items-center justify-between p-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardContent className="flex flex-row items-center justify-between w-full p-0">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{staff.name}</span>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {staff.service_count} Jasa
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {staff.product_count} Produk
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge className="font-semibold text-lg">
                        {staff.jumlah_hari_ini}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Rp {staff.revenue_hari_ini.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Button variant="link" className="text-blue-600">
                      <Link href={"/dashboard/staff/report/" + staff.id}>
                        Detail
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
