// ===== PAGE PUBG =====
// Cette page s’ouvre quand on clique sur "Rentrer" dans la carte PUBG

import React from "react";

export default function Pubg() {
  return (
    <div className="pubg-page">
      {/* TITRE PAGE PUBG */}
      <h1>PUBG Mobile</h1>

      {/* DESCRIPTION PAGE */}
      <p>Ici tu pourras personnaliser la page PUBG plus tard.</p>

      {/* SECTION PRODUITS PUBG */}
      <div className="pubg-products">

        {/* CARTE PRODUIT EXEMPLE */}
        <div className="product-card">
          <h3>UC Pack Exemple</h3>
          <button>Ajouter au panier</button>
        </div>

      </div>
    </div>
  );
}
// NAVIGATION: ROUTES
const ROUTE_MAP: Record<Page, string> = {
  home: "/",
  "free-fire": "/free-fire",
  login: "/login",
  account: "/mon-compte",
};