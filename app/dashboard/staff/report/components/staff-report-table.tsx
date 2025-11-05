"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Eye } from "lucide-react";

interface StaffReportTableProps {
  staff: any[];
}

export function StaffReportTable({ staff }: StaffReportTableProps) {
  if (staff.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Tidak ada data staff untuk dilaporkan.
      </div>
    );
  }

  const sortedStaff = [...staff].sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>Nama Staff</TableHead>
            <TableHead>Level</TableHead>
            <TableHead className="text-right">Transaksi</TableHead>
            <TableHead className="text-right">Total Pendapatan</TableHead>
            <TableHead className="text-right">Komisi (%)</TableHead>
            <TableHead className="text-right">Komisi (Rp)</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStaff.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>{s.level?.name || "-"}</TableCell>
              <TableCell className="text-right">
                {s.totalTransactions}
              </TableCell>
              <TableCell className="text-right font-semibold">
                Rp {s.totalRevenue.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-right">{s.commissionRate}%</TableCell>
              <TableCell className="text-right font-semibold text-green-600">
                Rp {s.commission.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/dashboard/staff/report/${s.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Detail
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
