const steps = [
  {
    num: "1",
    title: "Generate Evidence",
    description:
      "Policy-relevant research, data analysis, and political economy insight grounded in context.",
  },
  {
    num: "2",
    title: "Translate Evidence into Policy & Strategy",
    description:
      "Actionable policy frameworks, strategies, and guidelines that are technically credible and politically feasible.",
  },
  {
    num: "3",
    title: "Design Programmes",
    description:
      "Implementation-ready interventions with clear theories of change, robust results frameworks, and operational models.",
  },
  {
    num: "4",
    title: "Implement & Adapt",
    description:
      "Hands-on delivery combined with adaptive management; maintaining responsiveness to evolving contexts and institutional dynamics.",
  },
  {
    num: "5",
    title: "Measure & Learn",
    description:
      "Monitoring, evaluation, and learning systems that inform real-time decision-making and improve performance.",
  },
  {
    num: "6",
    title: "Strengthen Systems & Capacity",
    description:
      "Cross-cutting investments in institutional systems, data infrastructure, and human capability that determine long-term sustainability.",
  },
];

export default function Delivery() {
  return (
    <section
      id="delivery"
      style={{
        padding: "140px 48px",
        background: "#041232",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative arc */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "-300px",
          transform: "translateY(-50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          border: "1px solid rgba(11,118,160,0.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "-200px",
          transform: "translateY(-50%)",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          border: "1px solid rgba(11,118,160,0.12)",
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ marginBottom: "80px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div style={{ width: "30px", height: "1px", background: "#FFC000" }} />
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#FFC000",
              }}
            >
              05 — Value Delivery System
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "60px",
              alignItems: "end",
            }}
            className="delivery-header"
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2.4rem, 4vw, 4rem)",
                fontWeight: 400,
                lineHeight: 1.15,
                color: "white",
                letterSpacing: "-0.01em",
              }}
            >
              From Evidence{" "}
              <em style={{ color: "#FFC000", fontStyle: "italic" }}>
                to Impact
              </em>
            </h2>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.9rem",
                fontWeight: 300,
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              A structured, end-to-end delivery model ensuring policy priorities
              are translated into effective and sustainable outcomes. Each stage
              reinforces the others, with system strengthening running as a
              continuous thread throughout.
            </p>
          </div>
        </div>

        {/* Steps grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2px",
          }}
          className="steps-grid"
        >
          {steps.map((step, i) => (
            <div
              key={step.num}
              style={{
                padding: "48px 40px",
                background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(11,118,160,0.06)",
                borderTop: `1px solid ${i % 2 === 0 ? "rgba(255,255,255,0.06)" : "rgba(11,118,160,0.15)"}`,
                transition: "background 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Step number accent */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  right: "-10px",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "6rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.03)",
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                {step.num}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(255,192,0,0.15)",
                    border: "1px solid rgba(255,192,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.65rem",
                    color: "#FFC000",
                    flexShrink: 0,
                  }}
                >
                  {step.num}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background:
                      "linear-gradient(to right, rgba(255,192,0,0.3), transparent)",
                  }}
                />
              </div>

              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: "white",
                  marginBottom: "16px",
                  position: "relative",
                }}
              >
                {step.title}
              </h3>

              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 300,
                  lineHeight: 1.85,
                  color: "rgba(255,255,255,0.5)",
                  position: "relative",
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* System strengthening callout */}
        <div
          style={{
            marginTop: "2px",
            padding: "40px 48px",
            background: "rgba(255,192,0,0.07)",
            borderLeft: "3px solid #FFC000",
            display: "flex",
            alignItems: "center",
            gap: "32px",
          }}
          className="callout-flex"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="16" cy="16" r="15" stroke="#FFC000" strokeWidth="1" strokeOpacity="0.5" />
            <path d="M10 16h12M16 10v12" stroke="#FFC000" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.1rem",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            System strengthening runs as a{" "}
            <strong style={{ color: "#FFC000", fontStyle: "normal", fontWeight: 500 }}>
              continuous thread
            </strong>{" "}
            throughout all stages — ensuring every intervention builds lasting
            institutional capability.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .delivery-header { grid-template-columns: 1fr !important; gap: 24px !important; }
          section { padding: 80px 24px !important; }
          .callout-flex { flex-direction: column !important; }
        }
      `}</style>
    </section>
  );
}
