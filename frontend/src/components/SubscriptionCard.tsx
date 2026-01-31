"use client";

import Image, { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useCartStore } from "../store/cart";

type Subscription = {
  id: string;
  title: string;
  price: number;
  diamonds: number;
  period: "week" | "month";
  badge?: string;
  discount?: number;
  accentColor: "blue" | "purple-gold";
};

const formatPrice = (price: number) =>
  `${price.toLocaleString("fr-FR")} FCFA`;

const accentColors = {
  blue: {
    gradient: "from-[rgba(59,130,246,0.96)] via-[rgba(37,99,235,0.97)] to-[rgba(29,78,216,0.98)]",
    glow: "shadow-[0_14px_32px_-10px_rgba(59,130,246,0.45),0_0_20px_rgba(37,99,235,0.28)]",
    border: "rgba(59,130,246,0.28)",
    ring: "rgba(59,130,246,0.12)",
  },
  "purple-gold": {
    gradient: "from-[rgba(168,85,247,0.96)] via-[rgba(147,51,234,0.97)] to-[rgba(126,34,206,0.98)]",
    glow: "shadow-[0_14px_32px_-10px_rgba(168,85,247,0.45),0_0_20px_rgba(217,119,6,0.28)]",
    border: "rgba(168,85,247,0.28)",
    ring: "rgba(168,85,247,0.12)",
  },
};

export function SubscriptionCard({
  subscription,
  image,
  onAdd,
}: {
  subscription: Subscription;
  image: StaticImageData;
  onAdd?: (coords: { x: number; y: number }) => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const imgRef = useRef<HTMLDivElement | null>(null);
  const [pulse, setPulse] = useState(0);
  const colors = accentColors[subscription.accentColor];

  return (
    <motion.article
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group relative h-full overflow-hidden rounded-2xl bg-[conic-gradient(from_120deg_at_50%_50%,rgba(24,31,58,0.38),rgba(90,200,255,0.28),rgba(255,155,63,0.32),rgba(255,95,66,0.34),rgba(24,31,58,0.38))] p-[1px] shadow-[0_12px_28px_rgba(0,0,0,0.24)] animate-[borderShift_12s_linear_infinite]"
      style={{
        boxShadow: `0 12px 28px rgba(0,0,0,0.24), 0 0 0 1px ${colors.border}`,
      }}
    >
      <div className="glass-panel relative flex h-full flex-col overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_20%_20%,rgba(90,200,255,0.03),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,155,63,0.04),transparent_40%),rgba(255,255,255,0.015)] p-6 transition-shadow duration-200 group-hover:shadow-[0_0_0_1px_rgba(255,155,63,0.12)]"
        style={{
          boxShadow: `0 0 0 1px ${colors.ring}`,
        }}
      >
        <div className="absolute inset-0 rounded-[22px] bg-gradient-to-b from-white/8 via-white/6 to-black/40" aria-hidden />

        <div className="relative flex w-full items-center justify-between text-sm font-semibold text-white/85">
          <span className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            {subscription.title}
          </span>
          {subscription.badge ? (
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold text-white/90"
              style={{
                background: subscription.accentColor === "blue" 
                  ? "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(37,99,235,0.35))"
                  : "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(217,119,6,0.35))",
              }}
            >
              {subscription.badge}
            </span>
          ) : null}
        </div>

        <div className="relative mt-3 flex w-full flex-1 items-center justify-center">
          <div
            ref={imgRef}
            className="relative h-40 w-full max-w-[240px] overflow-hidden rounded-xl bg-gradient-to-b from-white/8 to-black/70 ring-1 ring-white/6"
          >
            <Image
              src={image}
              alt={subscription.title}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              sizes="240px"
            />
          </div>
        </div>

        <div className="relative mt-4 flex w-full items-center justify-between text-white">
          <div>
            <p className="text-lg font-semibold leading-tight">{formatPrice(subscription.price)}</p>
            <p className="text-xs text-white/60">Renouvellement automatique</p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/70">
            Abonnement
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.94 }}
          animate={{ scale: pulse ? [1, 1.03, 1] : 1 }}
          onClick={() => {
            addItem({
              id: subscription.id,
              title: subscription.title,
              price: subscription.price,
              image: image.src,
            });
            setPulse((p) => p + 1);
            const rect = imgRef.current?.getBoundingClientRect();
            if (rect && onAdd) {
              onAdd({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            }
          }}
          className={`relative mt-5 w-full overflow-hidden rounded-lg bg-gradient-to-r ${colors.gradient} px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(0,0,0,0.35)] transition hover:translate-y-[-1px] ${colors.glow} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60`}
        >
          <span className="relative z-10">S&apos;abonner</span>
          <span className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.span
              key={pulse}
              aria-hidden
              className="absolute inset-0 scale-[1.6] rounded-full bg-white/15"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </span>
        </motion.button>
      </div>
    </motion.article>
  );
}
