import ViewWasteMaterial from "@/components/system-config/ViewWasteMaterial";

export default function ViewEmissionFactorPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div>
      <ViewWasteMaterial materialId={parseInt(params.id)} />
    </div>
  );
}