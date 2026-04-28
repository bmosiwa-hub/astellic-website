const pillars = [
  {
    roman: "I",
    title: "Bridging Policy and Implementation",
    body: "We design policy with implementation in mind and deliver programmes anchored in strategic intent.",
    accent: "#FFC000",
  },
  {
    roman: "II",
    title: "Integrated, End-to-End Delivery",
    body: "We provide coherent support across the full results chain, eliminating fragmentation and coordination gaps.",
    accent: "#0B76A0",
  },
  {
    roman: "III",
    title: "Adaptive & Systems-Oriented",
    body: "We apply learning-driven delivery that strengthens systems while responding to real-world complexity.",
    accent: "#3B7D23",
  },
  {
    roman: "IV",
    title: "Context-Driven & Politically Informed",
    body: "Our work is grounded in institutional realities, power dynamics, and incentive structures that shape what is feasible.",
    accent: "#CC9B00",
  },
];

const positioning = [
  { label: "Sector", value: "Research, Advisory & Implementation" },
  { label: "Geography", value: "Africa-Focused" },
  { label: "Clients", value: "Donors, Governments, Institutions" },
  { label: "Approach", value: "Evidence · Policy · Delivery" },
  { label: "Est.", value: "Malawi / Pan-African" },
];

export default function ValueProp() {
  return (
    <section
      id="value"
      style={{
        padding: "140px 48px",
        background: "#F9F1DC",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "80px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div style={{ width: "30px", height: "1px", background: "#CC9B00" }} />
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#CC9B00",
              }}
            >
              06 — Value Proposition
            </span>
            <div style={{ width: "30px", height: "1px", background: "#CC9B00" }} />
          </div>

          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2.4rem, 4vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "#041232",
              letterSpacing: "-0.01em",
              marginBottom: "24px",
            }}
          >
            What Makes Astellic Different
          </h2>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.2rem",
              fontStyle: "italic",
              fontWeight: 300,
              lineHeight: 1.7,
              color: "rgba(4,18,50,0.7)",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            The analytical depth of a policy research firm, the practical rigour
            of an implementation partner, and the contextual intelligence of an
            organisation that understands how African systems actually work.
          </p>
        </div>

        {/* Four pillars */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "2px",
            marginBottom: "60px",
          }}
          className="pillars-grid"
        >
          {pillars.map((p) => (
            <div
              key={p.roman}
              style={{
                padding: "48px 36px",
                background: "#041232",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Top accent line */}
              <div
                style={{
                  width: "100%",
                  height: "2px",
                  background: p.accent,
                  marginBottom: "32px",
                }}
              />

              {/* Roman numeral */}
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  color: p.accent,
                  marginBottom: "16px",
                  opacity: 0.8,
                }}
              >
                PILLAR {p.roman}
              </div>

              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: "white",
                  marginBottom: "20px",
                }}
              >
                {p.title}
              </h3>

              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 300,
                  lineHeight: 1.85,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {p.body}
              </p>
            </div>
          ))}
        </div>

        {/* Positioning table */}
        <div
          style={{
            background: "#041232",
            padding: "0",
            overflow: "hidden",
          }}
        >
          {/* "We Are" header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
            className="positioning-header"
          >
            <div style={{ padding: "32px 48px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1rem",
                  fontStyle: "italic",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "8px",
                }}
              >
                We are not:
              </p>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 300,
                  lineHeight: 1.85,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                A research firm that stops at analysis · An implementation
                partner without analytical depth
              </p>
            </div>
            <div style={{ padding: "32px 48px" }}>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1rem",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.7,
                }}
              >
                We are deliberately positioned at the intersection — because
                that is where real results are produced.
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {positioning.map((item, i) => (
              <div
                key={item.label}
                style={{
                  flex: "1 1 180px",
                  padding: "32px 48px",
                  borderRight:
                    i < positioning.length - 1
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "#FFC000",
                    marginBottom: "10px",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "0.95rem",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.4,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .pillars-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .pillars-grid { grid-template-columns: 1fr !important; }
          .positioning-header { grid-template-columns: 1fr !important; }
          section { padding: 80px 24px !important; }
        }
      `}</style>
    </section>
  );
}
