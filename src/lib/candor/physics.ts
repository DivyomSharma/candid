export const springConfigs = {
  // Apple-inspired smooth spring
  bouncy: { type: "spring", stiffness: 300, damping: 20 },
  smooth: { type: "spring", stiffness: 400, damping: 30 },
  lazy: { type: "spring", stiffness: 200, damping: 40 },
};

export const easings = {
  // Apple custom bezier for native feel
  appleEase: [0.22, 1, 0.36, 1] as const,
  // Standard ease out
  easeOut: [0.25, 0.1, 0.25, 1] as const,
};
