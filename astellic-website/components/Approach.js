export default function Approach() {
  const principles = [
    {
      text: "We prioritise honest analysis over convenience",
    },
    {
      text: "We design solutions that work within systems, not around them",
    },
    {
      text: "We measure success by outcomes, not outputs",
    },
  ];

  return (
    <section
      id="approach"
      style={{
        padding: "140px 48px",
        background: "#041232",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,192,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,192,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Section header */}
        <div style={{ marginBottom: "100px" }}>
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
              03 — Our Approach to Work
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "60px",
              alignItems: "end",
            }}
            className="approach-header-grid"
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
              The implementation gap is real.{" "}
              <em style={{ color: "#FFC000", fontStyle: "italic" }}>
                We close it.
              </em>
            </h2>

            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.95rem",
                fontWeight: 300,
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              The development sector is not short of evidence, strategies,
              funding, or technical expertise. What is consistently scarce is
              the ability to translate them into results at scale. This is not a
              technical failure; it is a systems failure. Astellic was created
              to fill that gap.
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2px",
          }}
          className="approach-body-grid"
        >
          {/* Left: How We Work */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              padding: "60px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#0B76A0",
                marginBottom: "48px",
              }}
            >
              How We Work
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {principles.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "24px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      border: "1px solid rgba(255,192,0,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <circle cx="5" cy="5" r="3" fill="#FFC000" />
                    </svg>
                  </div>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.15rem",
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Professional Trust */}
          <div
            style={{
              background: "rgba(11,118,160,0.08)",
              padding: "60px",
              borderTop: "1px solid rgba(11,118,160,0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "-40px",
                right: "-40px",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                border: "1px solid rgba(11,118,160,0.15)",
              }}
            />

            <h3
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#0B76A0",
                marginBottom: "48px",
              }}
            >
              Professional Trust
            </h3>

            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.25rem",
                fontStyle: "italic",
                fontWeight: 300,
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.85)",
                marginBottom: "40px",
              }}
            >
              Our partnerships are built on honest analysis, technically sound
              advice, and delivery aligned with clients&rsquo; genuine
              interests.
            </p>

            <div
              style={{
                padding: "28px",
                background: "rgba(255,192,0,0.06)",
                borderLeft: "2px solid #FFC000",
              }}
            >
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 300,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                We measure success by the outcomes our clients achieve, not by
                the volume of work we produce.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .approach-header-grid, .approach-body-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .approach-body-grid > div {
            padding: 40px 24px !important;
          }
        }
        @media (max-width: 768px) {
          section { padding: 80px 24px !important; }
        }
      `}</style>
    </section>
  );
}
