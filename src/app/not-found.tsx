"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Home, Zap, Battery, Search, ArrowRight } from "lucide-react";

/* ─────────────────────── Particle canvas background ─────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 60;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 165, 233, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
}

/* ─────────────────── SVG Floating Battery Illustration ─────────────────── */
function FloatingBattery() {
  return (
    <div className="relative flex items-center justify-center h-48 w-48 md:h-64 md:w-64 mx-auto">
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(14,165,233,0.18) 0%, rgba(14,165,233,0.04) 60%, transparent 80%)",
          animation: "pulseGlow 3s ease-in-out infinite",
        }}
      />
      {/* Battery SVG */}
      <svg
        viewBox="0 0 120 200"
        className="relative z-10 drop-shadow-[0_0_24px_rgba(14,165,233,0.6)]"
        style={{ animation: "floatUp 4s ease-in-out infinite" }}
        aria-hidden="true"
      >
        {/* Battery cap */}
        <rect x="42" y="2" width="36" height="12" rx="4" fill="#0ea5e9" opacity="0.8" />
        {/* Battery body */}
        <rect x="10" y="14" width="100" height="176" rx="14" fill="#0c1825" stroke="#0ea5e9" strokeWidth="3" />
        {/* Fill level (orange = charge) */}
        <rect x="16" y="80" width="88" height="104" rx="10" fill="url(#battFill)" />
        {/* Lightning bolt */}
        <path
          d="M68 60 L50 108 L62 108 L56 150 L80 96 L67 96 Z"
          fill="#f97316"
          opacity="0.95"
        />
        {/* Glow lines */}
        <line x1="30" y1="40" x2="90" y2="40" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4" />
        <line x1="30" y1="56" x2="90" y2="56" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.25" />
        <defs>
          <linearGradient id="battFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      {/* Orbiting energy dot */}
      <div
        className="absolute h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_2px_rgba(14,165,233,0.8)]"
        style={{ animation: "orbitDot 3.5s linear infinite" }}
      />
    </div>
  );
}

/* ─────────────────────────── Glowing 404 digits ─────────────────────────── */
function Glow404() {
  return (
    <div
      className="select-none font-headline font-bold leading-none text-[clamp(5rem,20vw,11rem)] md:text-[11rem] tracking-tight"
      style={{
        background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 40%, #f97316 80%, #fb923c 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textShadow: "none",
        filter: "drop-shadow(0 0 40px rgba(14,165,233,0.45)) drop-shadow(0 0 80px rgba(249,115,22,0.2))",
        animation: "shimmer404 6s ease-in-out infinite",
      }}
      aria-label="404"
    >
      404
    </div>
  );
}

/* ────────────────────────────── Main Page ───────────────────────────────── */
export default function NotFound() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger fade-in after mount
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-18px) rotate(1deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes orbitDot {
          0%   { transform: rotate(0deg)   translateX(80px) rotate(0deg);   }
          100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
        }
        @keyframes shimmer404 {
          0%, 100% { filter: drop-shadow(0 0 40px rgba(14,165,233,.45)) drop-shadow(0 0 80px rgba(249,115,22,.2)); }
          50%       { filter: drop-shadow(0 0 60px rgba(14,165,233,.70)) drop-shadow(0 0 100px rgba(249,115,22,.4)); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeSlideUp 0.55s ease both 0.05s; }
        .anim-2 { animation: fadeSlideUp 0.55s ease both 0.18s; }
        .anim-3 { animation: fadeSlideUp 0.55s ease both 0.30s; }
        .anim-4 { animation: fadeSlideUp 0.55s ease both 0.42s; }
        .anim-5 { animation: fadeSlideUp 0.55s ease both 0.55s; }
        .anim-6 { animation: fadeSlideUp 0.55s ease both 0.68s; }

        .btn-glow:hover {
          box-shadow: 0 0 20px 4px rgba(249,115,22,0.45), 0 0 40px 8px rgba(249,115,22,0.18);
        }
        .btn-outline-glow:hover {
          box-shadow: 0 0 16px 3px rgba(14,165,233,0.35);
        }
        .search-wrap:focus-within {
          box-shadow: 0 0 0 2px rgba(14,165,233,0.55), 0 0 20px 4px rgba(14,165,233,0.15);
        }
      `}</style>

      {/* ── Page wrapper ── */}
      <section
        className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-grid-white/5 py-20"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% -10%, rgba(14,165,233,0.08) 0%, transparent 70%), hsl(200 15% 5%)",
        }}
      >
        <ParticleCanvas />

        {/* Ambient light blobs */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #0ea5e9, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 -left-40 h-[400px] w-[400px] rounded-full opacity-8"
            style={{ background: "radial-gradient(circle, #f97316, transparent 70%)" }}
          />
        </div>

        {/* ── Content container ── */}
        <div
          className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center gap-8"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.2s" }}
        >

          {/* Visual element */}
          <div className="anim-1 flex flex-col items-center gap-6 md:flex-row md:gap-12 md:items-center md:justify-center">
            <FloatingBattery />
            <div className="hidden md:block w-px h-48 bg-gradient-to-b from-transparent via-border to-transparent" aria-hidden="true" />
            <Glow404 />
          </div>

          {/* Error label */}
          <div className="anim-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase text-primary">
              <Zap size={12} className="animate-pulse" />
              Error 404
            </span>
          </div>

          {/* Heading */}
          <div className="anim-3 space-y-3">
            <h1 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl text-foreground">
              Oops!{" "}
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #0ea5e9, #f97316)" }}>
                Page Not Found
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-[480px] mx-auto leading-relaxed">
              The page you are looking for doesn't exist or may have been moved.
              Let's get you back on track.
            </p>
          </div>

          {/* Search bar */}
          <div className="anim-4 w-full max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <div
                className="search-wrap flex items-center rounded-xl border border-border bg-card/80 backdrop-blur-sm transition-all duration-300 overflow-hidden"
              >
                <Search size={18} className="ml-4 shrink-0 text-muted-foreground" />
                <input
                  id="not-found-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="flex-1 bg-transparent px-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  id="not-found-search-btn"
                  className="m-1.5 shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-primary/80 hover:shadow-[0_0_12px_rgba(14,165,233,0.5)]"
                  aria-label="Search"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* CTA buttons */}
          <div className="anim-5 flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none sm:w-auto justify-center">
            <Button
              id="not-found-home-btn"
              asChild
              size="lg"
              className="btn-glow relative overflow-hidden px-8 py-6 h-auto text-base font-semibold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #f97316, #fb923c)",
                color: "#fff",
                border: "none",
              }}
            >
              <Link href="/" className="flex items-center gap-2">
                <Home size={18} />
                Go Back Home
              </Link>
            </Button>

            <Button
              id="not-found-products-btn"
              asChild
              size="lg"
              variant="outline"
              className="btn-outline-glow border-primary/50 text-primary hover:bg-primary/10 px-8 py-6 h-auto text-base font-semibold transition-all duration-300"
            >
              <Link href="/products" className="flex items-center gap-2">
                <Battery size={18} />
                Explore Products
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Quick nav hints */}
          <div className="anim-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span>Quick links:</span>
            {[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                id={`not-found-quicklink-${link.label.toLowerCase()}`}
                className="text-muted-foreground/70 underline-offset-4 hover:text-primary hover:underline transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
