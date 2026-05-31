import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, AnimatePresence, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Search, Sparkles, Zap, Activity, TrendingUp, Brain,
  ShieldCheck, Cpu, Gauge, Play, Command, Radio, Waves, LineChart, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CinematicHeroProps {
  url: string;
  setUrl: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isAnalyzing: boolean;
}

const reveal: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: 0.05 + i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ─────────────────────────────────────────────
   Neural network canvas — animated nodes + edges
   ───────────────────────────────────────────── */
function NeuralNetwork() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Star = {
      x: number; y: number; vx: number; vy: number;
      r: number; pulse: number; speed: number;
      hue: number; depth: number;
    };
    type Nebula = { x: number; y: number; r: number; hue: number; drift: number; phase: number };
    type Meteor = { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number };

    let stars: Star[] = [];
    let nebulas: Nebula[] = [];
    let meteors: Meteor[] = [];

    // ── Solar-system orbits (subtle, off-center) ─────────────
    type Orbit = { rx: number; ry: number; tilt: number; speed: number; phase: number; hue: number; size: number };
    let orbits: Orbit[] = [];
    let solarCx = 0, solarCy = 0;

    // ── Quantum probability pulses (expanding rings) ─────────
    type Pulse = { x: number; y: number; r: number; life: number; max: number; hue: number };
    let pulses: Pulse[] = [];

    // ── Commerce-tech glyphs drifting in space ───────────────
    type Glyph = { x: number; y: number; vx: number; vy: number; ch: string; size: number; hue: number; phase: number; speed: number };
    let glyphs: Glyph[] = [];
    const GLYPH_CHARS = ["$", "◇", "△", "◯", "⟁", "¥", "€", "⌗", "✦"];

    let t = 0;
    const HUES = [217, 260, 190, 290]; // primary, violet, cyan, magenta


    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(180, Math.max(90, Math.floor((w * h) / 9000)));
      stars = Array.from({ length: count }).map(() => {
        const depth = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.05 * (0.4 + depth),
          vy: (Math.random() - 0.5) * 0.05 * (0.4 + depth),
          r: 0.4 + depth * 1.8,
          pulse: Math.random() * Math.PI * 2,
          speed: 0.025 + Math.random() * 0.08,
          hue: HUES[Math.floor(Math.random() * HUES.length)],
          depth,
        };
      });

      nebulas = Array.from({ length: 4 }).map((_, i) => ({
        x: (0.15 + Math.random() * 0.7) * w,
        y: (0.15 + Math.random() * 0.7) * h,
        r: Math.max(w, h) * (0.2 + Math.random() * 0.22),
        hue: HUES[i % HUES.length],
        drift: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
      }));

      // Solar system anchored off-canvas-ish (bottom-left bias)
      solarCx = w * (0.22 + Math.random() * 0.08);
      solarCy = h * (0.78 + Math.random() * 0.08);
      const baseR = Math.min(w, h);
      orbits = Array.from({ length: 5 }).map((_, i) => ({
        rx: baseR * (0.22 + i * 0.12),
        ry: baseR * (0.22 + i * 0.12) * (0.32 + Math.random() * 0.18),
        tilt: -0.35 + Math.random() * 0.1,
        speed: 0.0009 + (5 - i) * 0.00035,
        phase: Math.random() * Math.PI * 2,
        hue: HUES[i % HUES.length],
        size: 1.6 + Math.random() * 1.8,
      }));

      glyphs = Array.from({ length: Math.min(14, Math.max(8, Math.floor(w / 140))) }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.05,
        ch: GLYPH_CHARS[Math.floor(Math.random() * GLYPH_CHARS.length)],
        size: 9 + Math.random() * 6,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02,
      }));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);

      // ── Solar-system orbits (subtle, painterly) ────────────
      ctx.save();
      ctx.translate(solarCx, solarCy);
      ctx.rotate(-0.18);
      for (const o of orbits) {
        o.phase += o.speed;
        // orbit ring
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${o.hue}, 90%, 70%, 0.07)`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 6]);
        ctx.ellipse(0, 0, o.rx, o.ry, o.tilt, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // orbiting body
        const bx = Math.cos(o.phase) * o.rx * Math.cos(o.tilt) - Math.sin(o.phase) * o.ry * Math.sin(o.tilt);
        const by = Math.cos(o.phase) * o.rx * Math.sin(o.tilt) + Math.sin(o.phase) * o.ry * Math.cos(o.tilt);
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, o.size * 5);
        g.addColorStop(0, `hsla(${o.hue}, 100%, 85%, 0.9)`);
        g.addColorStop(1, `hsla(${o.hue}, 100%, 60%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, o.size * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = `hsla(${o.hue}, 100%, 92%, 0.95)`;
        ctx.arc(bx, by, o.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }
      // central "sun" — soft commerce-tech core
      ctx.globalCompositeOperation = "lighter";
      const sunGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
      sunGrad.addColorStop(0, "hsla(217, 100%, 80%, 0.35)");
      sunGrad.addColorStop(0.5, "hsla(260, 100%, 65%, 0.12)");
      sunGrad.addColorStop(1, "hsla(217, 100%, 60%, 0)");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      // ── Quantum probability pulses (expanding interference) ─
      if (t % 110 === 0) {
        pulses.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.85,
          r: 0,
          life: 0,
          max: 180 + Math.random() * 80,
          hue: HUES[Math.floor(Math.random() * HUES.length)],
        });
      }
      ctx.globalCompositeOperation = "lighter";
      pulses = pulses.filter((p) => {
        p.r += 1.4;
        p.life += 1;
        const a = (1 - p.life / p.max) * 0.35;
        if (a <= 0) return false;
        // double-slit style: 3 concentric rings
        for (let k = 0; k < 3; k++) {
          const rr = p.r - k * 14;
          if (rr <= 0) continue;
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${p.hue}, 95%, 75%, ${a * (1 - k * 0.3)})`;
          ctx.lineWidth = 0.7;
          ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
        return p.life < p.max;
      });
      ctx.globalCompositeOperation = "source-over";


      // ── Nebula clouds (galactic depth) ─────────────────────
      ctx.globalCompositeOperation = "lighter";
      for (const n of nebulas) {
        n.phase += n.drift * 0.02;
        const ox = Math.cos(n.phase) * 30;
        const oy = Math.sin(n.phase * 0.7) * 24;
        const alpha = 0.06 + (Math.sin(n.phase) + 1) * 0.025;
        const grad = ctx.createRadialGradient(n.x + ox, n.y + oy, 0, n.x + ox, n.y + oy, n.r);
        grad.addColorStop(0, `hsla(${n.hue}, 90%, 60%, ${alpha})`);
        grad.addColorStop(0.5, `hsla(${n.hue}, 90%, 55%, ${alpha * 0.4})`);
        grad.addColorStop(1, `hsla(${n.hue}, 90%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(n.x + ox - n.r, n.y + oy - n.r, n.r * 2, n.r * 2);
      }
      ctx.globalCompositeOperation = "source-over";

      // ── Constellation links (near stars only) ──────────────
      const near = stars.filter((s) => s.depth > 0.6);
      for (let i = 0; i < near.length; i++) {
        for (let j = i + 1; j < near.length; j++) {
          const a = near[i], b = near[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          const max = 140;
          if (d2 < max * max) {
            const alpha = (1 - Math.sqrt(d2) / max) * 0.18;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `hsla(${a.hue}, 95%, 70%, ${alpha})`);
            grad.addColorStop(1, `hsla(${b.hue}, 95%, 70%, ${alpha})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // ── Stars (multi-depth parallax twinkle) ───────────────
      ctx.globalCompositeOperation = "lighter";
      for (const n of stars) {
        n.x += n.vx; n.y += n.vy; n.pulse += n.speed;
        if (n.x < -10) n.x = w + 10; else if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10; else if (n.y > h + 10) n.y = -10;

        const s = Math.sin(n.pulse);
        const twinkle = Math.pow((s + 1) / 2, 2.6);
        const core = 0.25 + twinkle * 0.75 * (0.5 + n.depth * 0.5);
        const spikeR = n.r * (1 + twinkle * 1.2);

        // halo
        ctx.beginPath();
        ctx.fillStyle = `hsla(${n.hue}, 90%, 70%, ${twinkle * 0.14 * n.depth})`;
        ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
        ctx.fill();

        // core
        ctx.beginPath();
        ctx.fillStyle = `hsla(${n.hue}, 95%, ${75 + twinkle * 15}%, ${core})`;
        ctx.arc(n.x, n.y, spikeR, 0, Math.PI * 2);
        ctx.fill();

        // diffraction spikes on bright near-stars
        if (twinkle > 0.72 && n.depth > 0.5) {
          const flareLen = spikeR * 6 * twinkle;
          const a = (twinkle - 0.72) * 2.2;
          const gH = ctx.createLinearGradient(n.x - flareLen, n.y, n.x + flareLen, n.y);
          gH.addColorStop(0, `hsla(${n.hue}, 100%, 90%, 0)`);
          gH.addColorStop(0.5, `hsla(${n.hue}, 100%, 95%, ${a})`);
          gH.addColorStop(1, `hsla(${n.hue}, 100%, 90%, 0)`);
          ctx.strokeStyle = gH;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(n.x - flareLen, n.y); ctx.lineTo(n.x + flareLen, n.y);
          ctx.stroke();
          const gV = ctx.createLinearGradient(n.x, n.y - flareLen, n.x, n.y + flareLen);
          gV.addColorStop(0, `hsla(${n.hue}, 100%, 90%, 0)`);
          gV.addColorStop(0.5, `hsla(${n.hue}, 100%, 95%, ${a})`);
          gV.addColorStop(1, `hsla(${n.hue}, 100%, 90%, 0)`);
          ctx.strokeStyle = gV;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y - flareLen); ctx.lineTo(n.x, n.y + flareLen);
          ctx.stroke();
        }
      }

      // ── Shooting stars / data streaks ──────────────────────
      if (Math.random() < 0.014 && meteors.length < 3) {
        const fromLeft = Math.random() < 0.5;
        const speed = 6 + Math.random() * 4;
        meteors.push({
          x: fromLeft ? -40 : w + 40,
          y: Math.random() * h * 0.6,
          vx: fromLeft ? speed : -speed,
          vy: 1.4 + Math.random() * 1.2,
          life: 0,
          max: 70 + Math.random() * 40,
          hue: HUES[Math.floor(Math.random() * HUES.length)],
        });
      }
      meteors = meteors.filter((m) => {
        m.x += m.vx; m.y += m.vy; m.life += 1;
        const tx = m.x - m.vx * 14;
        const ty = m.y - m.vy * 14;
        const grad = ctx.createLinearGradient(tx, ty, m.x, m.y);
        grad.addColorStop(0, `hsla(${m.hue}, 100%, 85%, 0)`);
        grad.addColorStop(1, `hsla(${m.hue}, 100%, 95%, 0.9)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(tx, ty); ctx.lineTo(m.x, m.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = `hsla(${m.hue}, 100%, 95%, 0.95)`;
        ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        return m.life < m.max && m.x > -160 && m.x < w + 160 && m.y < h + 160;
      });

      ctx.globalCompositeOperation = "source-over";

      // ── Commerce-tech glyphs (subtle drifting symbols) ─────
      ctx.font = `300 12px ui-monospace, "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const gl of glyphs) {
        gl.x += gl.vx; gl.y += gl.vy; gl.phase += gl.speed;
        if (gl.x < -20) gl.x = w + 20; else if (gl.x > w + 20) gl.x = -20;
        if (gl.y < -20) gl.y = h + 20; else if (gl.y > h + 20) gl.y = -20;
        const flicker = 0.25 + (Math.sin(gl.phase) + 1) * 0.18;
        ctx.font = `300 ${gl.size}px ui-monospace, "JetBrains Mono", monospace`;
        ctx.fillStyle = `hsla(${gl.hue}, 90%, 80%, ${flicker})`;
        ctx.fillText(gl.ch, gl.x, gl.y);
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [reduced]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

/* ─────────────────────────────────────────────
   Kinetic rotating word
   ───────────────────────────────────────────── */
const ROTATING = ["Intelligent", "Predictive", "Autonomous-Ready", "Adaptive"];
function KineticWord() {
  const reduced = useReducedMotion();
  const [isCompact, setIsCompact] = useState(false);
  const [i, setI] = useState(0);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ROTATING.length), 2600);
    return () => clearInterval(id);
  }, []);
  const longest = ROTATING.reduce((a, b) => (a.length > b.length ? a : b));
  return (
    <span className="relative inline-grid align-baseline leading-[1.1]">
      {/* Invisible sizer keeps width stable for the longest word */}
      <span
        className="invisible whitespace-nowrap px-[0.02em]"
        style={{ gridArea: "1 / 1" }}
        aria-hidden
      >
        {longest}
      </span>
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={ROTATING[i]}
          initial={reduced || isCompact ? { opacity: 0 } : { y: "18%", opacity: 0 }}
          animate={reduced || isCompact ? { opacity: 1 } : { y: "0%", opacity: 1 }}
          exit={reduced || isCompact ? { opacity: 0 } : { y: "-18%", opacity: 0 }}
          transition={{ duration: reduced || isCompact ? 0.22 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          style={{ gridArea: "1 / 1" }}
          className="kinetic-word whitespace-nowrap text-center lg:text-left transform-gpu will-change-transform lg:animate-[heroKineticShift_10s_linear_infinite]"
        >
          {ROTATING[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ─────────────────────────────────────────────
   Floating AI insight chips (orbital)
   ───────────────────────────────────────────── */
const insights = [
  { icon: TrendingUp, text: "+24% conversion lift detected",   tone: "from-emerald-400/30 to-emerald-400/0", dot: "bg-emerald-400", pos: "top-[4%] left-[2%]"     },
  { icon: Brain,      text: "Checkout friction · pinpointed",  tone: "from-violet-400/30 to-violet-400/0",   dot: "bg-violet-400",  pos: "top-[28%] right-[-2%]"   },
  { icon: Eye,        text: "1,284 sessions simulated",        tone: "from-sky-400/30 to-sky-400/0",         dot: "bg-sky-400",     pos: "bottom-[22%] left-[-2%]" },
  { icon: Sparkles,   text: "7 AI workflows fine-tuned",       tone: "from-amber-400/30 to-amber-400/0",     dot: "bg-amber-400",   pos: "bottom-[2%] right-[6%]"  },
];

function InsightChip({
  Icon, text, tone, dot, pos, delay, mx, my,
}: {
  Icon: typeof TrendingUp; text: string; tone: string; dot: string; pos: string;
  delay: number; mx: any; my: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      style={{ x: mx, y: my }}
      className={`absolute ${pos} z-30 pointer-events-none`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5 + Math.random() * 2.5, repeat: Infinity, ease: "easeInOut", delay }}
      >
        <div className="relative rounded-full border border-white/10 bg-background/55 backdrop-blur-xl pl-2 pr-3 py-1.5 shadow-[0_10px_36px_-8px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-70`} />
          <div className="relative flex items-center gap-2">
            <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-background/70">
              <span className={`h-1.5 w-1.5 rounded-full ${dot} shadow-[0_0_10px_currentColor] animate-pulse`} />
            </span>
            <Icon className="h-3 w-3 text-foreground/80" />
            <span className="text-[10.5px] font-medium text-foreground/90 whitespace-nowrap tracking-tight">{text}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Animated counter
   ───────────────────────────────────────────── */
function Counter({ to, suffix = "", duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(to * eased * 10) / 10);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span className="tabular-nums">{v.toLocaleString(undefined, { maximumFractionDigits: 1 })}{suffix}</span>;
}

/* ─────────────────────────────────────────────
   AI Cortex — central holographic centerpiece
   ───────────────────────────────────────────── */
function AICortex() {
  const [score, setScore] = useState(72);
  useEffect(() => {
    const id = setInterval(() => setScore(s => Math.max(68, Math.min(96, s + Math.round((Math.random() - 0.4) * 3)))), 1900);
    return () => clearInterval(id);
  }, []);

  const r = 58, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="relative w-full max-w-[440px] mx-auto">
      {/* outer iridescent halo */}
      <div
        className="absolute inset-0 -m-10 rounded-[3rem] blur-3xl opacity-80"
        style={{
          background:
            "conic-gradient(from 90deg at 50% 50%, hsl(217 91% 60% / 0.35), hsl(260 85% 65% / 0.25), hsl(190 90% 60% / 0.25), hsl(217 91% 60% / 0.35))",
        }}
        aria-hidden
      />

      <div className="relative rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-background/85 to-background/40 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_30px_90px_-24px_rgba(59,130,246,0.55)] overflow-hidden">
        {/* HUD corner brackets */}
        {[
          "top-2 left-2 border-t border-l",
          "top-2 right-2 border-t border-r",
          "bottom-2 left-2 border-b border-l",
          "bottom-2 right-2 border-b border-r",
        ].map((p) => (
          <span key={p} className={`pointer-events-none absolute ${p} h-3 w-3 border-primary/50`} aria-hidden />
        ))}

        {/* scanline */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent"
          animate={{ y: [0, 320, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Status bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/65 font-semibold">Kairo Cortex · Online</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-background/40 px-2 py-0.5 text-[9.5px] tracking-wider text-foreground/55 uppercase">
            <Radio className="h-2.5 w-2.5 text-primary/80" /> Realtime
          </div>
        </div>

        {/* Core: score + sparkline */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <svg width="136" height="136" className="-rotate-90">
              <defs>
                <linearGradient id="cortexRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(190 90% 65%)" />
                  <stop offset="55%" stopColor="hsl(217 91% 65%)" />
                  <stop offset="100%" stopColor="hsl(260 85% 72%)" />
                </linearGradient>
              </defs>
              {/* faint ticks */}
              {Array.from({ length: 60 }).map((_, i) => {
                const a = (i / 60) * Math.PI * 2;
                const inner = 64, outer = i % 5 === 0 ? 72 : 69;
                return (
                  <line
                    key={i}
                    x1={68 + Math.cos(a) * inner} y1={68 + Math.sin(a) * inner}
                    x2={68 + Math.cos(a) * outer} y2={68 + Math.sin(a) * outer}
                    stroke="hsl(var(--border))" strokeOpacity={i % 5 === 0 ? 0.6 : 0.25} strokeWidth="1"
                  />
                );
              })}
              <circle cx="68" cy="68" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="5" opacity="0.35" />
              <motion.circle
                cx="68" cy="68" r={r} fill="none" stroke="url(#cortexRing)" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={c}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ filter: "drop-shadow(0 0 8px hsl(217 91% 60% / 0.7))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={score}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="text-[2rem] font-bold text-foreground tabular-nums leading-none"
                style={{ textShadow: "0 0 24px hsl(217 91% 60% / 0.55)" }}
              >{score}</motion.span>
              <span className="mt-1 text-[9px] text-foreground/55 uppercase tracking-[0.18em]">AI Score</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[9.5px] uppercase tracking-[0.16em] text-foreground/55 mb-1">
              <span>Revenue forecast</span>
              <span className="text-emerald-400 font-bold">
                +<Counter to={18.4} suffix="%" />
              </span>
            </div>
            <svg viewBox="0 0 180 60" className="w-full h-14">
              <defs>
                <linearGradient id="cortexSpark" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%"   stopColor="hsl(142 71% 55%)" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                d="M0,46 L20,42 L40,44 L60,32 L80,34 L100,22 L120,26 L140,12 L160,18 L180,6"
                fill="none" stroke="hsl(142 71% 60%)" strokeWidth="2" strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px hsl(142 71% 55% / 0.6))" }}
              />
              <path d="M0,46 L20,42 L40,44 L60,32 L80,34 L100,22 L120,26 L140,12 L160,18 L180,6 L180,60 L0,60 Z" fill="url(#cortexSpark)" />
            </svg>
            <div className="flex items-center justify-between text-[9px] text-foreground/40 uppercase tracking-wider">
              <span>7d trend</span>
              <span className="inline-flex items-center gap-1"><Waves className="h-2.5 w-2.5" /> stable</span>
            </div>
          </div>
        </div>

        {/* Signal grid */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          {[
            { label: "Optimization signals", value: "12 active",  icon: Cpu },
            { label: "Predicted uplift",     value: "+18.4%",     icon: TrendingUp },
            { label: "Automations",          value: "7 running",  icon: Zap },
            { label: "Integrations",         value: "Healthy",    icon: ShieldCheck },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="group relative rounded-lg border border-white/5 bg-background/40 px-2.5 py-2 flex items-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-primary/10 to-transparent" />
              <s.icon className="relative h-3.5 w-3.5 text-primary/85" />
              <div className="relative min-w-0">
                <div className="text-[8.5px] uppercase tracking-[0.14em] text-foreground/50 truncate">{s.label}</div>
                <div className="text-[11px] font-semibold text-foreground truncate">{s.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="mt-4">
          <div className="text-[9px] uppercase tracking-[0.16em] text-foreground/50 mb-1.5 flex items-center gap-1.5">
            <LineChart className="h-2.5 w-2.5" /> Behavioral heatmap
          </div>
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(28, minmax(0, 1fr))" }}>
            {Array.from({ length: 28 }).map((_, i) => {
              const intensity = Math.abs(Math.sin(i * 0.7) * 0.5 + Math.cos(i * 0.3) * 0.5);
              return (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0.3, opacity: 0 }}
                  animate={{ scaleY: 0.4 + intensity * 0.9, opacity: 0.45 + intensity * 0.55 }}
                  transition={{ delay: 0.8 + i * 0.02, duration: 0.6, repeat: Infinity, repeatType: "reverse", repeatDelay: 1.2 + Math.random() }}
                  className="h-5 rounded-sm origin-bottom"
                  style={{ background: `hsl(${217 - intensity * 90} 91% ${55 + intensity * 10}%)` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Orbital SVG circuit traces (decorative)
   ───────────────────────────────────────────── */
function CircuitOrbits() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 600"
      className="absolute inset-0 h-full w-full pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="orbitStroke" x1="0" x2="1">
          <stop offset="0%" stopColor="hsl(217 91% 65%)" stopOpacity="0" />
          <stop offset="50%" stopColor="hsl(217 91% 65%)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="hsl(260 85% 70%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[180, 230, 280].map((rad, i) => (
        <g key={rad}>
          <circle
            cx="300" cy="300" r={rad}
            fill="none"
            stroke="url(#orbitStroke)"
            strokeWidth="1"
            strokeDasharray={`${rad * 0.6} ${rad * 1.5}`}
            opacity={0.6}
          >
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from={`0 300 300`}
              to={`${i % 2 === 0 ? 360 : -360} 300 300`}
              dur={`${40 + i * 14}s`}
              repeatCount="indefinite"
            />
          </circle>
          {/* traveling node */}
          <circle r="2.5" fill="hsl(217 91% 70%)">
            <animateMotion dur={`${10 + i * 4}s`} repeatCount="indefinite" rotate="auto">
              <mpath xlinkHref={`#orbitPath${i}`} />
            </animateMotion>
          </circle>
          <path id={`orbitPath${i}`} d={`M ${300 - rad},300 a ${rad},${rad} 0 1,1 ${rad * 2},0 a ${rad},${rad} 0 1,1 -${rad * 2},0`} fill="none" />
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Bottom live signals marquee
   ───────────────────────────────────────────── */
const tickerItems = [
  { tag: "AUDIT",     text: "homepage scored 82 — 3 quick wins surfaced" },
  { tag: "SIMULATE",  text: "shopper persona “price-sensitive” detected drop-off at PDP" },
  { tag: "OPTIMIZE",  text: "hero CTA contrast +14% — uplift predicted" },
  { tag: "EXECUTE",   text: "draft email flow ready for merchant approval" },
  { tag: "MONITOR",   text: "checkout latency improved by 380ms" },
  { tag: "INSIGHT",   text: "Kairo flagged inventory risk on 2 SKUs" },
];

function SignalsTicker() {
  return (
    <div className="relative w-full overflow-hidden border-y border-white/15 bg-background">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background via-background/90 to-transparent z-10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background via-background/90 to-transparent z-10"
        aria-hidden
      />
      <div
        className="flex gap-12 py-3.5 whitespace-nowrap animate-[heroMarquee_90s_linear_infinite]"
        style={{ willChange: "transform", transform: "translate3d(0,0,0)", backfaceVisibility: "hidden" }}
      >
        {[...tickerItems, ...tickerItems, ...tickerItems].map((it, i) => (
          <div key={i} className="inline-flex items-center gap-2.5 text-[13.5px] leading-none text-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/50 bg-primary/20 px-2 py-1 text-[10.5px] uppercase tracking-[0.2em] text-primary font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))] animate-pulse" />
              {it.tag}
            </span>
            <span className="font-medium text-foreground/95">{it.text}</span>
            <span className="mx-2 text-primary/40">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main hero
   ───────────────────────────────────────────── */
export default function CinematicHero({ url, setUrl, onSubmit, isAnalyzing }: CinematicHeroProps) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  // Parallax mouse tracking
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });
  const sxSm = useSpring(mx, { stiffness: 40, damping: 20, mass: 0.8 });
  const sySm = useSpring(my, { stiffness: 40, damping: 20, mass: 0.8 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    mx.set(x * 26);
    my.set(y * 20);
  };

  return (
    <section
      onMouseMove={handleMouse}
      className="relative overflow-hidden isolate"
      style={{ minHeight: "min(94vh, 920px)" }}
    >
      {/* ─── Background layers ─── */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, hsl(217 91% 22% / 0.55), transparent 60%)," +
            "radial-gradient(ellipse 70% 55% at 85% 90%, hsl(260 75% 30% / 0.45), transparent 60%)," +
            "radial-gradient(ellipse 60% 45% at 60% 50%, hsl(190 80% 25% / 0.20), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-background/45" />

      {/* Moving neural grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.32] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,black_38%,transparent_100%)]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(217 91% 60% / 0.16) 1px, transparent 1px), linear-gradient(90deg, hsl(217 91% 60% / 0.16) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          animation: reduced ? undefined : "heroGridShift 22s linear infinite",
        }}
      />

      {/* Subtle grain */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.045] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.85'/></svg>\")",
        }}
      />

      <style>{`
        @keyframes heroGridShift {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 56px 56px, 56px 56px; }
        }
        @keyframes heroSweep {
          0%, 100% { transform: translateX(-120%); opacity: 0; }
          40%, 60% { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        @keyframes heroMarquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-33.333%, 0, 0); }
        }
        @keyframes heroKineticShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes heroBorder {
          to { --angle: 360deg; }
        }
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
      `}</style>

      {/* Neural canvas */}
      <div className="absolute inset-0 -z-10 opacity-75">
        <NeuralNetwork />
      </div>

      {/* Aurora blobs */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-24 h-[560px] w-[560px] rounded-full bg-primary/[0.20] blur-[130px]"
        animate={{ x: [0, 30, 0], y: [0, 18, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 -right-24 h-[560px] w-[560px] rounded-full bg-violet-500/[0.16] blur-[130px]"
        animate={{ x: [0, -24, 0], y: [0, -18, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/3 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-400/[0.07] blur-[110px]"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ─── Content grid ─── */}
      <div className="container relative max-w-7xl px-4 sm:px-6 pt-16 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-[1.08fr_1fr] gap-10 sm:gap-12 items-center">

          {/* LEFT — message + CTA */}
          <div className="relative z-10 text-center lg:text-left">
            {/* eyebrow */}
            <motion.div
              variants={reveal} initial="hidden" animate="visible" custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] backdrop-blur-md pl-1 pr-3.5 py-1"
            >
              <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.2em] text-primary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                New
              </span>
              <span className="text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-primary via-violet-400 to-cyan-300 bg-clip-text text-transparent">
                AI-Assisted Commerce Intelligence
              </span>
            </motion.div>

            {/* headline */}
            <motion.h1
              variants={reveal} initial="hidden" animate="visible" custom={1}
              className="mt-5 sm:mt-6 text-[clamp(1.95rem,7.4vw,2.6rem)] leading-[1.06] sm:text-5xl md:text-6xl lg:text-[4.5rem] lg:leading-[1.0] font-extrabold tracking-[-0.02em] text-foreground"
              style={{ textWrap: "balance" as any }}
            >
              <motion.span variants={reveal} custom={1.2} className="block">The Operating System</motion.span>
              <motion.span variants={reveal} custom={1.6} className="block w-full text-center lg:text-left">
                <span className="block lg:inline">for </span>
                <span className="block lg:inline-block lg:align-baseline">
                  <KineticWord />
                </span>
              </motion.span>
              <motion.span variants={reveal} custom={2.0} className="block">
                Shopify Growth<span className="text-primary">.</span>
              </motion.span>
            </motion.h1>

            <motion.p
              variants={reveal} initial="hidden" animate="visible" custom={3}
              className="mt-5 sm:mt-6 max-w-xl mx-auto lg:mx-0 text-[15px] sm:text-lg text-foreground/70 leading-relaxed px-1 sm:px-0"
            >
              Audit, simulate, and optimize every pixel of your store. Kairo drafts the moves —
              <span className="text-foreground/95 font-medium"> you approve, automate, and watch revenue compound.</span>
            </motion.p>

            {/* Command-bar URL input */}
            <motion.form
              variants={reveal} initial="hidden" animate="visible" custom={4}
              onSubmit={onSubmit}
              className="mt-7 relative max-w-xl mx-auto lg:mx-0"
            >
              <div className="relative group">
                {/* conic border halo */}
                <div
                  className="absolute -inset-[1.5px] rounded-2xl opacity-60 group-focus-within:opacity-100 blur-[1.5px] transition"
                  style={{
                    background:
                      "conic-gradient(from var(--angle, 0deg), hsl(217 91% 60% / 0.9), hsl(260 85% 70% / 0.6), hsl(190 90% 65% / 0.9), hsl(217 91% 60% / 0.9))",
                    animation: reduced ? undefined : "heroBorder 6s linear infinite",
                  }}
                  aria-hidden
                />
                <div className="relative flex items-center rounded-2xl bg-background/85 backdrop-blur-xl border border-white/10 overflow-hidden h-12 sm:h-14">
                  <div className="pl-3 sm:pl-4 pr-2 sm:pr-3 flex items-center gap-1.5 text-foreground/55 shrink-0 border-r border-white/10 h-full">
                    <Command className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline text-[10px] uppercase tracking-[0.18em] font-semibold">Audit</span>
                  </div>
                  <Search className="ml-2 sm:ml-3 h-4 w-4 text-foreground/40 shrink-0" />
                  <Input
                    type="url"
                    placeholder="your-store.myshopify.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 min-w-0 h-full pl-2 pr-3 bg-transparent border-0 focus-visible:ring-0 text-sm sm:text-base"
                  />
                  <kbd className="hidden sm:inline-flex mr-3 items-center gap-1 rounded-md border border-white/10 bg-background/60 px-1.5 py-0.5 text-[10px] font-mono text-foreground/55 shrink-0">
                    ↵
                  </kbd>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-foreground/45 text-center lg:text-left">
                Free · No signup · Results in ~12 seconds
              </p>
            </motion.form>

            {/* CTAs */}
            <motion.div
              variants={reveal} initial="hidden" animate="visible" custom={5}
              className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center lg:justify-start"
            >
              <Button
                type="button"
                onClick={onSubmit as any}
                disabled={isAnalyzing}
                size="lg"
                className="relative h-12 px-7 rounded-xl font-semibold shadow-[0_10px_36px_-8px_hsl(217_91%_60%/0.7)] hover:shadow-[0_16px_48px_-8px_hsl(217_91%_60%/0.9)] transition-all overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-violet-500 to-primary bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />
                <span
                  aria-hidden
                  className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent skew-x-12"
                  style={{ animation: reduced ? undefined : "heroSweep 3.5s ease-in-out infinite" }}
                />
                <span className="relative flex items-center gap-2 text-primary-foreground">
                  {isAnalyzing ? (
                    <><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> Running…</>
                  ) : (
                    <>Run Free Audit <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                  )}
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/auto-pilot")}
                className="h-12 px-6 rounded-xl border-white/15 bg-background/40 backdrop-blur-md hover:bg-background/70 hover:border-primary/40 transition-all gap-2"
              >
                <Play className="h-4 w-4 text-primary" /> See Kairo in Action
              </Button>
            </motion.div>

            {/* Live stat row */}
            <motion.div
              variants={reveal} initial="hidden" animate="visible" custom={6}
              className="mt-8 grid grid-cols-3 max-w-xl mx-auto lg:mx-0 gap-2 sm:gap-3"
            >
              {[
                { v: 12480, suffix: "+", label: "Stores audited" },
                { v: 1.8,   suffix: "M", label: "AI signals processed" },
                { v: 27,    suffix: "%", label: "Avg. uplift surfaced" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/5 bg-background/30 backdrop-blur-md px-2.5 sm:px-3 py-2 sm:py-2.5 min-w-0">
                  <div className="text-base sm:text-xl font-bold text-foreground leading-none">
                    <Counter to={s.v} suffix={s.suffix} />
                  </div>
                  <div className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.14em] text-foreground/50 leading-tight">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — AI Cortex */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ x: sx, y: sy }}
            className="relative h-[420px] xs:h-[460px] sm:h-[540px] lg:h-[600px] mx-auto w-full max-w-[440px] sm:max-w-[540px]"
          >
            {/* Orbital circuits */}
            <CircuitOrbits />

            {/* Floating insight chips (counter-parallax) */}
            {insights.map((c, i) => (
              <InsightChip
                key={c.text}
                Icon={c.icon}
                text={c.text}
                tone={c.tone}
                dot={c.dot}
                pos={c.pos}
                delay={0.8 + i * 0.18}
                mx={i % 2 === 0 ? sxSm : sx}
                my={i % 2 === 0 ? sySm : sy}
              />
            ))}

            {/* Holographic rings */}
            <motion.div
              aria-hidden
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              <div className="h-[400px] w-[400px] rounded-full border border-primary/20 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            </motion.div>
            <motion.div
              aria-hidden
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: -360 }}
              transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            >
              <div className="h-[480px] w-[480px] rounded-full border border-violet-500/10" />
            </motion.div>

            {/* Centerpiece */}
            <div className="absolute inset-0 flex items-center justify-center">
              <AICortex />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Signals marquee */}
      <div className="relative">
        <SignalsTicker />
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background pointer-events-none" />
    </section>
  );
}
