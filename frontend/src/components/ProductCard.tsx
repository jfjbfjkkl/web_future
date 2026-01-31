"use client";

import Image, { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useCartStore } from "../store/cart";

type Pack = {
  id: string;
  title: string;
  price: number;
  badge?: string;
};

const formatPrice = (price: number) =>
  `${price.toLocaleString("fr-FR")} FCFA`;

export function ProductCard({ pack, image, onAdd }: { pack: Pack; image: StaticImageData; onAdd?: (coords: { x: number; y: number }) => void; }) {
  const addItem = useCartStore((s) => s.addItem);
  const imgRef = useRef<HTMLDivElement | null>(null);
  const [pulse, setPulse] = useState(0);

  return (
    <motion.article
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative h-full"
    >
      {/* Bordure lumineuse gamer avec couleurs officielles */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ff9b3f]/20 via-[#5ac8ff]/10 to-[#ff5f42]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" aria-hidden />
      
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1319] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(90,200,255,0.08)] border border-[#5ac8ff]/20 group-hover:border-[#ff9b3f]/40 transition-all duration-300">
        
        {/* Fond dégradé animé avec couleurs du site */}
        <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-300" style={{
          background: 'linear-gradient(135deg, rgba(90,200,255,0.08), rgba(255,155,63,0.08), rgba(255,95,66,0.06))',
        }} aria-hidden />

        {/* Badge */}
        {pack.badge && (
          <div className="relative mb-2 inline-flex w-fit">
            <div className="rounded-full bg-gradient-to-r from-[#ff9b3f]/30 to-[#5ac8ff]/30 backdrop-blur-sm px-3 py-1 text-xs font-bold text-[#ff9b3f] border border-[#ff9b3f]/40">
              {pack.badge}
            </div>
          </div>
        )}

        {/* Titre */}
        <div className="relative mb-4">
          <p className="text-sm font-semibold text-white/60 uppercase tracking-wide">Paquet</p>
          <h3 className="text-lg font-bold text-white mt-1">{pack.title}</h3>
        </div>

        {/* Image diamant - centrée et propre */}
        <div className="relative flex-1 flex items-center justify-center mb-6">
          <div
            ref={imgRef}
            className="relative h-32 w-32 rounded-xl overflow-hidden"
          >
            <Image
              src={image}
              alt={pack.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110 filter drop-shadow-[0_0_8px_rgba(90,200,255,0.25)]"
              sizes="128px"
              priority={pack.id === "110"}
            />
          </div>
        </div>

        {/* Prix - bien visible et plus grand avec couleurs officielles */}
        <div className="relative mb-4 text-center">
          <p className="text-4xl font-black bg-gradient-to-r from-[#5ac8ff] via-[#ff9b3f] to-[#ff5f42] bg-clip-text text-transparent">
            {formatPrice(pack.price)}
          </p>
          <p className="text-xs text-white/50 mt-1">Chargement instantané</p>
        </div>

        {/* Bouton - effet hover animé avec couleurs officielles */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            addItem({ id: pack.id, title: pack.title, price: pack.price, image: image.src });
            setPulse((p) => p + 1);
            const rect = imgRef.current?.getBoundingClientRect();
            if (rect && onAdd) {
              onAdd({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            }
          }}
          className="relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-[#ff9b3f] to-[#ff5f42] px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,155,63,0.5),0_10px_30px_rgba(255,155,63,0.3)] group/btn border border-[#ff9b3f]/60 hover:border-[#ff9b3f]/80"
        >
          {/* Effet lumière au passage */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/btn:opacity-20 group-hover/btn:animate-pulse" aria-hidden />
          
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span>Ajouter au panier</span>
            <motion.span
              animate={{ scale: pulse ? [1, 1.3, 1] : 1 }}
              className="text-lg"
            >
              ◇
            </motion.span>
          </span>
        </motion.button>
      </div>
    </motion.article>
  );
}
