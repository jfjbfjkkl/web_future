"use client";

import { motion } from "framer-motion";

const games = [
  {
    name: "Free Fire",
    description: "Skins, diamants et événements exclusifs, livrés en instantané.",
    accent: "from-[#ffb347] to-[#ff6b6b]",
    image: "/image.png",
    cta: "Voir",
  },
  {
    name: "PUBG Mobile",
    description: "UC sécurisés pour tenues, passes et caisses premium.",
    accent: "from-[#5ce1e6] to-[#3b82f6]",
    image: "/hero-graph.svg",
    cta: "Bientôt disponible",
  },
  {
    name: "Call of Duty: Mobile",
    description: "CP pour bundles légendaires et battle pass à prix optimisé.",
    accent: "from-[#b5ff7d] to-[#3dce6c]",
    image: "/file.svg",
    cta: "Bientôt disponible",
  },
  {
    name: "League of Legends",
    description: "RP pour skins, passes d'événements et contenus e-sport.",
    accent: "from-[#9b8cff] to-[#5b4bff]",
    image: "/globe.svg",
    cta: "Bientôt disponible",
  },
  {
    name: "Valorant",
    description: "Points Valorant pour bundles premium et passe de combat.",
    accent: "from-[#ff8fb1] to-[#ff4d67]",
    image: "/window.svg",
    cta: "Bientôt disponible",
  },
];

export default function OtherGamesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">
      <div className="noise-overlay" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(111,164,255,0.18),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(40,71,117,0.3),transparent_40%)]" aria-hidden />

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-10 sm:px-10 lg:pb-24">
        <div className="flex items-center justify-start">
          <a
            href="/"
            className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-semibold text-white/90 transition hover:border-white/25 hover:bg-white/10"
          >
            <span className="text-base">←</span>
            <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white/70 after:transition-all after:duration-200 group-hover:after:w-full">Accueil</span>
          </a>
        </div>
        <header className="space-y-3 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Nexy Shop</p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Autres jeux disponibles</h1>
          <p className="max-w-3xl text-sm text-white/70 sm:text-base">
            Découvrez les prochains jeux à rejoindre la boutique. Sélection premium, livraisons rapides et expérience sécurisée.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <motion.article
              key={game.name}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/40"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${game.accent} opacity-15 blur-[90px]`} aria-hidden />
              <div className="relative flex flex-col gap-4">
                <div className="relative h-36 w-full overflow-hidden rounded-xl bg-black/30">
                  <div
                    className="absolute inset-0 bg-center bg-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url(${game.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" aria-hidden />
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold leading-tight">{game.name}</h3>
                  <p className="text-sm text-white/65">{game.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Nexy Shop</span>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                  >
                    {game.cta}
                  </motion.button>
                </div>
              </div>
            </motion.article>
          ))}
        </section>
      </main>
    </div>
  );
}
