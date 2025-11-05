import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getProductById } from "../actions";
import ProductForm from "../components/product-form";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getProductById(Number.parseInt(params.id));

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm product={result.data} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
