import { CandidSession } from "@/components/candid/CandidSession";

export default async function CandidSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CandidSession id={id} />;
}
