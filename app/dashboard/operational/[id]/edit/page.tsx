import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { OperationalForm } from "../../components/operational-form";

async function getOperational(id: number) {
  const operation = await prisma.operasional.findUnique({
    where: { id },
  });

  if (!operation) {
    notFound();
  }

  return operation;
}

export default async function EditOperationalPage({
  params,
}: {
  params: { id: string };
}) {
  const operation = await getOperational(Number.parseInt(params.id));

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Edit Catatan Operasional
            </h1>
            <p className="text-muted-foreground">
              Perbarui informasi catatan operasional
            </p>
          </div>

          <OperationalForm operation={operation} />
        </div>
      </main>
    </div>
  );
}
