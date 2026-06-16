import { CandidAlignProfile } from "@/components/candid/CandidAlignProfile";

export default async function AlignProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CandidAlignProfile id={id} />;
}
