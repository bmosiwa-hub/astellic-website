export default function Contact() {
  return (
    <>
      <section
        id="contact"
        style={{
          padding: "140px 48px",
          background: "#041232",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient blob */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(ellipse, rgba(11,118,160,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "100px",
              alignItems: "start",
            }}
            className="contact-grid"
          >
            {/* Left */}
            <div>
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
                  07 — Connect With Astellic
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(2.4rem, 4vw, 4rem)",
                  fontWeight: 400,
                  lineHeight: 1.15,
                  color: "white",
                  letterSpacing: "-0.01em",
                  marginBottom: "32px",
                }}
              >
                We are not just different,{" "}
                <em style={{ color: "#FFC000", fontStyle: "italic" }}>
                  we are effective.
                </em>
              </h2>

              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: 300,
                  lineHeight: 1.9,
                  color: "rgba(255,255,255,0.55)",
                  marginBottom: "60px",
                  maxWidth: "460px",
                }}
              >
                If you are working to strengthen systems, close the
                evidence-to-delivery gap, or translate policy into practice
                across Africa, let&rsquo;s talk.
              </p>

              {/* Contact details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <a
                  href="mailto:partnerships@astellic.com"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    textDecoration: "none",
                    color: "white",
                    transition: "color 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FFC000")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      border: "1px solid rgba(255,192,0,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 7 10-7" />
                    </svg>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.6rem",
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.35)",
                        marginBottom: "4px",
                      }}
                    >
                      Email
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1rem",
                        fontWeight: 400,
                      }}
                    >
                      partnerships@astellic.com
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.astellic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    textDecoration: "none",
                    color: "white",
                    transition: "color 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#FFC000")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      border: "1px solid rgba(255,192,0,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.6rem",
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.35)",
                        marginBottom: "4px",
                      }}
                    >
                      Website
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1rem",
                        fontWeight: 400,
                      }}
                    >
                      www.astellic.com
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right: CTA Card */}
            <div>
              <div
                style={{
                  background: "#F9F1DC",
                  padding: "60px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(to right, #FFC000, #CC9B00)",
                  }}
                />

                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.8rem",
                    fontWeight: 400,
                    lineHeight: 1.3,
                    color: "#041232",
                    marginBottom: "16px",
                  }}
                >
                  Ready to bridge the gap?
                </h3>

                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.88rem",
                    fontWeight: 300,
                    lineHeight: 1.85,
                    color: "rgba(4,18,50,0.65)",
                    marginBottom: "40px",
                  }}
                >
                  Whether you are a government, donor, or institution, Astellic
                  offers tailored support across the full evidence-to-impact
                  chain. Reach out to explore how we can work together.
                </p>

                <a
                  href="mailto:partnerships@astellic.com"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px 36px",
                    background: "#041232",
                    color: "white",
                    textDecoration: "none",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.72rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    transition: "all 0.3s ease",
                    marginBottom: "20px",
                    display: "block",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FFC000";
                    e.currentTarget.style.color = "#041232";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#041232";
                    e.currentTarget.style.color = "white";
                  }}
                >
                  Send a Partnership Enquiry
                </a>

                {/* Areas of engagement */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "32px" }}>
                  {[
                    "Health Systems",
                    "Governance",
                    "Climate",
                    "Education",
                    "Research",
                    "MEL",
                  ].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "6px 14px",
                        border: "1px solid rgba(4,18,50,0.15)",
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.65rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(4,18,50,0.5)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "32px 48px",
          background: "#020c1f",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.1rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "white",
            }}
          >
            ASTELLIC
          </span>
        </div>

        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.72rem",
            fontWeight: 300,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.05em",
          }}
        >
          © {new Date().getFullYear()} Astellic. All rights reserved. · Malawi / Pan-African
        </p>

        <div style={{ display: "flex", gap: "32px" }}>
          {["About", "Expertise", "Delivery", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#FFC000")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.3)")}
            >
              {item}
            </a>
          ))}
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 60px !important; }
          section { padding: 80px 24px !important; }
          footer { padding: 32px 24px !important; }
        }
      `}</style>
    </>
  );
}
