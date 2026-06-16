import { notFound } from "next/navigation";
import { ProfileSurface } from "@/components/candid/ProfileSurface";
import { getPublicProfileByHandle } from "@/lib/candid/public-profile";

export default async function PublicCandidProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getPublicProfileByHandle(handle);

  if (!profile) {
    notFound();
  }

  return (
    <ProfileSurface
      profile={profile}
      heading={profile.username}
      subheading="candid's public read. soft enough to share, specific enough to feel real."
      showBottomNav={false}
      publicMode
    />
  );
}
