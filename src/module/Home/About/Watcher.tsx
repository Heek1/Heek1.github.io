"use client";

import { useEffect, useRef } from "react";
import styles from "./Watcher.module.css";

/*
 * A pair of eyes drawn from a few thousand dots.
 * Each frame every dot asks "what part of the eye am I over?" (sclera, iris, pupil, lid or background)
 * and gets a colour bucket and a size from that. Dots sit on springs, so the cursor and clicks can push them.
 */

const COLORS = [
  "rgba(150, 165, 155, 0.26)", // 0 background
  "rgba(48, 209, 88, 0.55)", // 1 background near the cursor
  "#f2f5f2", // 2-5 sclera, light to shaded
  "#d6ddd7",
  "#adb7af",
  "#7f8a82",
  "#0f3d22", // 6-11 iris, outer to inner
  "#15602f",
  "#1d8240",
  "#25a24f",
  "#30d158",
  "#86f0a6",
  "#071a0d", // 12 pupil
  "#ffffff", // 13 highlight
  "rgba(48, 209, 88, 0.85)", // 14 lid line
  "rgba(214, 224, 216, 0.85)", // 15 brows
];
const BUCKETS = COLORS.length;

const SPRING = 0.07;
const DAMPING = 0.8;
const BLINK_MS = 240;
const WAKE_MS = 900;

type Pulse = { x: number; y: number; start: number };

export default function Watcher() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Geometry (CSS pixels), rebuilt on resize.
    let size = 0;
    let gap = 0;
    let count = 0;
    let homeX = new Float32Array(0);
    let homeY = new Float32Array(0);
    let posX = new Float32Array(0);
    let posY = new Float32Array(0);
    let velX = new Float32Array(0);
    let velY = new Float32Array(0);
    let bucketOf = new Uint8Array(0);
    let sizeOf = new Float32Array(0);

    // Pointer state, in canvas coordinates.
    let pointerX = 0;
    let pointerY = 0;
    let pointerInside = false;
    let hasPointer = false;
    let overInteractive = false;
    let lastMove = -Infinity;

    // Gaze, lids and pupils.
    let lookX = 0;
    let lookY = 0;
    let targetX = 0;
    let targetY = 0;
    let nextWander = 0;
    let dilation = 0.25;
    let squint = 1;
    let squintUntil = 0;
    let blinkStart = -1;
    let nextBlink = 0;
    let wakeStart = -1;

    const pulses: Pulse[] = [];
    let rafId: number | null = null;
    let visible = false;

    const build = () => {
      size = stage.clientWidth || 1;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      gap = size / 62;
      const radius = size * 0.49;
      const center = size / 2;
      const xs: number[] = [];
      const ys: number[] = [];
      const rowStep = gap * 0.866;
      let row = 0;
      for (let y = -radius; y <= radius; y += rowStep, row++) {
        const offset = row % 2 ? gap / 2 : 0;
        for (let x = -radius + offset; x <= radius; x += gap) {
          if (x * x + y * y <= radius * radius) {
            xs.push(center + x);
            ys.push(center + y);
          }
        }
      }
      count = xs.length;
      homeX = Float32Array.from(xs);
      homeY = Float32Array.from(ys);
      posX = Float32Array.from(xs);
      posY = Float32Array.from(ys);
      velX = new Float32Array(count);
      velY = new Float32Array(count);
      bucketOf = new Uint8Array(count);
      sizeOf = new Float32Array(count);
    };

    const random = (min: number, max: number) => min + Math.random() * (max - min);

    // How open the lids are: wake-up, blinks and the squint after a click.
    const lidOpenness = (now: number) => {
      if (reducedMotion.matches) return 1;
      let open = 1;
      if (wakeStart >= 0) {
        const t = (now - wakeStart) / WAKE_MS;
        if (t < 1) open = Math.min(open, t < 0.35 ? 0.04 : easeOut((t - 0.35) / 0.65));
      }
      if (blinkStart < 0 && now >= nextBlink) blinkStart = now;
      if (blinkStart >= 0) {
        const t = (now - blinkStart) / BLINK_MS;
        if (t >= 1) {
          blinkStart = -1;
          // Sometimes blink twice.
          nextBlink = now + (Math.random() < 0.2 ? 140 : random(2600, 6000));
        } else {
          open = Math.min(open, t < 0.4 ? 1 - t / 0.4 : (t - 0.4) / 0.6);
        }
      }
      squint += ((now < squintUntil ? 0.42 : 1) - squint) * 0.18;
      return Math.max(0.04, Math.min(open, squint));
    };

    const updateGaze = (now: number) => {
      const center = size / 2;
      if (hasPointer && now - lastMove < 3500) {
        targetX = pointerX;
        targetY = pointerY;
      } else if (!reducedMotion.matches && now >= nextWander) {
        // Nobody is moving the mouse: look around on its own.
        targetX = center + random(-0.9, 0.9) * size;
        targetY = center + random(-0.6, 0.6) * size;
        nextWander = now + random(900, 2400);
      }
      const dx = targetX - center;
      const dy = targetY - center;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / (size * 0.55));
      const goalX = (dx / dist) * reach;
      const goalY = (dy / dist) * reach;
      const ease = reducedMotion.matches ? 1 : 0.16;
      lookX += (goalX - lookX) * ease;
      lookY += (goalY - lookY) * ease;

      const goalDilation = overInteractive ? 1 : pointerInside ? 0.6 : 0.25;
      dilation += (goalDilation - dilation) * (reducedMotion.matches ? 1 : 0.08);

      // Turn the whole "head" a little towards the gaze.
      stage.style.setProperty("--turn-y", `${(lookX * 9).toFixed(2)}deg`);
      stage.style.setProperty("--turn-x", `${(-lookY * 7).toFixed(2)}deg`);
    };

    const shade = (open: number) => {
      const center = size / 2;
      const radius = size * 0.49;
      const eyeA = size * 0.19;
      const eyeB0 = size * 0.135;
      const eyeB = eyeB0 * open;
      const irisR = size * 0.094;
      const pupilR = irisR * (0.3 + 0.32 * dilation);
      const glowR = size * 0.2;
      // Brows rise when you point at something clickable and drop when the eyes squint.
      const surprise = Math.max(0, dilation - 0.6) / 0.4;
      const frown = 1 - squint;
      const browLift = size * (0.035 * surprise - 0.05 * frown) + lookY * size * 0.012;
      const browThickness = gap * 1.05;

      const eyes = [-1, 1].map((side) => {
        const ex = center + side * size * 0.215;
        const ey = center + size * 0.03;
        const ix = ex + lookX * (eyeA - irisR * 0.9);
        const iy = ey + lookY * Math.max(0, eyeB0 - irisR * 0.85);
        // Brow: a gentle arch above the eye; the outer end tilts down when frowning.
        const browY = ey - eyeB0 - size * 0.075 - browLift;
        return { side, ex, ey, ix, iy, browY };
      });

      for (let i = 0; i < count; i++) {
        const hx = homeX[i];
        const hy = homeY[i];
        const edge = Math.min(1, (radius - Math.hypot(hx - center, hy - center)) / (radius * 0.3));
        let bucket = 0;
        let s = 0.17;

        let inEye = false;
        for (const eye of eyes) {
          const nx = (hx - eye.ex) / eyeA;
          const ny = (hy - eye.ey) / Math.max(eyeB, 0.001);
          const e = nx * nx + ny * ny;
          if (eyeB < gap * 0.9) {
            // Closed: a single lid line.
            if (Math.abs(hy - eye.ey) < gap * 0.6 && Math.abs(nx) < 1) {
              bucket = 14;
              s = 0.8;
              inEye = true;
            }
            continue;
          }
          if (e >= 1) continue;
          inEye = true;
          if (e > 0.84) {
            bucket = 14;
            s = 0.78;
            break;
          }
          const px = hx - eye.ix;
          const py = hy - eye.iy;
          const d = Math.hypot(px, py);
          if (d < pupilR) {
            const glint = Math.hypot(px + pupilR * 0.38, py + pupilR * 0.42) < pupilR * 0.42;
            bucket = glint ? 13 : 12;
            s = glint ? 0.95 : 0.22;
          } else if (d < irisR) {
            const t = (d - pupilR) / (irisR - pupilR);
            const angle = Math.atan2(py, px);
            const fibre = 0.5 + 0.5 * Math.sin(angle * 11 + t * 7);
            bucket = 6 + Math.max(0, Math.min(5, Math.round((1 - t) * 4 + fibre * 1.4)));
            s = t > 0.86 ? 0.62 : 0.55 + 0.42 * fibre * (1 - t * 0.4);
          } else {
            const depth = e + Math.max(0, -ny) * 0.3;
            bucket = 2 + Math.min(3, Math.floor(depth * 3.2));
            s = 0.92 - depth * 0.32;
          }
          break;
        }

        if (!inEye) {
          for (const eye of eyes) {
            const bx = (hx - eye.ex) / (eyeA * 0.95);
            if (Math.abs(bx) > 1) continue;
            // Inner end sits lower when frowning, outer end higher when surprised.
            const tilt = eye.side * bx * size * (0.03 * frown - 0.012 * surprise);
            const curveY = eye.browY + bx * bx * size * 0.035 - tilt;
            const taper = 1 - Math.abs(bx) * 0.45;
            if (Math.abs(hy - curveY) < browThickness * taper) {
              bucket = 15;
              s = 0.7 * taper + 0.2;
              inEye = true;
              break;
            }
          }
        }

        if (!inEye && pointerInside && !reducedMotion.matches) {
          const glow = 1 - Math.hypot(posX[i] - pointerX, posY[i] - pointerY) / glowR;
          if (glow > 0.25) {
            bucket = 1;
            s = 0.18 + 0.4 * glow;
          }
        }

        bucketOf[i] = bucket;
        sizeOf[i] = s * Math.max(0, edge);
      }
    };

    const step = (now: number) => {
      const pushR = size * 0.13;
      const pushR2 = pushR * pushR;
      const push = size * 0.012;
      for (let p = pulses.length - 1; p >= 0; p--) {
        if ((now - pulses[p].start) * size * 0.0011 > size * 1.4) pulses.splice(p, 1);
      }
      for (let i = 0; i < count; i++) {
        let fx = (homeX[i] - posX[i]) * SPRING;
        let fy = (homeY[i] - posY[i]) * SPRING;
        if (pointerInside) {
          const dx = posX[i] - pointerX;
          const dy = posY[i] - pointerY;
          const d2 = dx * dx + dy * dy;
          if (d2 < pushR2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / pushR) ** 2 * push;
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
        }
        for (const pulse of pulses) {
          const age = now - pulse.start;
          const ring = age * size * 0.0011;
          const dx = posX[i] - pulse.x;
          const dy = posY[i] - pulse.y;
          const d = Math.hypot(dx, dy) || 1;
          const band = 1 - Math.abs(d - ring) / (size * 0.06);
          if (band > 0) {
            const f = band * size * 0.01 * Math.max(0, 1 - age / 1100);
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
        }
        velX[i] = (velX[i] + fx) * DAMPING;
        velY[i] = (velY[i] + fy) * DAMPING;
        posX[i] += velX[i];
        posY[i] += velY[i];
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const base = gap * 0.46;
      for (let b = 0; b < BUCKETS; b++) {
        ctx.beginPath();
        let any = false;
        for (let i = 0; i < count; i++) {
          if (bucketOf[i] !== b || sizeOf[i] <= 0.02) continue;
          const r = base * sizeOf[i];
          ctx.moveTo(posX[i] + r, posY[i]);
          ctx.arc(posX[i], posY[i], r, 0, Math.PI * 2);
          any = true;
        }
        if (any) {
          ctx.fillStyle = COLORS[b];
          ctx.fill();
        }
      }
    };

    const render = (now: number) => {
      updateGaze(now);
      shade(lidOpenness(now));
      if (!reducedMotion.matches) step(now);
      draw();
    };

    const frame = (now: number) => {
      rafId = null;
      render(now);
      if (visible && !reducedMotion.matches) rafId = requestAnimationFrame(frame);
    };

    const requestFrame = () => {
      if (rafId === null && visible) rafId = requestAnimationFrame(frame);
    };

    const stop = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scale = size / (rect.width || 1);
      pointerX = (event.clientX - rect.left) * scale;
      pointerY = (event.clientY - rect.top) * scale;
      const dx = pointerX - size / 2;
      const dy = pointerY - size / 2;
      pointerInside = dx * dx + dy * dy < (size * 0.5) ** 2;
      hasPointer = true;
      lastMove = performance.now();
      if (reducedMotion.matches) requestFrame();
    };

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      overInteractive = !!target?.closest?.("a, button, [role='button']");
    };

    const onPointerLeaveWindow = () => {
      pointerInside = false;
      overInteractive = false;
    };

    const onPointerDown = (event: PointerEvent) => {
      onPointerMove(event);
      const now = performance.now();
      pulses.push({ x: pointerX, y: pointerY, start: now });
      if (pulses.length > 4) pulses.shift();
      squintUntil = now + 420;
      requestFrame();
    };

    const intersection = new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting && !document.hidden;
      if (visible && !wasVisible && wakeStart < 0 && !reducedMotion.matches) {
        // First time on screen: the eyes open.
        wakeStart = performance.now();
        nextBlink = wakeStart + WAKE_MS + random(1800, 3500);
      }
      if (visible) requestFrame();
      else stop();
    });

    const onVisibility = () => {
      if (document.hidden) {
        visible = false;
        stop();
      } else {
        const rect = canvas.getBoundingClientRect();
        visible = rect.bottom > 0 && rect.top < window.innerHeight;
        requestFrame();
      }
    };

    const resize = new ResizeObserver(() => {
      build();
      requestFrame();
    });

    build();
    resize.observe(stage);
    intersection.observe(canvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeaveWindow);
    canvas.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("visibilitychange", onVisibility);
    const onMotionChange = () => requestFrame();
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      stop();
      resize.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.documentElement.removeEventListener("pointerleave", onPointerLeaveWindow);
      canvas.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <figure className={styles.wrap}>
      <div className={styles.stage} ref={stageRef}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          role="img"
          aria-label="A pair of eyes made of dots that follows your cursor"
        />
      </div>
      <figcaption className={styles.hint}>It follows your cursor. Click to poke it.</figcaption>
    </figure>
  );
}

function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}
