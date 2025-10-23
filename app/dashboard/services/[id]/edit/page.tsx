import { getServiceById } from "../../actions";
import { ServiceForm } from "../../components/ServiceForm";

export default async function EditServicePage({
  params,
}: {
  params: { id: string };
}) {
  const service = await getServiceById(parseInt(params.id));

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Service tidak ditemukan
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Service</h1>
        <p className="text-muted-foreground">Update informasi service</p>
      </div>
      <ServiceForm initialData={service} isEditing />
    </div>
  );
}
