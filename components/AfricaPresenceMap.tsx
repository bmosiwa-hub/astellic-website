"use client";

interface Country {
  name: string;
  x: number;
  y: number;
  primary?: boolean;
}

const countries: Country[] = [
  { name: "Malawi",       x: 308, y: 347, primary: true  },
  { name: "Kenya",        x: 326, y: 259                  },
  { name: "Nigeria",      x: 186, y: 198                  },
  { name: "Zambia",       x: 276, y: 346                  },
  { name: "Ethiopia",     x: 338, y: 198                  },
  { name: "South Africa", x: 249, y: 439                  },
  { name: "Zimbabwe",     x: 287, y: 392                  },
  { name: "Botswana",     x: 263, y: 407                  },
  { name: "Tanzania",     x: 312, y: 301                  },
];

// Simplified Africa outline — viewBox 0 0 460 520
const AFRICA_PATH =
  "M 198 22 L 238 12 L 288 18 L 333 38 L 363 73 L 378 113 L 388 163 L 393 213 L 383 263 L 363 303 L 338 338 L 318 373 L 298 403 L 278 430 L 255 458 L 233 478 L 215 490 L 198 492 L 180 485 L 162 468 L 145 442 L 128 410 L 112 373 L 97 332 L 83 290 L 70 248 L 60 210 L 58 168 L 66 128 L 82 96 L 104 68 L 132 46 L 162 30 Z";

interface Props {
  /** dark = map on dark bg (navy dots/labels), light = map on light bg */
  theme?: "dark" | "light";
  className?: string;
}

export default function AfricaPresenceMap({ theme = "dark", className = "" }: Props) {
  const fillColor   = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(15,28,64,0.06)";
  const strokeColor = theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(15,28,64,0.15)";
  const labelColor  = theme === "dark" ? "#e5e7eb"               : "#374151";
  const dotColor    = theme === "dark" ? "#5eadb5"               : "#1a3a5c"; // brand-teal / brand-navy

  return (
    <div className={`relative select-none ${className}`}>
      <svg
        viewBox="0 0 460 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Map of Africa showing Astellic's geographic presence"
        className="w-full h-auto max-w-sm"
      >
        <defs>
          {/* Pulse animation keyframes via CSS filter */}
          <style>{`
            @keyframes mapPulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50%       { opacity: 0.5; transform: scale(2.2); }
            }
            @keyframes mapPulseGold {
              0%, 100% { opacity: 0.8; transform: scale(1); }
              50%       { opacity: 0.3; transform: scale(2.8); }
            }
            .dot-pulse {
              transform-origin: center;
              transform-box: fill-box;
              animation: mapPulse 2.4s ease-in-out infinite;
            }
            .dot-pulse-gold {
              transform-origin: center;
              transform-box: fill-box;
              animation: mapPulseGold 2s ease-in-out infinite;
            }
          `}</style>
        </defs>

        {/* Africa outline */}
        <path
          d={AFRICA_PATH}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Country markers */}
        {countries.map((c) =>
          c.primary ? (
            /* Primary — Malawi: gold, larger, longer label */
            <g key={c.name}>
              {/* Pulse ring */}
              <circle cx={c.x} cy={c.y} r="10" fill="#D4AF37" className="dot-pulse-gold" opacity="0.4" />
              {/* Core dot */}
              <circle cx={c.x} cy={c.y} r="5" fill="#D4AF37" />
              <circle cx={c.x} cy={c.y} r="3" fill="#fff" opacity="0.6" />
              {/* Label */}
              <text
                x={c.x + 10}
                y={c.y + 4}
                fontSize="10"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
                fill="#D4AF37"
                letterSpacing="0.04em"
              >
                {c.name.toUpperCase()}
              </text>
              <text
                x={c.x + 10}
                y={c.y + 15}
                fontSize="8"
                fontFamily="system-ui, sans-serif"
                fill="#D4AF37"
                opacity="0.7"
              >
                HQ
              </text>
            </g>
          ) : (
            /* Secondary countries: teal/navy dots */
            <g key={c.name}>
              <circle cx={c.x} cy={c.y} r="7" fill={dotColor} className="dot-pulse" opacity="0.25" />
              <circle cx={c.x} cy={c.y} r="3.5" fill={dotColor} />
              <circle cx={c.x} cy={c.y} r="1.5" fill="#fff" opacity="0.5" />
              {/* Label — position smartly to avoid overlap */}
              <text
                x={c.x + (c.name === "Nigeria" ? -8 : 8)}
                y={c.y + 4}
                fontSize="8.5"
                fontWeight="600"
                fontFamily="system-ui, sans-serif"
                fill={labelColor}
                textAnchor={c.name === "Nigeria" ? "end" : "start"}
                opacity="0.85"
              >
                {c.name}
              </text>
            </g>
          )
        )}

        {/* Subtle grid lines (parallels/meridians feel) */}
        {[160, 220, 280, 340, 400].map((y) => (
          <line key={`h${y}`} x1="50" y1={y} x2="410" y2={y} stroke={strokeColor} strokeWidth="0.4" strokeDasharray="3 6" />
        ))}
        {[150, 220, 290, 360].map((x) => (
          <line key={`v${x}`} x1={x} y1="10" x2={x} y2="510" stroke={strokeColor} strokeWidth="0.4" strokeDasharray="3 6" />
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-brand-gold shrink-0" />
          <span className={`text-xs font-semibold ${theme === "dark" ? "text-gray-300" : "text-brand-navy"}`}>
            Headquarters — Lilongwe, Malawi
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-brand-teal shrink-0" />
          <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-brand-muted"}`}>
            Active engagement countries
          </span>
        </div>
      </div>
    </div>
  );
}
