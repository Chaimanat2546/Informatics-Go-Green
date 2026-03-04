import ViewWasteMaterial from "@/components/system-config/ViewWasteMaterial";

export default async function ViewEmissionFactorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <ViewWasteMaterial materialId={parseInt(id)} />
    </div>
  );
}