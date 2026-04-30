import { CandorDmChat } from "@/components/candor/CandorDmChat";

export default async function AlignChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CandorDmChat id={id} />;
}
