"use client";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Approach", href: "#approach" },
  { label: "Expertise", href: "#expertise" },
  { label: "Delivery", href: "#delivery" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 48px",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.4s ease",
        background: scrolled
          ? "rgba(4, 18, 50, 0.97)"
          : "transparent",
        borderBottom: scrolled
          ? "1px solid rgba(255,192,0,0.1)"
          : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      {/* Logo */}
      <a href="#" style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.6rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "white",
              lineHeight: 1,
            }}
          >
            ASTELLIC
          </span>
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.28em",
              color: "#FFC000",
              textTransform: "uppercase",
            }}
          >
            Research · Advisory · Implementation
          </span>
        </div>
      </a>

      {/* Desktop Links */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "center",
        }}
        className="desktop-nav"
      >
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} className="nav-link">
            {link.label}
          </a>
        ))}
        <a
          href="#contact"
          style={{
            padding: "10px 24px",
            border: "1px solid rgba(255,192,0,0.5)",
            color: "#FFC000",
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#FFC000";
            e.target.style.color = "#041232";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#FFC000";
          }}
        >
          Get in Touch
        </a>
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: "none",
          background: "none",
          border: "none",
          cursor: "pointer",
          flexDirection: "column",
          gap: "5px",
          padding: "4px",
        }}
        className="mobile-menu-btn"
        aria-label="Toggle menu"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "block",
              width: i === 1 ? "20px" : "28px",
              height: "1.5px",
              background: "#FFC000",
              transition: "all 0.3s ease",
              transformOrigin: "center",
            }}
          />
        ))}
      </button>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(4, 18, 50, 0.98)",
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "40px",
          }}
        >
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute",
              top: "30px",
              right: "48px",
              background: "none",
              border: "none",
              color: "white",
              fontSize: "2rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "2.5rem",
                fontWeight: 300,
                color: "white",
                textDecoration: "none",
                letterSpacing: "0.08em",
                transition: "color 0.3s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#FFC000")}
              onMouseLeave={(e) => (e.target.style.color = "white")}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          nav { padding: 0 24px !important; }
        }
      `}</style>
    </nav>
  );
}
