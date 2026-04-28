export default function About() {
  return (
    <section
      id="about"
      style={{
        padding: "140px 48px",
        background: "#F9F1DC",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative element */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          border: "1px solid rgba(4,18,50,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          border: "1px solid rgba(4,18,50,0.08)",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "100px",
          alignItems: "start",
        }}
        className="about-grid"
      >
        {/* Left column */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
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
              01 — Company Overview
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2.4rem, 4vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "#041232",
              marginBottom: "40px",
              letterSpacing: "-0.01em",
            }}
          >
            Closing the gap between evidence and delivery.
          </h2>

          <blockquote
            style={{
              borderLeft: "3px solid #FFC000",
              paddingLeft: "28px",
              marginBottom: "48px",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.25rem",
                fontStyle: "italic",
                fontWeight: 400,
                lineHeight: 1.7,
                color: "#041232",
                opacity: 0.85,
              }}
            >
              &ldquo;Astellic exists to close the gap between what evidence is
              showing, what policy intends and what systems actually
              deliver.&rdquo;
            </p>
          </blockquote>

          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.95rem",
              fontWeight: 300,
              lineHeight: 1.9,
              color: "rgba(4,18,50,0.7)",
              marginBottom: "24px",
            }}
          >
            Astellic is a research, advisory, and implementation firm working at
            the intersection of evidence, policy, and delivery. We partner with
            governments, donors, and institutions across Africa to translate
            policy priorities into programmes that produce measurable and
            sustainable results.
          </p>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.95rem",
              fontWeight: 300,
              lineHeight: 1.9,
              color: "rgba(4,18,50,0.7)",
            }}
          >
            Across the development sector, strong policies and well-funded
            strategies often fail to deliver impact — not because of weak
            intent, but because of a breakdown between analysis,
            decision-making, and execution. Astellic was built to address this
            gap.
          </p>
        </div>

        {/* Right column */}
        <div style={{ paddingTop: "80px" }}>
          {/* Vision */}
          <div
            style={{
              padding: "40px",
              background: "#041232",
              color: "white",
              marginBottom: "24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "3px",
                height: "100%",
                background: "linear-gradient(to bottom, #FFC000, transparent)",
              }}
            />
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#FFC000",
                marginBottom: "16px",
              }}
            >
              Vision
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.15rem",
                fontWeight: 300,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              A world where systems consistently translate evidence into
              equitable, sustainable, and measurable outcomes.
            </p>
          </div>

          {/* Mission */}
          <div
            style={{
              padding: "40px",
              background: "#0a1f52",
              color: "white",
              marginBottom: "24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "3px",
                height: "100%",
                background: "linear-gradient(to bottom, #0B76A0, transparent)",
              }}
            />
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#0B76A0",
                marginBottom: "16px",
              }}
            >
              Mission
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.15rem",
                fontWeight: 300,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              To make policy implementable by integrating evidence, institutional
              realities, and delivery systems into practice.
            </p>
          </div>

          {/* The Premise */}
          <div
            style={{
              padding: "32px 40px",
              border: "1px solid rgba(4,18,50,0.12)",
              background: "rgba(4,18,50,0.03)",
            }}
          >
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#CC9B00",
                marginBottom: "12px",
              }}
            >
              The Astellic Premise
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.05rem",
                fontStyle: "italic",
                fontWeight: 400,
                lineHeight: 1.7,
                color: "#041232",
              }}
            >
              The implementation gap is not a technical problem. It is a systems
              problem. We address it as one.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 60px !important;
          }
          .about-grid > div:last-child {
            padding-top: 0 !important;
          }
        }
        @media (max-width: 768px) {
          section { padding: 80px 24px !important; }
        }
      `}</style>
    </section>
  );
}
