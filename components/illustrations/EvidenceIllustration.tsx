export default function EvidenceIllustration({ className }: { className?: string }) {
  /* Abstract network graph — scattered data nodes connected by intelligence threads.
     Evokes: research, data relationships, analytical depth, evidence constellations. */
  return (
    <svg
      viewBox="0 0 1200 520"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* Subtle dot-grid background */}
        <pattern id="ev-dots" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.06)" />
        </pattern>
        {/* Gold glow for hub nodes */}
        <radialGradient id="ev-glow-a" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ev-glow-b" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ev-glow-c" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0D7A6E" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0D7A6E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Dot grid */}
      <rect width="1200" height="520" fill="url(#ev-dots)" />

      {/* ── Connection lines ── */}
      <g strokeWidth="0.8" fill="none">
        {/* Primary network threads — gold */}
        <g stroke="rgba(212,175,55,0.28)">
          <line x1="310" y1="195" x2="540" y2="130" />
          <line x1="540" y1="130" x2="720" y2="210" />
          <line x1="720" y1="210" x2="940" y2="155" />
          <line x1="310" y1="195" x2="480" y2="310" />
          <line x1="480" y1="310" x2="720" y2="210" />
          <line x1="720" y1="210" x2="870" y2="330" />
          <line x1="940" y1="155" x2="1060" y2="255" />
          <line x1="1060" y1="255" x2="870" y2="330" />
          <line x1="540" y1="130" x2="660" y2="68" />
          <line x1="720" y1="210" x2="660" y2="68" />
        </g>
        {/* Secondary threads — white */}
        <g stroke="rgba(255,255,255,0.15)">
          <line x1="90" y1="150" x2="310" y2="195" />
          <line x1="90" y1="150" x2="200" y2="80" />
          <line x1="200" y1="80" x2="380" y2="68" />
          <line x1="380" y1="68" x2="540" y2="130" />
          <line x1="90" y1="150" x2="155" y2="290" />
          <line x1="155" y1="290" x2="310" y2="195" />
          <line x1="155" y1="290" x2="240" y2="400" />
          <line x1="240" y1="400" x2="480" y2="310" />
          <line x1="480" y1="310" x2="390" y2="440" />
          <line x1="870" y1="330" x2="960" y2="440" />
          <line x1="960" y1="440" x2="1060" y2="255" />
          <line x1="1060" y1="255" x2="1140" y2="160" />
          <line x1="940" y1="155" x2="1140" y2="160" />
          <line x1="1060" y1="255" x2="1120" y2="380" />
          <line x1="660" y1="68" x2="800" y2="50" />
          <line x1="800" y1="50" x2="940" y2="155" />
          <line x1="540" y1="130" x2="480" y2="60" />
          <line x1="480" y1="60" x2="380" y2="68" />
          <line x1="720" y1="210" x2="760" y2="320" />
          <line x1="760" y1="320" x2="870" y2="330" />
          <line x1="760" y1="320" x2="720" y2="420" />
          <line x1="720" y1="420" x2="580" y2="430" />
          <line x1="580" y1="430" x2="480" y2="310" />
        </g>
        {/* Faint long-range connections */}
        <g stroke="rgba(255,255,255,0.07)">
          <line x1="90" y1="150" x2="720" y2="210" />
          <line x1="310" y1="195" x2="870" y2="330" />
          <line x1="200" y1="80" x2="940" y2="155" />
          <line x1="240" y1="400" x2="960" y2="440" />
          <line x1="390" y1="440" x2="1120" y2="380" />
        </g>
      </g>

      {/* ── Glow halos around hub nodes ── */}
      <ellipse cx="310" cy="195" rx="80" ry="80" fill="url(#ev-glow-a)" />
      <ellipse cx="720" cy="210" rx="100" ry="100" fill="url(#ev-glow-a)" />
      <ellipse cx="940" cy="155" rx="70" ry="70" fill="url(#ev-glow-b)" />
      <ellipse cx="480" cy="310" rx="60" ry="60" fill="url(#ev-glow-c)" />

      {/* ── Small scattered nodes — white ── */}
      <g fill="rgba(255,255,255,0.35)">
        <circle cx="90"  cy="150" r="4" />
        <circle cx="200" cy="80"  r="3.5" />
        <circle cx="380" cy="68"  r="3" />
        <circle cx="155" cy="290" r="4" />
        <circle cx="240" cy="400" r="3.5" />
        <circle cx="390" cy="440" r="3" />
        <circle cx="480" cy="60"  r="3" />
        <circle cx="660" cy="68"  r="4" />
        <circle cx="800" cy="50"  r="3" />
        <circle cx="760" cy="320" r="4" />
        <circle cx="720" cy="420" r="3.5" />
        <circle cx="580" cy="430" r="3" />
        <circle cx="870" cy="330" r="5" />
        <circle cx="1060" cy="255" r="4.5" />
        <circle cx="960" cy="440" r="3.5" />
        <circle cx="1120" cy="380" r="3" />
        <circle cx="1140" cy="160" r="3.5" />
        <circle cx="50"  cy="280" r="2.5" />
        <circle cx="130" cy="440" r="2.5" />
        <circle cx="320" cy="350" r="2.5" />
        <circle cx="610" cy="300" r="2.5" />
        <circle cx="1000" cy="380" r="2.5" />
        <circle cx="1080" cy="460" r="2.5" />
      </g>

      {/* ── Medium accent nodes — teal ── */}
      <g fill="rgba(13,122,110,0.65)">
        <circle cx="540" cy="130" r="7" />
        <circle cx="480" cy="310" r="6" />
        <circle cx="1060" cy="255" r="5.5" />
      </g>

      {/* ── Hub nodes — gold ── */}
      <g>
        {/* Hub A */}
        <circle cx="310" cy="195" r="12" fill="rgba(212,175,55,0.15)" />
        <circle cx="310" cy="195" r="8" fill="rgba(212,175,55,0.5)" />
        <circle cx="310" cy="195" r="4" fill="#D4AF37" />
        {/* Hub B — main */}
        <circle cx="720" cy="210" r="16" fill="rgba(212,175,55,0.12)" />
        <circle cx="720" cy="210" r="10" fill="rgba(212,175,55,0.45)" />
        <circle cx="720" cy="210" r="5" fill="#D4AF37" />
        {/* Hub C */}
        <circle cx="940" cy="155" r="11" fill="rgba(212,175,55,0.15)" />
        <circle cx="940" cy="155" r="7" fill="rgba(212,175,55,0.45)" />
        <circle cx="940" cy="155" r="3.5" fill="#D4AF37" />
      </g>

      {/* Orbit ring around main hub */}
      <circle cx="720" cy="210" r="32" fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1" strokeDasharray="3 5" />
      <circle cx="720" cy="210" r="54" fill="none" stroke="rgba(212,175,55,0.07)" strokeWidth="0.8" strokeDasharray="2 8" />
    </svg>
  );
}
