import { notFound } from "next/navigation";
import { ProfileSurface } from "@/components/candor/ProfileSurface";
import { getPublicProfileByHandle } from "@/lib/candor/public-profile";

export default async function PublicCandorProfilePage({
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
      subheading="candor's public read. soft enough to share, specific enough to feel real."
      showBottomNav={false}
      publicMode
    />
  );
}
