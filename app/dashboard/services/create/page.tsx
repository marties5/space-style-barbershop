import { ServiceForm } from "../components/ServiceForm";

// app/services/create/page.tsx
export async function CreateServicePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tambah Service Baru</h1>
        <p className="text-muted-foreground">
          Tambahkan service baru ke dalam sistem
        </p>
      </div>
      <ServiceForm />
    </div>
  );
}