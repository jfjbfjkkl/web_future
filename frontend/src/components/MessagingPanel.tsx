"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMessageStore } from "../store/messages";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type Props = {
  open: boolean;
  onClose: () => void;
};

const typeConfig = {
  notification: {
    icon: "📢",
    color: "from-[#5ac8ff]/20 to-[#5ac8ff]/10",
    label: "Notification",
  },
  code: {
    icon: "💎",
    color: "from-[#ff9b3f]/20 to-[#ff9b3f]/10",
    label: "Code",
  },
  order: {
    icon: "📦",
    color: "from-[#ff5f42]/20 to-[#ff5f42]/10",
    label: "Commande",
  },
};

export function MessagingPanel({ open, onClose }: Props) {
  const {
    messages,
    unreadCount,
    loading,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteMessage,
  } = useMessageStore();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black"
            onClick={onClose}
            aria-hidden
          />

          <motion.aside
            key="panel"
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 z-40 flex h-full w-[400px] max-w-full flex-col border-l border-white/10 bg-[#0c1220]/95 text-white shadow-2xl backdrop-blur"
          >
            {/* En-tête */}
            <div className="border-b border-white/10 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    📬
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Messages</h2>
                    <p className="text-xs text-white/60">
                      {unreadCount} non lu{unreadCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>

              {/* Bouton marquer tout comme lu */}
              {unreadCount > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => markAllAsRead()}
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs font-medium transition hover:bg-white/15"
                >
                  Marquer tout comme lu
                </motion.button>
              )}
            </div>

            {/* Liste des messages */}
            <div className="flex-1 overflow-y-auto">
              {loading && !messages.length && (
                <div className="flex h-full items-center justify-center text-white/60">
                  <div className="animate-spin">⌛</div>
                </div>
              )}

              {!loading && messages.length === 0 && (
                <div className="flex h-full items-center justify-center px-4 text-center">
                  <div className="text-white/60">
                    <div className="mb-2 text-3xl">📭</div>
                    <p className="text-sm">Aucun message pour le moment</p>
                  </div>
                </div>
              )}

              <div className="space-y-2 p-4">
                {messages.map((msg) => {
                  const config = typeConfig[msg.type];
                  return (
                    <motion.div
                      key={msg.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-r ${config.color} p-4 transition hover:border-white/20 ${
                        !msg.read_status ? "ring-1 ring-[#5ac8ff]/50" : ""
                      }`}
                    >
                      {/* Indicateur non lu */}
                      {!msg.read_status && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#5ac8ff] to-transparent" />
                      )}

                      <div className="flex gap-3">
                        {/* Icône et type */}
                        <div className="flex-shrink-0 text-xl">
                          {config.icon}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-white">
                                {msg.title}
                              </p>
                              <p className="text-xs text-white/60 mt-1">
                                {config.label} • {formatDistanceToNow(
                                  new Date(msg.created_at),
                                  { addSuffix: true, locale: fr }
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Contenu du message */}
                          <p className="mt-2 text-xs text-white/80 leading-relaxed line-clamp-2">
                            {msg.content}
                          </p>

                          {/* Code si présent */}
                          {msg.code && (
                            <div className="mt-3 rounded-lg bg-white/10 px-3 py-2 font-mono text-xs text-[#5ac8ff]">
                              {msg.code}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mt-3 flex gap-2">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                msg.read_status
                                  ? markAsUnread(msg.id)
                                  : markAsRead(msg.id)
                              }
                              className="flex-1 rounded-md bg-white/10 px-2 py-1 text-xs transition hover:bg-white/15"
                            >
                              {msg.read_status ? "Non lu" : "Marquer comme lu"}
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteMessage(msg.id)}
                              className="flex-1 rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/20"
                            >
                              Supprimer
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
