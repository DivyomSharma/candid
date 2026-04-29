import { CandorSession } from "@/components/candor/CandorSession";

export default async function CandorSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CandorSession id={id} />;
}
