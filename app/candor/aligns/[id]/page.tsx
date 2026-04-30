import { CandorAlignProfile } from "@/components/candor/CandorAlignProfile";

export default async function AlignProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CandorAlignProfile id={id} />;
}
