import EditWasteMaterial from "@/components/system-config/EditWasteMaterial";

export default async function EditEmissionFactorPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  return (
    <div>
      <EditWasteMaterial materialId={parseInt(id)} />
    </div>
  );
}