"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

/** Desktop shows all; mobile shows the first MOBILE_FORMULAS (hidden via CSS). */
const FORMULAS = [
  { text: "F = ma", className: "left-[2%] top-[12%]" },
  { text: "E = mc²", className: "right-[4%] top-[6%]" },
  { text: "∇·E = ρ/ε₀", className: "right-[0%] bottom-[14%]" },
  { text: "λ = h/p", className: "left-[6%] bottom-[8%]" },
  { text: "PV = nRT", className: "left-[38%] -top-[2%]" },
  { text: "F = Gm₁m₂/r²", className: "left-[30%] -bottom-[4%]" },
] as const;
const MOBILE_FORMULAS = 3;

const PARTICLES = { desktop: 80, mobile: 25 } as const;

/** Orbit rings: static tilt (deg), ellipse radii, rotation period (s), electron period (s). */
const RINGS = [
  { tilt: -20, rx: 175, ry: 62, spin: 90, orbit: 7, color: "var(--color-primary)" },
  { tilt: 40, rx: 150, ry: 54, spin: 120, orbit: 9, color: "var(--color-secondary)" },
  { tilt: 100, rx: 125, ry: 46, spin: 75, orbit: 5.5, color: "var(--color-accent)" },
] as const;
const C = 200; // SVG centre (viewBox 0 0 400 400)

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  phase: number;
  color: string;
};

function themeColors(): string[] {
  const css = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return [
    read("--color-primary", "#2f80ff"),
    read("--color-secondary", "#a855f7"),
    read("--color-accent", "#f5c451"),
    read("--color-foreground", "#e8eaf2"),
  ];
}

/**
 * Decorative hero background: SVG orbit rings + floating formulas (GSAP) and a
 * single <canvas> of drifting particles. Pauses when the tab is hidden or the
 * hero is off-screen; renders a static frame under prefers-reduced-motion.
 */
export function HeroVisual() {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const canvas = canvasRef.current;
      const ctx2d = canvas?.getContext("2d");
      if (!el || !canvas || !ctx2d) return;

      const colors = themeColors();
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 768px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduce } = context.conditions as {
            desktop: boolean;
            reduce: boolean;
          };

          // ---- Canvas particles -------------------------------------------
          let width = 0;
          let height = 0;
          let particles: Particle[] = [];

          const seed = () => {
            const count = desktop ? PARTICLES.desktop : PARTICLES.mobile;
            particles = Array.from({ length: count }, () => ({
              x: Math.random() * width,
              y: Math.random() * height,
              vx: (Math.random() - 0.5) * 0.25,
              vy: (Math.random() - 0.5) * 0.25,
              r: Math.random() * 1.4 + 0.4,
              alpha: Math.random() * 0.5 + 0.2,
              phase: Math.random() * Math.PI * 2,
              color: colors[Math.floor(Math.random() * colors.length)],
            }));
          };

          const draw = (time: number) => {
            ctx2d.clearRect(0, 0, width, height);
            for (const p of particles) {
              const twinkle = reduce ? 0 : Math.sin(time * 1.5 + p.phase) * 0.2;
              ctx2d.globalAlpha = Math.max(0.05, Math.min(1, p.alpha + twinkle));
              ctx2d.fillStyle = p.color;
              ctx2d.beginPath();
              ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
              ctx2d.fill();
            }
            ctx2d.globalAlpha = 1;
          };

          const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const first = width === 0;
            width = rect.width;
            height = rect.height;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (first) seed();
            draw(gsap.ticker.time);
          };

          const resizeObserver = new ResizeObserver(resize);
          resizeObserver.observe(canvas);
          resize();

          if (reduce) {
            // Static frame only: no tweens, no ticker.
            return () => resizeObserver.disconnect();
          }

          const step = (time: number) => {
            const ratio = gsap.ticker.deltaRatio(60);
            for (const p of particles) {
              p.x += p.vx * ratio;
              p.y += p.vy * ratio;
              if (p.x < -4) p.x = width + 4;
              else if (p.x > width + 4) p.x = -4;
              if (p.y < -4) p.y = height + 4;
              else if (p.y > height + 4) p.y = -4;
            }
            draw(time);
          };

          // ---- SVG orbits ------------------------------------------------
          const tweens: gsap.core.Tween[] = [];

          gsap.utils.toArray<SVGGElement>("[data-ring]", el).forEach((ring, i) => {
            const { spin, orbit, rx, ry } = RINGS[i];
            tweens.push(
              gsap.to(ring, {
                rotation: i % 2 ? -360 : 360,
                svgOrigin: `${C} ${C}`,
                duration: spin,
                repeat: -1,
                ease: "none",
              }),
            );

            const electron = ring.querySelector<SVGCircleElement>("[data-electron]");
            if (!electron) return;
            const proxy = { a: Math.random() * Math.PI * 2 };
            tweens.push(
              gsap.to(proxy, {
                a: `+=${Math.PI * 2}`,
                duration: orbit,
                repeat: -1,
                ease: "none",
                onUpdate: () => {
                  electron.setAttribute("cx", String(C + rx * Math.cos(proxy.a)));
                  electron.setAttribute("cy", String(C + ry * Math.sin(proxy.a)));
                },
              }),
            );
          });

          tweens.push(
            gsap.to("[data-nucleus]", {
              scale: 1.15,
              transformOrigin: "50% 50%",
              duration: 2.4,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            }),
          );

          // ---- Floating formulas -----------------------------------------
          gsap.utils.toArray<HTMLElement>("[data-formula]", el).forEach((f) => {
            tweens.push(
              gsap.to(f, {
                y: gsap.utils.random(-14, 14),
                x: gsap.utils.random(-8, 8),
                rotation: gsap.utils.random(-4, 4),
                duration: gsap.utils.random(4, 7),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              }),
            );
          });

          // ---- Pause when hidden / off-screen ----------------------------
          let onScreen = true;
          let running = false;
          const update = () => {
            const shouldRun = onScreen && document.visibilityState === "visible";
            if (shouldRun === running) return;
            running = shouldRun;
            tweens.forEach((t) => (shouldRun ? t.resume() : t.pause()));
            if (shouldRun) gsap.ticker.add(step);
            else gsap.ticker.remove(step);
          };

          const io = new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            update();
          });
          io.observe(el);
          document.addEventListener("visibilitychange", update);
          update();

          return () => {
            gsap.ticker.remove(step);
            io.disconnect();
            resizeObserver.disconnect();
            document.removeEventListener("visibilitychange", update);
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />

      {/* Orbit system: faint behind the text on mobile, right column on desktop. */}
      <div className="absolute top-1/2 left-1/2 aspect-square w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 opacity-30 md:right-[3%] md:left-auto md:w-[min(46vw,580px)] md:translate-x-0 md:opacity-100">
        <svg viewBox="0 0 400 400" className="size-full overflow-visible">
          <defs>
            <radialGradient id="hero-nucleus" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.95" />
              <stop offset="45%" stopColor="var(--color-primary)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {RINGS.map((ring) => (
            <g key={ring.tilt} transform={`rotate(${ring.tilt} ${C} ${C})`}>
              <g data-ring>
                <ellipse
                  cx={C}
                  cy={C}
                  rx={ring.rx}
                  ry={ring.ry}
                  fill="none"
                  stroke={ring.color}
                  strokeOpacity="0.45"
                  strokeWidth="1.2"
                />
                <circle
                  data-electron
                  cx={C + ring.rx}
                  cy={C}
                  r="4.5"
                  fill={ring.color}
                  style={{ filter: `drop-shadow(0 0 6px ${ring.color})` }}
                />
              </g>
            </g>
          ))}

          <circle data-nucleus cx={C} cy={C} r="34" fill="url(#hero-nucleus)" />
          <circle cx={C} cy={C} r="7" fill="var(--color-accent)" />
        </svg>

        {FORMULAS.map((f, i) => (
          <span
            key={f.text}
            data-formula
            className={`absolute font-mono text-sm whitespace-nowrap text-foreground/70 md:text-base ${f.className} ${
              i >= MOBILE_FORMULAS ? "hidden md:block" : ""
            }`}
          >
            {f.text}
          </span>
        ))}
      </div>
    </div>
  );
}
