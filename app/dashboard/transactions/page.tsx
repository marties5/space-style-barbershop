import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { getProducts } from "../product/actions";
import { getServices } from "../services/actions";
import ListPartnerDynamic from "./components/list-partner-dynamic";
import { OperationalStatsToday } from "./components/operational-stats-today";
import { SelectPartnerForm } from "./components/patnert-selection-form";
import SectionGoods from "./components/sectionGoods";

export const metadata = {
  title: "Transaksi",
  description: "Kelola transaksi penjualan dan layanan",
};

async function TransactionPage() {
  const [ServiceData, result] = await Promise.all([
    getServices(),
    getProducts(),
  ]);

  const GoodsData = result.success
    ? result.data?.filter((d) => d.isActive == true)
    : [];

  return (
    <div className="min-h-screen px-4">
      <div>
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-semibold">Transaksi</h1>
          <Link
            href="/dashboard/transactions/history"
            className="underline text-blue-600"
          >
            Riwayat Transaksi
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full mb-8">
          <div className="flex flex-wrap gap-4 col-span-2">
            {ServiceData?.map((item: any) => (
              <Card
                key={item.id}
                className="p-1 h-fit w-60 hover:border hover:border-purple-600"
                id={`transaction-${item.id}`}
              >
                <CardContent className="p-1 pb-0">
                  <div>
                    <Image
                      src={item.imageUrl ?? "/default-service.png"}
                      alt="Transaction Image"
                      width={500}
                      height={300}
                      className="h-32 w-full object-cover rounded-md"
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-2 mt-0 pt-0 flex flex-col justify-start items-start w-full">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p>Harga Rp : {item.price}</p>
                  </div>
                  <SelectPartnerForm goodId={item} />
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="col-span-1 flex flex-col gap-4 border-l px-8">
            <ListPartnerDynamic />
            <OperationalStatsToday />
          </div>
        </div>
      </div>

      <SectionGoods GoodsData={GoodsData} />
    </div>
  );
}

export default TransactionPage;
