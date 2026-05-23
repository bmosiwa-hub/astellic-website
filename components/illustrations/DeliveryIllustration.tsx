export default function DeliveryIllustration({ className }: { className?: string }) {
  /* Abstract convergent flow — parallel streams merging through staged nodes.
     Evokes: implementation pipelines, adaptive delivery, systematic progress, convergence. */
  return (
    <svg
      viewBox="0 0 1200 520"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="de-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.05)" />
        </pattern>
        <radialGradient id="de-glow-a" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(212,175,55,0.25)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </radialGradient>
        <radialGradient id="de-glow-b" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(212,175,55,0.18)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </radialGradient>
        <radialGradient id="de-glow-c" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <clipPath id="de-clip">
          <rect width="1200" height="520" />
        </clipPath>
      </defs>

      {/* Dot grid */}
      <rect width="1200" height="520" fill="url(#de-dots)" />

      {/* ── Main horizontal backbone rail ── */}
      <line x1="60" y1="260" x2="1160" y2="260"
        stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

      {/* ── Five convergent stream paths (top 2 + mid + bottom 2 → merge) ── */}
      <g fill="none" strokeWidth="1.2">
        {/* Stream 1 — far top */}
        <path d="M 60 80 C 200 80, 280 160, 360 200 S 480 240, 560 260"
          stroke="rgba(255,255,255,0.18)" />
        {/* Stream 2 — near top */}
        <path d="M 60 170 C 180 170, 280 210, 380 230 S 500 255, 560 260"
          stroke="rgba(255,255,255,0.22)" />
        {/* Stream 3 — centre */}
        <path d="M 60 260 L 560 260"
          stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" />
        {/* Stream 4 — near bottom */}
        <path d="M 60 350 C 180 350, 280 310, 380 290 S 500 265, 560 260"
          stroke="rgba(255,255,255,0.22)" />
        {/* Stream 5 — far bottom */}
        <path d="M 60 440 C 200 440, 280 360, 360 320 S 480 280, 560 260"
          stroke="rgba(255,255,255,0.18)" />
      </g>

      {/* ── Post-convergence — single stream that stages forward ── */}
      <path d="M 560 260 L 1160 260"
        stroke="rgba(212,175,55,0.22)" strokeWidth="2" fill="none" />

      {/* Parallel supporting lines after convergence */}
      <g fill="none" strokeWidth="0.8">
        <path d="M 560 260 Q 700 200 840 215 T 1100 230"
          stroke="rgba(255,255,255,0.1)" />
        <path d="M 560 260 Q 700 320 840 305 T 1100 290"
          stroke="rgba(255,255,255,0.1)" />
      </g>

      {/* ── Glow halos ── */}
      <ellipse cx="560"  cy="260" rx="90" ry="90" fill="url(#de-glow-a)" />
      <ellipse cx="800"  cy="260" rx="70" ry="70" fill="url(#de-glow-b)" />
      <ellipse cx="1040" cy="260" rx="80" ry="80" fill="url(#de-glow-b)" />

      {/* ── Stage nodes along the backbone ── */}
      {/* Convergence point */}
      <circle cx="560" cy="260" r="28" fill="rgba(212,175,55,0.08)" />
      <circle cx="560" cy="260" r="18" fill="rgba(212,175,55,0.18)" />
      <circle cx="560" cy="260" r="9"  fill="rgba(212,175,55,0.65)" />

      {/* Stage 2 */}
      <circle cx="800" cy="260" r="18" fill="rgba(212,175,55,0.12)" />
      <circle cx="800" cy="260" r="11" fill="rgba(212,175,55,0.35)" />
      <circle cx="800" cy="260" r="5"  fill="rgba(212,175,55,0.8)" />

      {/* Stage 3 — output */}
      <circle cx="1040" cy="260" r="20" fill="rgba(212,175,55,0.1)" />
      <circle cx="1040" cy="260" r="13" fill="rgba(212,175,55,0.28)" />
      <circle cx="1040" cy="260" r="6"  fill="rgba(212,175,55,0.75)" />

      {/* ── Arrow chevrons on backbone showing direction ── */}
      <g fill="none" stroke="rgba(212,175,55,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="650,250 665,260 650,270" />
        <polyline points="710,250 725,260 710,270" />
        <polyline points="880,250 895,260 880,270" />
        <polyline points="950,250 965,260 950,270" />
        <polyline points="1110,250 1125,260 1110,270" />
      </g>

      {/* ── Input nodes on each stream entry ── */}
      <g fill="rgba(255,255,255,0.4)">
        <circle cx="60" cy="80"  r="5" />
        <circle cx="60" cy="170" r="5" />
        <circle cx="60" cy="260" r="5" />
        <circle cx="60" cy="350" r="5" />
        <circle cx="60" cy="440" r="5" />
      </g>
      {/* Entry accent marks — vertical bar */}
      <line x1="45" y1="60" x2="45" y2="460"
        stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />

      {/* ── Tick grid on backbone ── */}
      <g stroke="rgba(255,255,255,0.15)" strokeWidth="1">
        {[200, 300, 400, 480, 640, 720, 920, 960, 1140].map((x) => (
          <line key={x} x1={x} y1="252" x2={x} y2="268" />
        ))}
      </g>

      {/* ── Output indicator at end ── */}
      <g fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5">
        <line x1="1130" y1="240" x2="1160" y2="260" />
        <line x1="1160" y1="260" x2="1130" y2="280" />
      </g>

      {/* ── Mid-stream adaptive loop — curved feedback arc ── */}
      <path d="M 800 248 C 820 200, 880 200, 900 248"
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 4" />
      <circle cx="900" cy="248" r="3" fill="rgba(255,255,255,0.3)" />

      {/* ── Subtle stage labels — geometric ── */}
      <g fill="rgba(255,255,255,0.08)">
        <rect x="530" y="300" width="60" height="2" rx="1" />
        <rect x="770" y="300" width="60" height="2" rx="1" />
        <rect x="1010" y="300" width="60" height="2" rx="1" />
      </g>

      {/* ── Background hexagonal texture hint (delivery = systematic) ── */}
      <g fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.6" clipPath="url(#de-clip)">
        {/* A few background hexagons scattered */}
        <polygon points="1100,80  1130,97  1130,131  1100,148  1070,131  1070,97" />
        <polygon points="1050,370 1080,387 1080,421 1050,438 1020,421 1020,387" />
        <polygon points="140,380  170,397  170,431  140,448  110,431  110,397" />
        <polygon points="180,50   210,67   210,101  180,118  150,101  150,67" />
      </g>
    </svg>
  );
}
