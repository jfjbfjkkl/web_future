"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ComingSoonModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-6"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1319] p-8 shadow-2xl border border-white/10">
              {/* Fond dégradé animé */}
              <div className="absolute inset-0 opacity-30" style={{
                background: 'linear-gradient(135deg, rgba(90,200,255,0.08), rgba(255,155,63,0.08), rgba(255,95,66,0.06))',
              }} aria-hidden />

              {/* Contenu */}
              <div className="relative z-10 text-center space-y-6">
                {/* Icône animée */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex justify-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#5ac8ff]/20 to-[#ff9b3f]/20 border border-[#5ac8ff]/30">
                    <span className="text-4xl">⏰</span>
                  </div>
                </motion.div>

                {/* Titre */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Bientôt disponible
                  </h2>
                  <p className="text-sm font-medium text-[#5ac8ff]">Coming Soon</p>
                </div>

                {/* Message */}
                <p className="text-white/80 leading-relaxed text-base">
                  De nouveaux jeux et abonnements arrivent très bientôt sur la boutique <span className="font-semibold text-white">Nexy Shop</span>.
                </p>

                {/* Indicateur de progression */}
                <div className="flex justify-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="h-2 w-2 rounded-full bg-[#5ac8ff]"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="h-2 w-2 rounded-full bg-[#ff9b3f]"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="h-2 w-2 rounded-full bg-[#ff5f42]"
                  />
                </div>

                {/* Bouton de fermeture */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-full rounded-lg bg-gradient-to-r from-[#5ac8ff]/20 to-[#ff9b3f]/20 border border-[#5ac8ff]/40 px-4 py-3 text-sm font-semibold text-white transition hover:border-[#5ac8ff]/60 hover:from-[#5ac8ff]/30 hover:to-[#ff9b3f]/30"
                >
                  Fermer
                </motion.button>

                {/* Texte supplémentaire */}
                <p className="text-xs text-white/50 pt-2">
                  Soyez attentif pour les mises à jour 🚀
                </p>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
