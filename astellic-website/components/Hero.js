"use client";
import { useEffect, useRef } from "react";

export default function Hero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Subtle particle/grid animation on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 192, 0, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(11, 118, 160, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "linear-gradient(135deg, #041232 0%, #071a45 50%, #041232 100%)",
      }}
    >
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.6,
        }}
      />

      {/* Gradient overlays */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "45%",
          height: "100%",
          background:
            "radial-gradient(ellipse at top right, rgba(11,118,160,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "50%",
          height: "60%",
          background:
            "radial-gradient(ellipse at bottom left, rgba(255,192,0,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Decorative vertical line */}
      <div
        style={{
          position: "absolute",
          left: "48px",
          top: "20%",
          bottom: "20%",
          width: "1px",
          background:
            "linear-gradient(to bottom, transparent, rgba(255,192,0,0.4), transparent)",
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "120px 48px 80px 96px",
          width: "100%",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "48px",
            opacity: 0,
            animation: "fadeUp 0.8s ease forwards",
          }}
        >
          <div style={{ width: "40px", height: "1px", background: "#FFC000" }} />
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#FFC000",
            }}
          >
            Research · Advisory · Implementation
          </span>
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(3.2rem, 7vw, 7rem)",
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "white",
            maxWidth: "780px",
            marginBottom: "40px",
            opacity: 0,
            animation: "fadeUp 0.8s ease 0.2s forwards",
          }}
        >
          Working at the
          <br />
          <em
            style={{
              fontStyle: "italic",
              color: "#FFC000",
            }}
          >
            Intersection
          </em>
          <br />
          of Evidence,
          <br />
          Policy &amp; Delivery.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "1rem",
            fontWeight: 300,
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.65)",
            maxWidth: "520px",
            marginBottom: "60px",
            opacity: 0,
            animation: "fadeUp 0.8s ease 0.4s forwards",
          }}
        >
          Astellic partners with governments, donors, and institutions across
          Africa to translate policy priorities into programmes that produce
          measurable and sustainable results.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            opacity: 0,
            animation: "fadeUp 0.8s ease 0.6s forwards",
          }}
        >
          <a href="#about" className="btn-primary">
            Our Approach
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a href="#contact" className="btn-outline">
            Work With Us
          </a>
        </div>

        {/* Bottom stats row */}
        <div
          style={{
            display: "flex",
            gap: "60px",
            marginTop: "100px",
            paddingTop: "40px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            flexWrap: "wrap",
            opacity: 0,
            animation: "fadeUp 0.8s ease 0.8s forwards",
          }}
        >
          {[
            { label: "Focus", value: "Africa-Wide" },
            { label: "Sectors", value: "Health · Governance · Climate · Education" },
            { label: "Approach", value: "Evidence to Impact" },
          ].map((item) => (
            <div key={item.label}>
              <div
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#FFC000",
                  marginBottom: "8px",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1rem",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.85)",
                  letterSpacing: "0.03em",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          opacity: 0,
          animation: "fadeIn 1s ease 1.2s forwards",
        }}
      >
        <span
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            writingMode: "vertical-rl",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: "1px",
            height: "60px",
            background:
              "linear-gradient(to bottom, rgba(255,192,0,0.6), transparent)",
            animation: "pulse-slow 2s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @media (max-width: 768px) {
          section { padding: 0; }
          h1 { font-size: 3rem !important; }
        }
      `}</style>
    </section>
  );
}
