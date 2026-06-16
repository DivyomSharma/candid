import { humanizeCandidText } from "@/lib/candid/humanizer";
import { sanitizeCandidReply } from "@/lib/candid/fallback";
import type { CandidSocialMove, CandidSocialState } from "@/lib/candid/types";

export function shapeCandidResponse(
  content: string,
  context?: {
    socialMove?: CandidSocialMove;
    socialState?: CandidSocialState;
    previousReplies?: string[];
  },
) {
  const shaped = humanizeCandidText({
    content: sanitizeCandidReply(content),
    socialMove: context?.socialMove,
    socialState: context?.socialState,
    previousReplies: context?.previousReplies,
  });

  return sanitizeCandidReply(shaped);
}
