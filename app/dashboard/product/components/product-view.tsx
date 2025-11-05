"use client";
import { Button } from "@/components/ui/button";
import { getViewMode, setViewMode } from "@/lib/getViewMode";
import { useEffect, useState } from "react";
import ProductCard from "./product-card";
import ProductTable from "./product-table";

export default function ProductView({ products }: { products: any[] }) {
  const [view, setView] = useState<"table" | "card">("table");

  useEffect(() => {
    setView(getViewMode());
  }, []);

  const handleSwitch = (mode: "table" | "card") => {
    setView(mode);
    setViewMode(mode);
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4 gap-2">
        <Button
          variant={view === "table" ? "default" : "outline"}
          onClick={() => handleSwitch("table")}
        >
          Tabel
        </Button>
        <Button
          variant={view === "card" ? "default" : "outline"}
          onClick={() => handleSwitch("card")}
        >
          Card
        </Button>
      </div>

      {view === "table" ? (
        <ProductTable products={products} />
      ) : (
        <ProductCard products={products} />
      )}
    </div>
  );
}
