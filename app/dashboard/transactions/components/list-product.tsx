import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ListProduct({
  product,
}: {
  product: { name: string; jumlah_hari_ini: number }[];
}) {
  return (
    <div className="w-full col-span-1 border-l px-8">
      <h2 className="text-lg font-semibold mb-4">List Product</h2>
      <div className="space-y-2">
        {product
          .sort((a, b) => b.jumlah_hari_ini - a.jumlah_hari_ini)
          .map((p, index) => (
            <Card
              key={index}
              className="flex items-center justify-between p-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <CardContent className="flex flex-row items-center justify-between w-full p-0">
                <div className="flex flex-col">
                  <span className="font-medium">{p.name}</span>
                  <Badge variant="secondary">Product</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="font-semibold text-2xl">
                    {p.jumlah_hari_ini}
                  </Badge>
                  <Button variant="link" className="text-blue-600">
                    Detail
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
