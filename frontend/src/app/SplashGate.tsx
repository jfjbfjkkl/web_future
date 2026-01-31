"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function SplashGate({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true);
  const [rays, setRays] = useState<Array<{ top: number; left: number; duration: number; delay: number }>>([]);
  const [sparks, setSparks] = useState<Array<{ top: number; left: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storage = window.sessionStorage;
    const seen = storage.getItem("nexi-splash-seen") === "1";
    if (seen) {
      setShow(false);
      return;
    }
    const timer = setTimeout(() => {
      setShow(false);
      storage.setItem("nexi-splash-seen", "1");
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Precompute random positions client-side to keep SSR and hydration consistent.
    setRays(
      Array.from({ length: 28 }, (_, i) => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        duration: 2.2 + Math.random() * 0.8,
        delay: 0.1 * i,
      }))
    );

    setSparks(
      Array.from({ length: 20 }, (_, i) => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        duration: 1.6 + Math.random() * 0.9,
        delay: 0.15 * i,
      }))
    );
  }, []);

  return (
    <div className="relative">
      <AnimatePresence>
        {show && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#040712]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 overflow-hidden" aria-hidden>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(111,164,255,0.22),transparent_38%),radial-gradient(circle_at_82%_14%,rgba(255,204,102,0.18),transparent_34%),radial-gradient(circle_at_55%_72%,rgba(63,122,255,0.32),transparent_48%)]" />
              <motion.div
                className="absolute -left-1/3 top-0 h-full w-2/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-40%" }}
                animate={{ x: "120%" }}
                transition={{ duration: 2.8, delay: 0.5, ease: "easeInOut" }}
              />
              {rays.map((ray, i) => (
                <motion.span
                  key={i}
                  className="absolute h-[1px] w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  style={{
                    top: `${ray.top}%`,
                    left: `${ray.left}%`,
                    opacity: 0.45,
                  }}
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 40, opacity: [0, 0.8, 0] }}
                  transition={{ duration: ray.duration, delay: ray.delay, ease: "easeInOut", repeat: 0 }}
                />
              ))}
              {sparks.map((spark, i) => (
                <motion.span
                  key={`p-${i}`}
                  className="absolute h-1 w-1 rounded-full bg-white/70"
                  style={{
                    top: `${spark.top}%`,
                    left: `${spark.left}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 0.3] }}
                  transition={{ duration: spark.duration, delay: spark.delay, ease: "easeInOut" }}
                />
              ))}
            </div>

            <motion.div
              className="relative flex flex-col items-center gap-4 px-6 text-center"
              initial={{ opacity: 0, y: 26, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.div
                className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              >
                Nexi Shop
              </motion.div>

              <div className="relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent blur-sm"
                  initial={{ x: "-120%" }}
                  animate={{ x: "120%" }}
                  transition={{ duration: 1.8, delay: 0.4, ease: "easeInOut" }}
                />
                <motion.div
                  className="relative flex gap-1 text-3xl font-semibold text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] sm:text-4xl"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.04,
                        delayChildren: 0.3,
                      },
                    },
                  }}
                >
                  {"Welcome to Nexi Shop".split("").map((char, idx) => (
                    <motion.span
                      key={idx}
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="inline-block"
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.div>
              </div>

              <motion.div
                className="h-px w-32 rounded-full bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
              />

              <motion.div
                className="text-xs text-white/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
              >
                Expérience gaming premium en préparation...
              </motion.div>

              <motion.div
                className="relative mt-5 h-11 w-11 rounded-full border border-white/15 bg-white/5"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: [1, 1.06, 1] }}
                transition={{ duration: 1.6, delay: 1.0, ease: "easeInOut", repeat: 1, repeatType: "reverse" }}
              >
                <motion.span
                  className="absolute inset-0 rounded-full bg-cyan-400/25"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: [0, 0.35, 0], scale: [0.9, 1.2, 1.35] }}
                  transition={{ duration: 1.2, delay: 1.05, ease: "easeOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: show ? 0 : 1, y: show ? -40 : 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
}
