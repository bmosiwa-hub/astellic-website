const areas = [
  {
    number: "01",
    title: "Health & Nutrition Systems",
    description:
      "Strengthening integrated systems that deliver equitable and effective services, with a focus on primary health care, service integration, and evidence-informed decision-making.",
    color: "#0B76A0",
    accent: "rgba(11,118,160,0.1)",
  },
  {
    number: "02",
    title: "Governance & Public Sector Reform",
    description:
      "Improving how institutions design, implement, and deliver policy through enhanced accountability, legislative effectiveness, and institutional alignment.",
    color: "#FFC000",
    accent: "rgba(255,192,0,0.08)",
  },
  {
    number: "03",
    title: "Climate, Agriculture & Sustainability",
    description:
      "Supporting resilient systems that integrate climate policy, agricultural productivity, and sustainable resource management.",
    color: "#3B7D23",
    accent: "rgba(59,125,35,0.08)",
  },
  {
    number: "04",
    title: "Education & Social Services",
    description:
      "Enhancing delivery systems for education, skills development, and social protection to improve equity and human capital outcomes.",
    color: "#CC9B00",
    accent: "rgba(204,155,0,0.08)",
  },
];

export default function Expertise() {
  return (
    <section
      id="expertise"
      style={{
        padding: "140px 48px",
        background: "#F9F1DC",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "60px",
            marginBottom: "80px",
            alignItems: "end",
          }}
          className="expertise-header"
        >
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
                04 — Thematic Areas
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2.4rem, 4vw, 4rem)",
                fontWeight: 400,
                lineHeight: 1.15,
                color: "#041232",
                letterSpacing: "-0.01em",
              }}
            >
              Domains of Expertise
            </h2>
          </div>

          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.95rem",
              fontWeight: 300,
              lineHeight: 1.9,
              color: "rgba(4,18,50,0.65)",
            }}
          >
            Astellic applies its integrated delivery model across four strategic
            areas — each representing a domain where the gap between policy
            intent and operational outcome demands a firm capable of bridging
            both.
          </p>
        </div>

        {/* 2x2 grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2px",
          }}
          className="expertise-grid"
        >
          {areas.map((area) => (
            <div
              key={area.number}
              style={{
                padding: "56px 48px",
                background: "white",
                position: "relative",
                overflow: "hidden",
                transition: "background 0.4s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#041232";
                e.currentTarget.querySelector(".area-title").style.color = "white";
                e.currentTarget.querySelector(".area-desc").style.color = "rgba(255,255,255,0.6)";
                e.currentTarget.querySelector(".area-number").style.color = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.querySelector(".area-title").style.color = "#041232";
                e.currentTarget.querySelector(".area-desc").style.color = "rgba(4,18,50,0.65)";
                e.currentTarget.querySelector(".area-number").style.color = "rgba(4,18,50,0.05)";
              }}
            >
              {/* Large background number */}
              <div
                className="area-number"
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-10px",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "8rem",
                  fontWeight: 700,
                  color: "rgba(4,18,50,0.05)",
                  lineHeight: 1,
                  transition: "color 0.4s ease",
                  userSelect: "none",
                }}
              >
                {area.number}
              </div>

              {/* Color accent line */}
              <div
                style={{
                  width: "40px",
                  height: "3px",
                  background: area.color,
                  marginBottom: "32px",
                }}
              />

              <h3
                className="area-title"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.6rem",
                  fontWeight: 500,
                  lineHeight: 1.3,
                  color: "#041232",
                  marginBottom: "20px",
                  transition: "color 0.4s ease",
                  position: "relative",
                }}
              >
                {area.title}
              </h3>

              <p
                className="area-desc"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.88rem",
                  fontWeight: 300,
                  lineHeight: 1.85,
                  color: "rgba(4,18,50,0.65)",
                  transition: "color 0.4s ease",
                  position: "relative",
                }}
              >
                {area.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .expertise-header, .expertise-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          section { padding: 80px 24px !important; }
          .expertise-grid > div { padding: 40px 28px !important; }
        }
      `}</style>
    </section>
  );
}
