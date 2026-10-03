// ── Astellic operating model — the "loop" ──────────────────────────────────
// A static flywheel: Evidence → Policy → Delivery, feeding back on itself.
// Node and label fonts are sized large so the loop stays legible on mobile.
// (The repetitive pillar cards that used to sit under the loop were removed;
//  the three specialties are navigable from the "What We Do" menu.)

const ARC_EV_POL = "M 422,94 Q 566,188 530,294";
const ARC_POL_DEL = "M 456,342 Q 350,428 244,342";
const ARC_DEL_EV = "M 170,294 Q 133,188 278,94";

const LBL_EV_POL = { x: 521, y: 178 };
const LBL_POL_DEL = { x: 350, y: 392 };
const LBL_DEL_EV = { x: 179, y: 178 };

const CENTER = { x: 350, y: 234 };

const FONT = "system-ui, sans-serif";

const nodes = [
  { id: "evidence", num: "01", title: "Evidence", subtitle: "Research · Analytics · Evaluation", color: "#1B2A4A", cx: 350, cy: 68 },
  { id: "policy", num: "02", title: "Policy", subtitle: "Advisory · Strategy · Systems", color: "#0D7A6E", cx: 530, cy: 320 },
  { id: "delivery", num: "03", title: "Delivery", subtitle: "Design · Implement · Adapt", color: "#3B7D23", cx: 170, cy: 320 },
] as const;

const NODE_W = 210;
const NODE_H = 72;

export default function OperatingModelDiagram() {
  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 overflow-hidden">
        <svg
          viewBox="0 0 700 420"
          className="w-full max-w-[720px] mx-auto block"
          aria-label="Astellic Operating Model — Evidence, Policy, Delivery flywheel"
          role="img"
        >
          <defs>
            {(["ev-pol", "pol-del", "del-ev"] as const).map((id) => (
              <marker key={id} id={`arrow-${id}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 1 L 7 4 L 0 7 Z" fill="#C9A84C" opacity="0.7" />
              </marker>
            ))}
          </defs>

          {/* Triangle fill */}
          <polygon points="350,68 530,320 170,320" fill="rgba(201,168,76,0.03)" stroke="rgba(201,168,76,0.07)" strokeWidth="1" />

          {/* Arc tracks */}
          <path id="path-ev-pol" d={ARC_EV_POL} fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeOpacity="0.18" markerEnd="url(#arrow-ev-pol)" />
          <path id="path-pol-del" d={ARC_POL_DEL} fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeOpacity="0.18" markerEnd="url(#arrow-pol-del)" />
          <path id="path-del-ev" d={ARC_DEL_EV} fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeOpacity="0.18" markerEnd="url(#arrow-del-ev)" />

          {/* Animated particles */}
          <circle r="4" fill="#C9A84C" opacity="0.9"><animateMotion dur="4.2s" repeatCount="indefinite" begin="0s"><mpath href="#path-ev-pol" /></animateMotion></circle>
          <circle r="4" fill="#C9A84C" opacity="0.9"><animateMotion dur="4.2s" repeatCount="indefinite" begin="1.4s"><mpath href="#path-pol-del" /></animateMotion></circle>
          <circle r="4" fill="#C9A84C" opacity="0.9"><animateMotion dur="4.2s" repeatCount="indefinite" begin="2.8s"><mpath href="#path-del-ev" /></animateMotion></circle>

          {/* Arc direction labels — enlarged */}
          {[
            { label: "INFORMS", x: LBL_EV_POL.x, y: LBL_EV_POL.y - 11 },
            { label: "SHAPES", x: LBL_POL_DEL.x, y: LBL_POL_DEL.y + 16 },
            { label: "GENERATES", x: LBL_DEL_EV.x, y: LBL_DEL_EV.y - 11 },
          ].map(({ label, x, y }) => (
            <text key={label} x={x} y={y} textAnchor="middle" fill="#C9A84C" fontSize="15" fontWeight="700" opacity="0.6"
              style={{ fontFamily: FONT, letterSpacing: "2px", textTransform: "uppercase" }}>
              {label}
            </text>
          ))}

          {/* Centre loop indicator — enlarged */}
          <circle cx={CENTER.x} cy={CENTER.y} r="46" fill="rgba(201,168,76,0.05)" stroke="rgba(201,168,76,0.2)" strokeWidth="1" strokeDasharray="4 5" />
          <text x={CENTER.x} y={CENTER.y - 4} textAnchor="middle" fill="#C9A84C" fontSize="30" opacity="0.7" style={{ fontFamily: FONT }}>↺</text>
          <text x={CENTER.x} y={CENTER.y + 20} textAnchor="middle" fill="#9CA3AF" fontSize="13" fontWeight="700"
            style={{ fontFamily: FONT, letterSpacing: "2.5px", textTransform: "uppercase" }}>
            THE LOOP
          </text>

          {/* Nodes — enlarged text, centred */}
          {nodes.map((n) => (
            <g key={n.id}>
              <rect
                x={n.cx - NODE_W / 2}
                y={n.cy - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx="12"
                fill={n.color}
                style={{ filter: `drop-shadow(0 4px 10px ${n.color}73)` }}
              />
              <text x={n.cx} y={n.cy - 13} textAnchor="middle" fill="#C9A84C" fontSize="20" fontWeight="800"
                style={{ fontFamily: FONT, letterSpacing: "1px" }}>
                {n.num}
              </text>
              <text x={n.cx} y={n.cy + 11} textAnchor="middle" fill="white" fontSize="26" fontWeight="700" style={{ fontFamily: FONT }}>
                {n.title}
              </text>
              <text x={n.cx} y={n.cy + 29} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="13" style={{ fontFamily: FONT }}>
                {n.subtitle}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className="text-center text-brand-muted text-sm mt-5 italic">
        Evidence feeds policy. Policy shapes delivery. Delivery generates evidence. The cycle deepens.
      </p>
    </div>
  );
}
