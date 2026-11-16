import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import garden from "@/assets/garden-path.webp.asset.json";
import couple from "@/assets/couple-walking.webp.asset.json";
import butterflyLg from "@/assets/butterfly-lg.webp.asset.json";
import { Butterfly } from "./Butterfly";

/**
 * Scenes 3–5. Mounted underneath the door the moment it is tapped.
 * The garden image (stage) never zooms or moves; only the couple and the butterfly animate.
 * Times are seconds from the door tap.
 */
const T = {
  coupleIn: 1.3,
  walk: 8.8,
  bfIn: 5.2,
  bfDur: 5.4, // butterfly flight until it fills the screen
  coverIn: 10.1,
  covered: 10.6,
  wingsOpen: 1.6,
};
const REDUCED = { covered: 2.6, fade: 0.9 };

const petals = Array.from({ length: 9 }, (_, i) => ({ x: (i * 37 + 7) % 100, d: 1.5 + (i % 5) * 1.1, s: 7 + (i % 3) * 3 }));
const fireflies = Array.from({ length: 10 }, (_, i) => ({ x: (i * 41 + 13) % 92 + 4, y: 35 + ((i * 29) % 45), d: `${-(i * 0.7)}s` }));

export function Journey({ onCovered, onDone }: { onCovered: () => void; onDone: () => void }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"garden" | "wings" | "fade">("garden");
  const cb = useRef({ onCovered, onDone });
  cb.current = { onCovered, onDone };
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const at = (s: number, fn: () => void) => timers.current.push(window.setTimeout(fn, s * 1000));
    if (reduce) {
      at(REDUCED.covered, () => { cb.current.onCovered(); setPhase("fade"); });
      at(REDUCED.covered + REDUCED.fade, () => cb.current.onDone());
    } else {
      at(T.covered, () => { cb.current.onCovered(); setPhase("wings"); });
      at(T.covered + T.wingsOpen + 0.3, () => cb.current.onDone());
    }
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, [reduce]);

  const skip = () => {
    timers.current.forEach(clearTimeout);
    cb.current.onCovered();
    cb.current.onDone();
  };

  if (phase === "wings") return <WingCover />;

  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-hidden bg-night"
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: REDUCED.fade }}
    >
      {/* soft extension of the same garden for wide screens — stays static */}
      <img src={garden.url} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl" />

      {/* STAGE: the garden at its original composition, never zoomed */}
      <div className="absolute left-1/2 top-1/2 aspect-[1088/1920] h-full -translate-x-1/2 -translate-y-1/2 overflow-hidden">
        <img src={garden.url} alt="Jalan setapak Secret Garden" className="absolute inset-0 h-full w-full object-cover" />

        {/* lantern & sunset glow breathing */}
        <div className="glow-pulse pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_40%,oklch(0.9_0.08_80/0.28),transparent_55%)]" />

        {/* fireflies */}
        {fireflies.map((f, i) => (
          <span key={i} className="sparkle absolute h-1 w-1 rounded-full bg-gold shadow-[0_0_8px_2px_oklch(0.85_0.1_85/0.7)]"
            style={{ left: `${f.x}%`, top: `${f.y}%`, animationDelay: f.d }} />
        ))}

        {/* THE COUPLE — walking away together along the path toward the gate */}
        <motion.div
          className="absolute h-[44%] aspect-[440/647]"
          style={{ x: "-50%", y: "-100%", transformOrigin: "50% 100%" }}
          initial={{ left: "46%", top: "106%", scale: 1, opacity: 0 }}
          animate={reduce
            ? { left: "52%", top: "84%", scale: 0.55, opacity: 1 }
            : { left: "56%", top: "73%", scale: 0.3, opacity: 1 }}
          transition={reduce
            ? { duration: 0.8 }
            : {
                left: { duration: T.walk, delay: T.coupleIn, ease: [0.3, 0.45, 0.45, 1] },
                top: { duration: T.walk, delay: T.coupleIn, ease: [0.3, 0.45, 0.45, 1] },
                scale: { duration: T.walk, delay: T.coupleIn, ease: [0.3, 0.45, 0.45, 1] },
                opacity: { duration: 1.4, delay: T.coupleIn },
              }}
        >
          {/* contact shadow grounds them on the stone path */}
          <div className="absolute -bottom-[2%] left-1/2 h-[7%] w-[90%] -translate-x-1/2 rounded-[50%] bg-night/60 blur-md" />
          <motion.img
            src={couple.url}
            alt="Kedua mempelai berjalan bersama"
            draggable={false}
            className="relative h-full w-full object-contain"
            style={{ filter: "brightness(0.8) contrast(0.95) saturate(0.88) sepia(0.14)", transformOrigin: "50% 100%" }}
            animate={reduce ? {} : { y: ["0%", "-1.3%", "0%"], rotate: [-0.6, 0.6, -0.6] }}
            transition={{ y: { duration: 0.62, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 1.24, repeat: Infinity, ease: "easeInOut" } }}
          />
          {/* warm rim light from the sunset ahead */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_10%,oklch(0.85_0.09_75/0.18),transparent_60%)] mix-blend-screen" />
        </motion.div>

        {/* falling burgundy petals */}
        {!reduce && petals.map((p, i) => (
          <motion.span key={i} className="absolute rounded-[60%_40%] bg-burgundy/80"
            style={{ left: `${p.x}%`, width: p.s, height: p.s * 0.7 }}
            initial={{ top: "-3%", rotate: 0, opacity: 0 }}
            animate={{ top: "103%", x: [0, 24, -16, 8], rotate: 300, opacity: [0, 0.9, 0.9, 0] }}
            transition={{ duration: 7, delay: p.d, ease: "linear" }} />
        ))}

        {/* THE BUTTERFLY — arrives, circles the couple, then flies to the viewer */}
        {!reduce && (
          <motion.div
            className="absolute z-10 w-[11%]"
            style={{ x: "-50%", y: "-50%" }}
            initial={{ left: "110%", top: "28%", scale: 0.7, rotate: -25, opacity: 0 }}
            animate={{
              left: ["110%", "86%", "64%", "51%", "60%", "50%", "50%"],
              top: ["28%", "37%", "52%", "55%", "52%", "48%", "50%"],
              rotate: [-25, -12, 12, -14, 8, 0, 0],
              scale: [0.7, 0.8, 0.9, 0.85, 1, 4.5, 42],
              opacity: [0, 1, 1, 1, 1, 1, 1],
            }}
            transition={{ duration: T.bfDur, delay: T.bfIn, times: [0, 0.18, 0.4, 0.54, 0.67, 0.84, 1], ease: "easeInOut" }}
          >
            <Butterfly size="100%" slow />
          </motion.div>
        )}

        {/* subtle cinematic vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,oklch(0.16_0.04_260/0.55))]" />
      </div>

      {/* camera-cover: the wings fill the lens before the scene changes */}
      {!reduce && (
        <motion.div className="pointer-events-none absolute inset-0 z-20"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: T.covered - T.coverIn, delay: T.coverIn, ease: "easeIn" }}>
          <WingHalves />
        </motion.div>
      )}

      <button onClick={skip} className="btn-ghost-gold absolute bottom-6 right-6 z-30 px-4 py-1.5 text-[11px] uppercase tracking-widest backdrop-blur">
        Lewati
      </button>
    </motion.div>
  );
}

/** Two halves of the butterfly at full-screen size. Static (cover) state. */
function WingHalves({ open = false }: { open?: boolean }) {
  const t = { duration: T.wingsOpen, ease: [0.6, 0, 0.3, 1] as const };
  return (
    <div className="absolute inset-0 flex" style={{ perspective: 1400 }}>
      <motion.div className="relative h-full w-1/2 overflow-hidden bg-wine-grad"
        style={{ transformOrigin: "100% 50%" }}
        animate={open ? { rotateY: 92, x: "-8%", opacity: [1, 1, 0] } : {}}
        transition={{ ...t, opacity: { duration: T.wingsOpen, times: [0, 0.7, 1] } }}>
        <img src={butterflyLg.url} alt="" className="absolute right-0 top-[38%] w-[210vmax] max-w-none -translate-y-1/2 translate-x-[57%]" />
      </motion.div>
      <motion.div className="relative h-full w-1/2 overflow-hidden bg-wine-grad"
        style={{ transformOrigin: "0% 50%" }}
        animate={open ? { rotateY: -92, x: "8%", opacity: [1, 1, 0] } : {}}
        transition={{ ...t, opacity: { duration: T.wingsOpen, times: [0, 0.7, 1] } }}>
        <img src={butterflyLg.url} alt="" className="absolute left-0 top-[38%] w-[210vmax] max-w-none -translate-x-[57%] -translate-y-1/2" />
      </motion.div>
      <motion.div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-gold-grad shadow-[0_0_24px_6px_oklch(0.85_0.09_82/0.45)]"
        animate={open ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.5 }} />
    </div>
  );
}

/** Scene 5: the wings lift away to reveal the invitation underneath. */
function WingCover() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <WingHalves open />
    </div>
  );
}
