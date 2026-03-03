import EditWasteMaterial from "@/components/system-config/EditWasteMaterial";

export default function EditEmissionFactorPage({
  params
}: {
  params: { id: string }
}) {
  return (
    <div>
      <EditWasteMaterial materialId={parseInt(params.id)} />
    </div>
  );
}