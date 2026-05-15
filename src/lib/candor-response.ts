import { humanizeCandorText } from "@/lib/candor/humanizer";
import { sanitizeCandorReply } from "@/lib/candor/fallback";
import type { CandorSocialMove, CandorSocialState } from "@/lib/candor/types";

export function shapeCandorResponse(
  content: string,
  context?: {
    socialMove?: CandorSocialMove;
    socialState?: CandorSocialState;
    previousReplies?: string[];
  },
) {
  const shaped = humanizeCandorText({
    content: sanitizeCandorReply(content),
    socialMove: context?.socialMove,
    socialState: context?.socialState,
    previousReplies: context?.previousReplies,
  });

  return sanitizeCandorReply(shaped);
}
