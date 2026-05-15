import { humanizeCandorText } from "@/lib/candor/humanizer";
import type { CandorSocialMove, CandorSocialState } from "@/lib/candor/types";

export function shapeCandorResponse(
  content: string,
  context?: {
    socialMove?: CandorSocialMove;
    socialState?: CandorSocialState;
    previousReplies?: string[];
  },
) {
  return humanizeCandorText({
    content,
    socialMove: context?.socialMove,
    socialState: context?.socialState,
    previousReplies: context?.previousReplies,
  });
}
