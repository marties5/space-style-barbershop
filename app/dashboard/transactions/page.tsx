import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import ListPartner from "./components/list-partner";
import { SelectPartnerForm } from "./components/patnert-selection-form";
import SectionGoods from "./components/sectionGoods";

const ServiceData = [
  {
    id: 1,
    name: "Trim",
    price: 25000,
    image:
      "https://www.dash-stylists.com/storage/uploads/at-home-hairstylist-woman-hand-comb_1694983061.jpeg",
  },
  {
    id: 2,
    name: "Haircut",
    price: 25000,
    image:
      "https://www.holleewoodhair.com/wp-content/uploads/2019/04/hair-cutting-tools-4.jpg",
  },
  {
    id: 3,
    name: "Shampoo & Blow Dry",
    price: 40000,
    image:
      "https://labellehairbeauty.com.au/wp-content/uploads/2020/05/hairdresser-hair-shampoo-and-hair-wash-768x427.jpg",
  },
  {
    id: 4,
    name: "Beard Trim",
    price: 150000,
    image:
      "https://th.bing.com/th/id/OIP.oZvnTEv7Dq5FLNDQ5ncFoQHaHa?w=183&h=183&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3",
  },
];

const GoodsData = [
  {
    id: 1,
    name: "Kopi",
    price: 25000,
    image:
      "https://www.dash-stylists.com/storage/uploads/at-home-hairstylist-woman-hand-comb_1694983061.jpeg",
  },
  {
    id: 2,
    name: "teh",
    price: 25000,
    image:
      "https://www.holleewoodhair.com/wp-content/uploads/2019/04/hair-cutting-tools-4.jpg",
  },
  {
    id: 3,
    name: "Shampo",
    price: 40000,
    image:
      "https://labellehairbeauty.com.au/wp-content/uploads/2020/05/hairdresser-hair-shampoo-and-hair-wash-768x427.jpg",
  },
  {
    id: 4,
    name: "Trimmer",
    price: 150000,
    image:
      "https://th.bing.com/th/id/OIP.oZvnTEv7Dq5FLNDQ5ncFoQHaHa?w=183&h=183&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3",
  },
  {
    id: 5,
    name: "Semir rambut",
    price: 150000,
    image:
      "https://th.bing.com/th/id/OIP.oZvnTEv7Dq5FLNDQ5ncFoQHaHa?w=183&h=183&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3",
  },
];
const dataPerolehanPartnerPerhari = [
  { name: "John Doe", service: "Haircut", jumlah_hari_ini: 25 },
  { name: "Jane Smith", service: "Shampoo", jumlah_hari_ini: 15 },
  { name: "Alice Johnson", service: "Beard Trim", jumlah_hari_ini: 18 },
  { name: "Bob Brown", service: "Hair Coloring", jumlah_hari_ini: 50 },
];
const dataPerolehanBarangPerhari = [
  { name: "Shampoo", jumlah_hari_ini: 15 },
  { name: "Hair Gel", jumlah_hari_ini: 10 },
  { name: "Hair Spray", jumlah_hari_ini: 5 },
  { name: "Hair Spray", jumlah_hari_ini: 5 },
  { name: "Conditioner", jumlah_hari_ini: 8 },
  { name: "Comb", jumlah_hari_ini: 12 },
];
const dataListPartner = [
  {
    id: "1",
    name: "John Doe",
    image:
      "https://www.shutterstock.com/image-photo/very-skillful-experienced-confident-man-600nw-1484217167.jpg",
  },
  {
    id: "2",
    name: "Jane Smith",
    image:
      "https://st4.depositphotos.com/1441511/20448/i/1600/depositphotos_204485750-stock-photo-male-barber-portrait-men-hair.jpg",
  },
  {
    id: "3",
    name: "Alice Johnson",
    image:
      "https://images.fresha.com/lead-images/placeholders/barbershop-64.jpg?class=venue-gallery-mobile",
  },
];

const page = () => {
  return (
    <div className="min-h-screen px-4">
      <div>
        <div className="flex justify-between">
          <h1 className="text-2xl font-semibold mb-6">Jasa</h1>

          <Link
            href="/dashboard/transactions/history"
            className="underline text-blue-600"
          >
            Riwayat Transaksi
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="flex flex-wrap gap-4 col-span-2 ">
            {ServiceData.map((item) => (
              <Card
                key={item.id}
                className="p-1 h-fit w-60 hover:border hover:border-purple-600"
                id={`transaction-${item.id}`}
              >
                <CardContent className="p-1 pb-0">
                  <div>
                    <Image
                      src={item.image}
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
                  <SelectPartnerForm
                    partnerList={dataListPartner}
                    goodId={item}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
          <ListPartner partner={dataPerolehanPartnerPerhari} />
        </div>
      </div>
      <SectionGoods GoodsData={GoodsData} />
    </div>
  );
};

export default page;
