import { memo } from "react";

// Subtle animated gradient blobs to enhance depth without hurting readability
export const AnimatedBackground = memo(function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gradient blobs */}
      <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-blue-400/40 to-purple-500/30 blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-emerald-400/30 to-cyan-500/30 blur-3xl animate-pulse [animation-duration:6s]" />
      {/* Soft radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.35),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35),transparent_60%)]" />
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,black_1px,transparent_1px),linear-gradient(to_bottom,black_1px,transparent_1px)] bg-[size:28px_28px] dark:opacity-[0.06]" />
    </div>
  );
});

export default AnimatedBackground;
