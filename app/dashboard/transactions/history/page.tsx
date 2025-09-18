"use client";

import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  DollarSign,
  Eye,
  Filter,
  Layers,
  Package,
  RefreshCw,
  Search,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/transactions-utils";
import { formatDate } from "@/lib/utils";
import { getAllStaff } from "../../partners/add/actions";
import { TransactionDetailModal } from "../components/DetailModal";
import { getTransactionDetail, getTransactionHistory } from "./actions";

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    dateFrom: "",
    dateTo: "",
    paymentMethod: "all",
    transaction_type: "all",
    staffId: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalTransactions: 0,
    cashTransactions: 0,
    qrisTransactions: 0,
    serviceTransactions: 0, // TAMBAHKAN INI
    productTransactions: 0, // TAMBAHKAN INI
    mixedTransactions: 0, // TAMBAHKAN INI
  });
  const [staffList, setStaffList] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDetailTransaction, setShowDetailTransaction] = useState(false);
  useEffect(() => {
    loadTransactions();
    loadStaffList();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      console.log("[v0] Loading transactions with filters:", filters);
      const response = await getTransactionHistory(filters as any);
      if (response.success && response.data) {
        setTransactions(response.data.transactions as any);
        setPagination(response.data.pagination);
        setSummary(response.data.summary);
        console.log("[v0] Transaction data loaded:", {
          transactionCount: response.data.transactions.length,
          pagination: response.data.pagination,
          summary: response.data.summary,
        });
      } else {
        console.error("Failed to load transactions:", response.error);
        alert(`Error loading transactions: ${response.error}`);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      alert(
        `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStaffList = async () => {
    try {
      const response = await getAllStaff();
      if (response.success && response.data) {
        setStaffList(response.data as any);
      }

      console.log("response", response.data);
    } catch (error) {
      console.error("Error loading staff list:", error);
    }
  };

  const handleFilterChange = (key: any, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      dateFrom: "",
      dateTo: "",
      paymentMethod: "all",
      transaction_type: "all",
      staffId: "",
      search: "",
    });
  };

  const handleViewDetail = async (transaction: any) => {
    try {
      const response = await getTransactionDetail(transaction.id);
      if (response.success) {
        setSelectedTransaction(response.data);
      } else {
        setSelectedTransaction(transaction);
      }
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error loading transaction detail:", error);
      setSelectedTransaction(transaction);
      setShowDetailModal(true);
    }
  };

  const closeDetailModal = () => {
    setSelectedTransaction(null);
    setShowDetailModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-2 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Riwayat Transaksi</h1>
          <p className="text-sm text-muted-foreground">
            Kelola dan pantau semua transaksi
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </Button>
          <Button size="sm" onClick={loadTransactions} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4  gap-2">
        <Card className="p-2 w-full">
          <CardContent className="px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-md">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Pendapatan
                </p>
                <p className="text-sm font-semibold">
                  {formatCurrency(summary.totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 w-full">
          <CardContent className="px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-md">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cash</p>
                <p className="text-sm font-semibold">
                  {summary.cashTransactions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 w-full">
          <CardContent className="px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-md">
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">QRIS</p>
                <p className="text-sm font-semibold">
                  {summary.qrisTransactions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer  p-2 w-full"
          onClick={() => setShowDetailTransaction(!showDetailTransaction)}
        >
          <CardContent className="px-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-md">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Transaksi
                  </p>
                  <p className="text-sm font-semibold">
                    {summary.totalTransactions}
                  </p>
                </div>
              </div>
              <div className="p-1">
                {showDetailTransaction ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showDetailTransaction && (
        <div id="detail-transaction" className="w-full space-y-1">
          <Card className="p-0 w-full">
            <CardContent className="p-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 rounded-md">
                  <Wrench className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex justify-between items-center w-full pr-2">
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="text-sm font-semibold">
                    {summary.serviceTransactions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0 w-full">
            <CardContent className="p-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-100 rounded-md">
                  <Package className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex justify-between items-center w-full pr-2">
                  <p className="text-xs text-muted-foreground">Product</p>
                  <p className="text-sm font-semibold">
                    {summary.productTransactions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0 w-full">
            <CardContent className="p-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-md">
                  <Layers className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex justify-between items-center w-full pr-2">
                  <p className="text-xs text-muted-foreground">Mixed</p>
                  <p className="text-sm font-semibold">
                    {summary.mixedTransactions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showFilters && (
        <Card>
          <CardContent className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <Label htmlFor="search" className="text-xs">
                  Cari
                </Label>
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-2.5 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Nomor transaksi..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="pl-7 h-8 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dateFrom" className="text-xs">
                  Dari Tanggal
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    handleFilterChange("dateFrom", e.target.value)
                  }
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="dateTo" className="text-xs">
                  Sampai Tanggal
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Metode Pembayaran</Label>
                <Select
                  value={filters.paymentMethod}
                  onValueChange={(value) =>
                    handleFilterChange("paymentMethod", value)
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Jenis Transaksi</Label>
                <Select
                  value={filters.transaction_type}
                  onValueChange={(value) =>
                    handleFilterChange("transaction_type", value)
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Staff</Label>
                <Select
                  value={filters.staffId}
                  onValueChange={(value) =>
                    handleFilterChange("staffId", value)
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Semua Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Staff</SelectItem>
                    {staffList.map((staff: any) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="w-full h-8 text-xs bg-transparent"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="h-10">
                  <TableHead className="text-xs font-medium">
                    No. Transaksi
                  </TableHead>
                  <TableHead className="text-xs font-medium">Tanggal</TableHead>
                  <TableHead className="text-xs font-medium">Staff</TableHead>
                  <TableHead className="text-xs font-medium">Jenis</TableHead>
                  <TableHead className="text-xs font-medium">Item</TableHead>
                  <TableHead className="text-xs font-medium">
                    Pembayaran
                  </TableHead>
                  <TableHead className="text-xs font-medium">Total</TableHead>
                  <TableHead className="text-xs font-medium">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="text-xs">Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-6 text-muted-foreground text-xs"
                    >
                      Tidak ada transaksi ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction: any) => (
                    <TableRow key={transaction.id} className="h-12">
                      <TableCell className="font-medium text-xs py-2">
                        {transaction.transactionNumber}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs py-2">
                        {formatDate(transaction.transactionDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs py-2">
                        {transaction.staff?.name || "-"}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-0.5 ${
                            transaction.transaction_type === "service"
                              ? "bg-orange-100 text-orange-800 border-orange-200"
                              : transaction.transaction_type === "product"
                              ? "bg-cyan-100 text-cyan-800 border-cyan-200"
                              : "bg-indigo-100 text-indigo-800 border-indigo-200"
                          }`}
                        >
                          {transaction.transaction_type === "service" && (
                            <Wrench className="w-3 h-3 mr-1" />
                          )}
                          {transaction.transaction_type === "product" && (
                            <Package className="w-3 h-3 mr-1" />
                          )}
                          {transaction.transaction_type === "mixed" && (
                            <Layers className="w-3 h-3 mr-1" />
                          )}
                          {transaction.transaction_type?.toUpperCase() ||
                            "MIXED"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs py-2">
                        <div className="max-w-32">
                          {transaction.transactionItems?.map(
                            (item: any, idx: number) => (
                              <div key={idx} className="truncate">
                                {item.itemName} ({item.quantity}x)
                              </div>
                            )
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant={
                            transaction.paymentMethod === "cash"
                              ? "default"
                              : "secondary"
                          }
                          className={`text-xs px-2 py-0.5 ${
                            transaction.paymentMethod === "cash"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          }`}
                        >
                          {transaction.paymentMethod === "cash" ? (
                            <DollarSign className="w-3 h-3 mr-1" />
                          ) : (
                            <CreditCard className="w-3 h-3 mr-1" />
                          )}
                          {transaction.paymentMethod.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-xs py-2">
                        {formatCurrency(transaction.totalAmount)}
                      </TableCell>
                      <TableCell className="py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(transaction)}
                          title="Lihat Detail"
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 border-t">
              <div className="text-xs text-muted-foreground">
                {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                dari {pagination.total}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="h-7 px-2 text-xs"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(3, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 2) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 1) {
                        pageNum = pagination.totalPages - 2 + i;
                      } else {
                        pageNum = pagination.page - 1 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.page === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-7 h-7 p-0 text-xs"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="h-7 px-2 text-xs"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={showDetailModal}
        onClose={closeDetailModal}
      />
    </div>
  );
};

export default TransactionHistoryPage;
