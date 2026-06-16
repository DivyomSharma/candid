import { CandidDmChat } from "@/components/candid/CandidDmChat";

export default async function AlignChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CandidDmChat id={id} />;
}
