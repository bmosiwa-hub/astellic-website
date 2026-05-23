export default function PolicyIllustration({ className }: { className?: string }) {
  /* Abstract governance architecture — concentric rings, overlapping systems, flowing arcs.
     Evokes: policy frameworks, institutional layers, strategic translation, systems thinking. */
  return (
    <svg
      viewBox="0 0 1200 520"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="po-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="po-glow-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(212,175,55,0.2)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </radialGradient>
        <radialGradient id="po-glow-left" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="po-glow-right" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(212,175,55,0.12)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </radialGradient>
        <clipPath id="po-clip">
          <rect width="1200" height="520" />
        </clipPath>
      </defs>

      {/* Grid background */}
      <rect width="1200" height="520" fill="url(#po-grid)" />

      {/* ── Large background rings — leftmost system ── */}
      <g clipPath="url(#po-clip)" fill="none">
        <circle cx="200" cy="260" r="240" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx="200" cy="260" r="180" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx="200" cy="260" r="120" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
        <circle cx="200" cy="260" r="68"  stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <circle cx="200" cy="260" r="30"  stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" />
      </g>

      {/* ── Central system — main governance rings ── */}
      <g clipPath="url(#po-clip)" fill="none">
        <circle cx="600" cy="260" r="280" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="600" cy="260" r="210" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx="600" cy="260" r="155" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeDasharray="6 4" />
        <circle cx="600" cy="260" r="100" stroke="rgba(212,175,55,0.2)" strokeWidth="1.5" />
        <circle cx="600" cy="260" r="55"  stroke="rgba(212,175,55,0.35)" strokeWidth="2" />
        <circle cx="600" cy="260" r="22"  stroke="rgba(212,175,55,0.5)" strokeWidth="2" />
      </g>

      {/* ── Right system — policy translation rings ── */}
      <g clipPath="url(#po-clip)" fill="none">
        <circle cx="1020" cy="260" r="260" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle cx="1020" cy="260" r="190" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="3 6" />
        <circle cx="1020" cy="260" r="130" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
        <circle cx="1020" cy="260" r="80"  stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
        <circle cx="1020" cy="260" r="36"  stroke="rgba(212,175,55,0.28)" strokeWidth="1.5" />
      </g>

      {/* ── Glow fills ── */}
      <ellipse cx="200" cy="260" rx="130" ry="130" fill="url(#po-glow-left)" />
      <ellipse cx="600" cy="260" rx="160" ry="160" fill="url(#po-glow-center)" />
      <ellipse cx="1020" cy="260" rx="120" ry="120" fill="url(#po-glow-right)" />

      {/* ── Horizontal connecting arcs ── */}
      <g fill="none" strokeWidth="1">
        {/* Left to center arc */}
        <path d="M 200 190 Q 400 120 600 205" stroke="rgba(212,175,55,0.22)" />
        <path d="M 200 330 Q 400 400 600 315" stroke="rgba(212,175,55,0.18)" />
        {/* Center to right arc */}
        <path d="M 600 205 Q 810 130 1020 190" stroke="rgba(212,175,55,0.2)" />
        <path d="M 600 315 Q 810 390 1020 330" stroke="rgba(212,175,55,0.16)" />
        {/* Faint horizontal mid-line */}
        <path d="M 60 260 L 1160 260" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
        {/* Diagonal policy-translation lines */}
        <line x1="200" y1="192" x2="600" y2="160" stroke="rgba(255,255,255,0.08)" />
        <line x1="200" y1="328" x2="600" y2="360" stroke="rgba(255,255,255,0.08)" />
        <line x1="600" y1="160" x2="1020" y2="192" stroke="rgba(255,255,255,0.06)" />
        <line x1="600" y1="360" x2="1020" y2="328" stroke="rgba(255,255,255,0.06)" />
      </g>

      {/* ── Tick marks on rings — governance reference points ── */}
      <g stroke="rgba(255,255,255,0.25)" strokeWidth="1.5">
        {/* Central ring ticks at cardinal + ordinal */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const r = 100;
          const rad = (deg * Math.PI) / 180;
          const cx = 600, cy = 260;
          const x1 = cx + (r - 8) * Math.cos(rad);
          const y1 = cy + (r - 8) * Math.sin(rad);
          const x2 = cx + (r + 8) * Math.cos(rad);
          const y2 = cy + (r + 8) * Math.sin(rad);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>

      {/* ── Node markers at ring intersections ── */}
      {/* Left system intersection points */}
      <g fill="rgba(255,255,255,0.45)">
        <circle cx="200" cy="140" r="4" />
        <circle cx="200" cy="380" r="4" />
        <circle cx="80"  cy="260" r="3.5" />
        <circle cx="320" cy="260" r="3.5" />
        <circle cx="132" cy="192" r="3" />
        <circle cx="268" cy="192" r="3" />
        <circle cx="132" cy="328" r="3" />
        <circle cx="268" cy="328" r="3" />
      </g>
      {/* Right system */}
      <g fill="rgba(255,255,255,0.35)">
        <circle cx="1020" cy="130" r="4" />
        <circle cx="1020" cy="390" r="4" />
        <circle cx="840"  cy="260" r="3.5" />
        <circle cx="1200" cy="260" r="3.5" />
      </g>

      {/* ── Central hub nodes — gold ── */}
      <circle cx="600" cy="260" r="22" fill="rgba(212,175,55,0.08)" />
      <circle cx="600" cy="260" r="14" fill="rgba(212,175,55,0.2)" />
      <circle cx="600" cy="260" r="7"  fill="rgba(212,175,55,0.7)" />

      {/* Left hub */}
      <circle cx="200" cy="260" r="10" fill="rgba(212,175,55,0.15)" />
      <circle cx="200" cy="260" r="5"  fill="rgba(212,175,55,0.5)" />

      {/* Right hub */}
      <circle cx="1020" cy="260" r="10" fill="rgba(212,175,55,0.15)" />
      <circle cx="1020" cy="260"  r="5" fill="rgba(212,175,55,0.45)" />

      {/* ── Diagonal cross-hairs inside central ring ── */}
      <g stroke="rgba(212,175,55,0.12)" strokeWidth="0.7" fill="none">
        <line x1="545" y1="205" x2="655" y2="315" />
        <line x1="655" y1="205" x2="545" y2="315" />
        <line x1="600" y1="160" x2="600" y2="360" />
        <line x1="500" y1="260" x2="700" y2="260" />
      </g>
    </svg>
  );
}
