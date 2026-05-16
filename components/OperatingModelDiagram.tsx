"use client";

import { useState } from "react";
import Link from "next/link";

// ── Stage data ────────────────────────────────────────────────────────────────
const stages = [
  {
    id: "evidence",
    num: "01",
    title: "Evidence",
    subtitle: "Research · Analytics · Evaluation",
    color: "#1B2A4A",
    href: "/what-we-do/evidence",
    details: [
      "Primary research & political economy analysis",
      "Independent evaluation & adaptive MERL",
      "Data quality assurance & research integrity",
    ],
  },
  {
    id: "policy",
    num: "02",
    title: "Policy",
    subtitle: "Advisory · Strategy · Systems",
    color: "#0D7A6E",
    href: "/what-we-do/policy",
    details: [
      "National policy & strategy development",
      "Systems strengthening & institutional advisory",
      "Knowledge translation for decision-makers",
    ],
  },
  {
    id: "delivery",
    num: "03",
    title: "Delivery",
    subtitle: "Design · Implement · Adapt",
    color: "#3B7D23",
    href: "/what-we-do/implementation",
    details: [
      "Policy & systems analysis and development",
      "Programme design & readiness assessment",
      "Embedded advisory & adaptive management",
    ],
  },
] as const;

type StageId = (typeof stages)[number]["id"];

// ── SVG geometry constants ────────────────────────────────────────────────────
// ViewBox: 700 × 420. Three nodes in equilateral triangle (top/bottom-right/bottom-left).
// Node centres: Evidence (350, 68) | Policy (530, 320) | Delivery (170, 320)
// Node rects: 148 × 52, rx=11, centred on each cx/cy

// Connection paths (slightly curved outward from straight lines):
// Evidence → Policy:  from bottom-right of Ev to top of Pol
// Policy → Delivery:  from bottom-left of Pol to bottom-right of Del
// Delivery → Evidence: from top of Del to bottom-left of Ev
const ARC_EV_POL  = "M 422,94 Q 566,188 530,294";
const ARC_POL_DEL = "M 456,342 Q 350,428 244,342";
const ARC_DEL_EV  = "M 170,294 Q 133,188 278,94";

// Label midpoints (t=0.5 of each quadratic bezier)
// B(0.5) = 0.25·P0 + 0.5·Ctrl + 0.25·P1
const LBL_EV_POL  = { x: 521, y: 178 };
const LBL_POL_DEL = { x: 350, y: 385 };
const LBL_DEL_EV  = { x: 179, y: 178 };

// Triangle centroid ≈ (350, 236)
const CENTER = { x: 350, y: 234 };

export default function OperatingModelDiagram() {
  const [activeId, setActiveId] = useState<StageId | null>(null);

  return (
    <div className="w-full">
      {/* ── SVG flywheel ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 overflow-hidden">
        <svg
          viewBox="0 0 700 420"
          className="w-full max-w-[640px] mx-auto block"
          aria-label="Astellic Operating Model — Evidence, Policy, Delivery flywheel"
          role="img"
        >
          <defs>
            {/* Arrowhead markers */}
            {(["ev-pol", "pol-del", "del-ev"] as const).map((id) => (
              <marker
                key={id}
                id={`arrow-${id}`}
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M 0 1 L 7 4 L 0 7 Z" fill="#C9A84C" opacity="0.7" />
              </marker>
            ))}

            {/* Radial glow used on node rects */}
            <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.25" />
            </filter>

            {/* Subtle glow for active node */}
            <filter id="node-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
              <feFlood floodColor="#C9A84C" floodOpacity="0.4" result="colour" />
              <feComposite in="colour" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Triangle fill (very subtle) ────────────────────────────────── */}
          <polygon
            points="350,68 530,320 170,320"
            fill="rgba(201,168,76,0.03)"
            stroke="rgba(201,168,76,0.07)"
            strokeWidth="1"
          />

          {/* ── Arc tracks ─────────────────────────────────────────────────── */}
          <path
            id="path-ev-pol"
            d={ARC_EV_POL}
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1.5"
            strokeOpacity="0.18"
            markerEnd="url(#arrow-ev-pol)"
          />
          <path
            id="path-pol-del"
            d={ARC_POL_DEL}
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1.5"
            strokeOpacity="0.18"
            markerEnd="url(#arrow-pol-del)"
          />
          <path
            id="path-del-ev"
            d={ARC_DEL_EV}
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1.5"
            strokeOpacity="0.18"
            markerEnd="url(#arrow-del-ev)"
          />

          {/* ── Animated particles ─────────────────────────────────────────── */}
          {/* Evidence → Policy  (lead + trail) */}
          <circle r="4" fill="#C9A84C" opacity="0.9">
            <animateMotion dur="4.2s" repeatCount="indefinite" begin="0s">
              <mpath href="#path-ev-pol" />
            </animateMotion>
          </circle>
          <circle r="2.2" fill="#C9A84C" opacity="0.4">
            <animateMotion dur="4.2s" repeatCount="indefinite" begin="0.45s">
              <mpath href="#path-ev-pol" />
            </animateMotion>
          </circle>

          {/* Policy → Delivery */}
          <circle r="4" fill="#C9A84C" opacity="0.9">
            <animateMotion dur="4.2s" repeatCount="indefinite" begin="1.4s">
              <mpath href="#path-pol-del" />
            </animateMotion>
          </circle>
          <circle r="2.2" fill="#C9A84C" opacity="0.4">
            <animateMotion dur="4.2s" repeatCount="indefinite" begin="1.85s">
              <mpath href="#path-pol-del" />
            </animateMotion>
          </circle>

          {/* Delivery → Evidence */}
          <circle r="4" fill="#C9A84C" opacity="0.9">
            <animateMotion dur="4.2s" repeatCount="indefinite" begin="2.8s">
              <mpath href="#path-del-ev" />
            </animateMotion>
          </circle>
          <circle r="2.2" fill="#C9A84C" opacity="0.4">
            <animateMotion dur="4.2s" repeatCount="indefinite" begin="3.25s">
              <mpath href="#path-del-ev" />
            </animateMotion>
          </circle>

          {/* ── Arc direction labels ────────────────────────────────────────── */}
          {[
            { label: "INFORMS",   x: LBL_EV_POL.x,  y: LBL_EV_POL.y  - 11 },
            { label: "SHAPES",    x: LBL_POL_DEL.x, y: LBL_POL_DEL.y + 14 },
            { label: "GENERATES", x: LBL_DEL_EV.x,  y: LBL_DEL_EV.y  - 11 },
          ].map(({ label, x, y }) => (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              fill="#C9A84C"
              fontSize="7"
              fontWeight="700"
              opacity="0.55"
              style={{ fontFamily: "system-ui, sans-serif", letterSpacing: "1.5px", textTransform: "uppercase" }}
            >
              {label}
            </text>
          ))}

          {/* ── Centre loop indicator ──────────────────────────────────────── */}
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r="36"
            fill="rgba(201,168,76,0.05)"
            stroke="rgba(201,168,76,0.2)"
            strokeWidth="1"
            strokeDasharray="4 5"
          />
          <text
            x={CENTER.x}
            y={CENTER.y - 4}
            textAnchor="middle"
            fill="#C9A84C"
            fontSize="15"
            opacity="0.65"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            ↺
          </text>
          <text
            x={CENTER.x}
            y={CENTER.y + 12}
            textAnchor="middle"
            fill="#9CA3AF"
            fontSize="7"
            fontWeight="700"
            style={{ fontFamily: "system-ui, sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}
          >
            THE LOOP
          </text>

          {/* ── Node 01 — Evidence ─────────────────────────────────────────── */}
          <g
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setActiveId("evidence")}
            onMouseLeave={() => setActiveId(null)}
          >
            <rect
              x="276"
              y="42"
              width="148"
              height="52"
              rx="11"
              fill="#1B2A4A"
              style={{
                filter: activeId === "evidence"
                  ? "drop-shadow(0 0 16px rgba(201,168,76,0.5))"
                  : "drop-shadow(0 4px 10px rgba(27,42,74,0.45))",
                transition: "filter 0.25s ease",
              }}
            />
            <text
              x="292"
              y="65"
              fill="#C9A84C"
              fontSize="8"
              fontWeight="800"
              style={{ fontFamily: "system-ui, sans-serif", letterSpacing: "1px" }}
            >
              01
            </text>
            <text
              x="311"
              y="65"
              fill="white"
              fontSize="13"
              fontWeight="700"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Evidence
            </text>
            <text
              x="350"
              y="82"
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="7.5"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Research · Analytics · Evaluation
            </text>
          </g>

          {/* ── Node 02 — Policy ───────────────────────────────────────────── */}
          <g
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setActiveId("policy")}
            onMouseLeave={() => setActiveId(null)}
          >
            <rect
              x="456"
              y="294"
              width="148"
              height="52"
              rx="11"
              fill="#0D7A6E"
              style={{
                filter: activeId === "policy"
                  ? "drop-shadow(0 0 16px rgba(201,168,76,0.5))"
                  : "drop-shadow(0 4px 10px rgba(13,122,110,0.45))",
                transition: "filter 0.25s ease",
              }}
            />
            <text
              x="472"
              y="317"
              fill="#C9A84C"
              fontSize="8"
              fontWeight="800"
              style={{ fontFamily: "system-ui, sans-serif", letterSpacing: "1px" }}
            >
              02
            </text>
            <text
              x="491"
              y="317"
              fill="white"
              fontSize="13"
              fontWeight="700"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Policy
            </text>
            <text
              x="530"
              y="334"
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="7.5"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Advisory · Strategy · Systems
            </text>
          </g>

          {/* ── Node 03 — Delivery ─────────────────────────────────────────── */}
          <g
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setActiveId("delivery")}
            onMouseLeave={() => setActiveId(null)}
          >
            <rect
              x="96"
              y="294"
              width="148"
              height="52"
              rx="11"
              fill="#3B7D23"
              style={{
                filter: activeId === "delivery"
                  ? "drop-shadow(0 0 16px rgba(201,168,76,0.5))"
                  : "drop-shadow(0 4px 10px rgba(59,125,35,0.45))",
                transition: "filter 0.25s ease",
              }}
            />
            <text
              x="112"
              y="317"
              fill="#C9A84C"
              fontSize="8"
              fontWeight="800"
              style={{ fontFamily: "system-ui, sans-serif", letterSpacing: "1px" }}
            >
              03
            </text>
            <text
              x="131"
              y="317"
              fill="white"
              fontSize="13"
              fontWeight="700"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Delivery
            </text>
            <text
              x="170"
              y="334"
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="7.5"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Design · Implement · Adapt
            </text>
          </g>
        </svg>
      </div>

      {/* ── Pillar detail cards ────────────────────────────────────────────── */}
      <div className="mt-5 grid md:grid-cols-3 gap-4">
        {stages.map((stage) => {
          const isActive = activeId === stage.id;
          return (
            <Link
              key={stage.id}
              href={stage.href}
              onMouseEnter={() => setActiveId(stage.id)}
              onMouseLeave={() => setActiveId(null)}
              className="group relative bg-white rounded-xl border overflow-hidden transition-all duration-200"
              style={{
                borderColor: isActive ? stage.color : "rgb(243 244 246)",
                boxShadow: isActive
                  ? `0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px ${stage.color}40`
                  : "0 1px 3px rgba(0,0,0,0.04)",
                transform: isActive ? "translateY(-2px)" : "none",
              }}
            >
              {/* Coloured top bar */}
              <div
                className="h-1 w-full transition-all duration-200"
                style={{
                  backgroundColor: stage.color,
                  opacity: isActive ? 1 : 0.35,
                }}
              />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-bold text-white px-2 py-0.5 rounded"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stage.num}
                  </span>
                  <h3 className="font-bold text-brand-navy text-sm">{stage.title}</h3>
                </div>
                <p
                  className="text-xs font-medium mb-3"
                  style={{ color: stage.color }}
                >
                  {stage.subtitle}
                </p>
                <ul className="space-y-1.5">
                  {stage.details.map((d) => (
                    <li key={d} className="text-xs text-brand-muted flex items-start gap-1.5">
                      <span className="text-brand-gold mt-0.5 shrink-0">·</span>
                      {d}
                    </li>
                  ))}
                </ul>
                <span
                  className="inline-flex items-center gap-1 mt-4 text-xs font-semibold transition-all duration-200 group-hover:gap-2"
                  style={{ color: stage.color }}
                >
                  Explore pillar →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Footnote ──────────────────────────────────────────────────────── */}
      <p className="text-center text-brand-muted text-xs mt-5 italic">
        Evidence feeds policy. Policy shapes delivery. Delivery generates evidence. The cycle deepens.
      </p>
    </div>
  );
}
