"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { CartDrawer } from "../components/CartDrawer";
import { NotificationIcon } from "../components/NotificationIcon";
import { ComingSoonModal } from "../components/ComingSoonModal";
import { useCartStore } from "../store/cart";
import { useAuthStore } from "../store/auth";
import { useRouter } from "next/navigation";
import diamondImage from "../../public/image.png";
import heroImage from "../../public/hero-graph.svg";
import heroRightImage from "../../public copy/WhatsApp Image 2026-01-27 at 18.10.32.jpeg";
import headerLogo from "../../public copy 3/image copy.png";
import { AnimatePresence, motion } from "framer-motion";

const sectionFade = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const packs = [
  { id: "110", title: "110 Diamants", price: 800 },
  { id: "231", title: "231 Diamants", price: 1500 },
  { id: "583", title: "583 Diamants", price: 3600 },
  { id: "1188", title: "1188 Diamants", price: 7000 },
  { id: "2200", title: "2200 Diamants", price: 12700 },
];

const subscriptions = [
  {
    id: "weekly",
    title: "Abonnement Hebdomadaire",
    price: 1600,
    diamonds: 700,
    period: "week" as const,
    badge: "Hebdo",
    accentColor: "blue" as const,
  },
  {
    id: "monthly",
    title: "Abonnement Mensuel",
    price: 7000,
    diamonds: 3500,
    period: "month" as const,
    badge: "Best Value",
    discount: 15,
    accentColor: "purple-gold" as const,
  },
];

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const count = useCartStore((s) => s.count());
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const router = useRouter();
  const cartRef = useRef<HTMLButtonElement | null>(null);
  const [flyers, setFlyers] = useState<Array<{ id: string; start: { x: number; y: number }; end: { x: number; y: number } }>>([]);
  const [cartBounce, setCartBounce] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchUser().catch(() => {});
  }, [fetchUser]);

  const triggerToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const handleAddAnimation = (start: { x: number; y: number }) => {
    if (!cartRef.current) return;
    const cartRect = cartRef.current.getBoundingClientRect();
    const id = crypto.randomUUID();
    const end = {
      x: cartRect.left + cartRect.width / 2 - 12,
      y: cartRect.top + cartRect.height / 2 - 12,
    };
    setFlyers((prev) => [...prev, { id, start, end }]);
    setTimeout(() => {
      setFlyers((prev) => prev.filter((f) => f.id !== id));
    }, 750);

    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 280);
    triggerToast("Produit ajouté au panier");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-white">
      <div className="noise-overlay" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(90,200,255,0.12),transparent_38%),radial-gradient(circle_at_82%_14%,rgba(255,155,63,0.15),transparent_32%),radial-gradient(circle_at_58%_72%,rgba(255,95,66,0.12),transparent_44%)]" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-8 sm:px-10 lg:pb-20">
        <header className="flex items-center justify-between py-4">
          <a
            href="/"
            className="group flex items-center gap-3 text-lg font-semibold text-white/90 transition hover:text-white"
          >
            <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center overflow-hidden rounded-lg bg-white/10 transition group-hover:bg-white/15">
              <Image
                src={headerLogo}
                alt="Nexy Shop"
                width={48}
                height={48}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold sm:text-lg">Nexy Shop</span>
              <span className="hidden text-xs font-medium text-white/60 sm:block">Diamants & jeux en toute confiance</span>
            </div>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-white/80 sm:flex">
            <a className="relative transition hover:text-white after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[var(--primary)] after:transition-all after:duration-200 hover:after:w-full" href="#">Accueil</a>
            <button
              onClick={() => setComingSoonOpen(true)}
              className="relative transition hover:text-white after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[var(--primary)] after:transition-all after:duration-200 hover:after:w-full cursor-pointer bg-none border-none p-0 font-inherit"
            >
              Autres jeux bientôt disponibles
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <NotificationIcon />
            <button
              onClick={() => router.push(user ? "/account" : "/login")}
              className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:border-[var(--primary)]/70 hover:bg-white/10 sm:text-sm"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[13px] text-white/80 transition group-hover:bg-white/15">
                {user ? (user.name?.charAt(0).toUpperCase() ?? "👤") : "👤"}
              </span>
              <span>{user ? "Mon compte" : "Connexion"}</span>
            </button>
            <motion.button
              ref={cartRef}
              onClick={() => setDrawerOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,155,63,0.16)] transition hover:border-[var(--primary)]/70 hover:bg-white/15"
              aria-label="Ouvrir le panier"
              animate={cartBounce ? { scale: 1.08 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 16 }}
            >
              <span className="text-lg">🛒</span>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[rgba(255,95,66,0.9)] px-1 text-[11px] font-semibold text-white shadow-lg"
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          </div>
        </header>

        <motion.section
          className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
          variants={sectionFade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Achetez vos <span className="text-white">Diamants</span> Free Fire
              <br /> en toute confiance
            </h1>
            <p className="max-w-xl text-lg text-white/80">
              Obtenez vos diamants rapidement et en toute sécurité pour améliorer votre expérience de jeu.
            </p>
          </div>
          <div className="relative w-full">
            <div className="absolute -left-10 -top-6 h-52 w-52 rounded-full bg-[rgba(90,200,255,0.16)] blur-3xl" aria-hidden />
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[rgba(255,155,63,0.18)] blur-3xl" aria-hidden />
            <motion.div
              whileHover={{ scale: 1.12, y: -6, boxShadow: "0 24px 60px rgba(90,200,255,0.25)" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[26px] border border-white/15 bg-black shadow-2xl"
            >
              <Image
                src={heroRightImage}
                alt="Diamants"
                className="h-auto w-full object-cover"
                priority
              />
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="space-y-5"
          variants={sectionFade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Choisissez votre pack de diamants</h2>
              <p className="text-sm text-white/70">Des packs calibrés pour chaque budget, livraison immédiate.</p>
            </div>
            <p className="hidden text-xs font-semibold uppercase tracking-[0.08em] text-white/50 sm:block">Stock numérique • Envoi instantané</p>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 lg:flex-nowrap">
            {packs.map((pack) => (
              <ProductCard
                key={pack.id}
                pack={pack}
                image={diamondImage}
                onAdd={handleAddAnimation}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          className="space-y-5"
          variants={sectionFade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">💎 Abonnements Premium</h2>
              <p className="text-sm text-white/70">Recevez vos diamants automatiquement chaque période.</p>
            </div>
            <p className="hidden text-xs font-semibold uppercase tracking-[0.08em] text-white/50 sm:block">Renouvellement automatique</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                image={diamondImage}
                onAdd={handleAddAnimation}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          className="glass-panel flex flex-col gap-6 rounded-2xl px-6 py-7 shadow-lg shadow-black/40 sm:flex-row sm:items-center sm:justify-between"
          variants={sectionFade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">⚡</div>
            <h3 className="text-base font-semibold text-white">Livraison Instantanée</h3>
            <p className="text-xs text-white/70">Envoi immédiat des diamants</p>
          </div>
          <div className="hidden h-12 w-px bg-white/10 sm:block" aria-hidden />
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">🛡️</div>
            <h3 className="text-base font-semibold text-white">Paiement Sécurisé</h3>
            <p className="text-xs text-white/70">Transactions 100% protégées</p>
          </div>
          <div className="hidden h-12 w-px bg-white/10 sm:block" aria-hidden />
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">🎧</div>
            <h3 className="text-base font-semibold text-white">Support 24/7</h3>
            <p className="text-xs text-white/70">Assistance clientèle réactive</p>
          </div>
        </motion.section>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-xs font-semibold text-white/70"
          variants={sectionFade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="4" width="20" height="16" rx="2" fill="#FF6B00"/>
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">MOOV</text>
            </svg>
            <span>MOOV</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="4" width="20" height="16" rx="2" fill="#FF6B35"/>
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">YAS</text>
            </svg>
            <span>YAS</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="4" width="20" height="16" rx="2" fill="#0052B4"/>
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">WAVE</text>
            </svg>
            <span>WAVE</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="4" width="20" height="16" rx="2" fill="#FFB800"/>
              <text x="12" y="16" textAnchor="middle" fill="#333333" fontSize="8" fontWeight="bold">MTN</text>
            </svg>
            <span>MTN</span>
          </div>
        </motion.div>
      </div>
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        {flyers.map((flyer) => (
          <motion.div
            key={flyer.id}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: flyer.end.x - flyer.start.x, y: flyer.end.y - flyer.start.y, scale: 0.2, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="relative"
            style={{ position: "fixed", left: flyer.start.x, top: flyer.start.y, translateX: 0, translateY: 0, transformOrigin: "center" }}
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#6fa4ff] to-[#375892] shadow-lg shadow-[#6fa4ff]/40">
              <div className="flex h-full w-full items-center justify-center text-[11px] text-white">◇</div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed bottom-6 right-6 z-50 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white shadow-lg backdrop-blur"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <ComingSoonModal open={comingSoonOpen} onClose={() => setComingSoonOpen(false)} />
    </div>
  );
}
