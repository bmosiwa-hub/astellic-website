"use client";

/**
 * Animated Evidence → Policy → Delivery → Learning → Systems Strengthening cycle.
 * Uses CSS keyframe animations via inline styles — no external dependencies.
 */

const nodes = [
  { label: "Evidence",               color: "#1B2A4A", textColor: "#fff" },
  { label: "Policy",                 color: "#0D7A6E", textColor: "#fff" },
  { label: "Delivery",               color: "#3B7D23", textColor: "#fff" },
  { label: "Learning",               color: "#C9A84C", textColor: "#fff" },
  { label: "Systems\nStrengthening", color: "#1B2A4A", textColor: "#fff" },
];

export default function DeliveryFlowDiagram() {
  return (
    <div className="w-full overflow-x-auto py-4">
      {/* Desktop: horizontal row */}
      <div className="hidden md:flex items-center justify-center gap-0 min-w-max mx-auto">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex items-center">
            {/* Node */}
            <div
              className="flex flex-col items-center justify-center rounded-2xl px-5 py-4 text-center font-semibold text-sm leading-tight shadow-md"
              style={{
                backgroundColor: node.color,
                color: node.textColor,
                minWidth: "110px",
                animation: `fadeSlideUp 0.5s ease both`,
                animationDelay: `${i * 0.15}s`,
                whiteSpace: "pre-line",
              }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60"
                style={{ color: node.textColor }}
              >
                0{i + 1}
              </span>
              {node.label}
            </div>

            {/* Arrow */}
            {i < nodes.length - 1 && (
              <div
                className="flex items-center mx-1"
                style={{
                  animation: `fadeIn 0.3s ease both`,
                  animationDelay: `${i * 0.15 + 0.4}s`,
                  opacity: 0,
                }}
              >
                <div className="w-6 h-px bg-brand-gold/60" />
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                  <path d="M1 1l6 5-6 5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* Feedback loop arrow back to start */}
        <div
          style={{
            animation: `fadeIn 0.5s ease both`,
            animationDelay: `${nodes.length * 0.15 + 0.3}s`,
            opacity: 0,
          }}
          className="ml-2"
        >
          <span className="text-brand-gold/70 text-xs font-medium tracking-widest">↺</span>
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex md:hidden flex-col items-center gap-2 w-full">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex flex-col items-center">
            <div
              className="rounded-xl px-6 py-3 text-center font-semibold text-sm shadow"
              style={{ backgroundColor: node.color, color: node.textColor, minWidth: "180px" }}
            >
              {node.label.replace("\n", " ")}
            </div>
            {i < nodes.length - 1 && (
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none" className="my-1">
                <path d="M6 1v14M1 10l5 8 5-8" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
        <span className="text-brand-gold/70 text-xs font-medium mt-1">↺ continuous cycle</span>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
