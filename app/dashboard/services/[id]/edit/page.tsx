import { getServiceById } from "../../actions";
import { ServiceForm } from "../../components/ServiceForm";
import { notFound } from "next/navigation";

export default async function EditServicePage({
  params,
}: {
  params: { id: string };
}) {
  const service = await getServiceById(Number(params.id));

  if (!service) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <ServiceForm initialData={service} isEditing />
    </div>
  );
}
