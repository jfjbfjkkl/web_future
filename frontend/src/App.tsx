import { FormEvent, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import "./App.css";

type GameCard = {
  id: string;
  name: string;
  theme: string;
  price: number;
};

const games: GameCard[] = [
  { id: "free-fire", name: "Free Fire", theme: "ff", price: 7000 },
  { id: "pubg", name: "PUBG Mobile", theme: "pubg", price: 6500 },
  { id: "fortnite", name: "Fortnite", theme: "fortnite", price: 7200 },
  { id: "codm", name: "Call of Duty Mobile", theme: "codm", price: 6800 },
];

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type FreeFirePack = {
  id: string;
  title: string;
  price: number;
};

type FreeFireSub = {
  id: string;
  title: string;
  price: number;
  diamonds: number;
  period: "week" | "month";
};

const formatPrice = (value: number) =>
  `${value.toLocaleString("fr-FR")} FCFA`;

const freeFirePacks: FreeFirePack[] = [
  { id: "ff-110", title: "110 Diamants", price: 800 },
  { id: "ff-231", title: "231 Diamants", price: 1500 },
  { id: "ff-583", title: "583 Diamants", price: 3600 },
  { id: "ff-1188", title: "1188 Diamants", price: 7000 },
  { id: "ff-2200", title: "2200 Diamants", price: 12700 },
];

const freeFireSubs: FreeFireSub[] = [
  {
    id: "ff-weekly",
    title: "Abonnement Hebdomadaire",
    price: 1600,
    diamonds: 700,
    period: "week",
  },
  {
    id: "ff-monthly",
    title: "Abonnement Mensuel",
    price: 7000,
    diamonds: 3500,
    period: "month",
  },
];

const INTRO_ENABLED = true;

function App() {
  const [showIntro, setShowIntro] = useState(INTRO_ENABLED);
  const [introLeaving, setIntroLeaving] = useState(false);
  const [introDone, setIntroDone] = useState(!INTRO_ENABLED);
  const [page, setPage] = useState<"home" | "free-fire" | "login">(() => {
    if (typeof window === "undefined") return "home";
    if (window.location.pathname === "/free-fire") return "free-fire";
    if (window.location.pathname === "/login") return "login";
    return "home";
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handlePop = () => {
      if (window.location.pathname === "/free-fire") {
        setPage("free-fire");
        return;
      }
      if (window.location.pathname === "/login") {
        setPage("login");
        return;
      }
      setPage("home");
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  useEffect(() => {
    if (!INTRO_ENABLED) return;
    if (!showIntro) return;

    document.body.style.overflow = "hidden";
    const leaveTimer = window.setTimeout(() => setIntroLeaving(true), 2000);
    const doneTimer = window.setTimeout(() => {
      setShowIntro(false);
      setIntroLeaving(false);
      setIntroDone(true);
      document.body.style.overflow = "";
    }, 2500);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
  }, [showIntro]);

  const navigate = (next: "home" | "free-fire" | "login") => {
    const path = next === "home" ? "/" : `/${next}`;
    window.history.pushState({}, "", path);
    setPage(next);
    setIsMenuOpen(false);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const triggerCartPulse = () => {
    setCartBump(true);
    window.setTimeout(() => setCartBump(false), 350);
  };

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const animateToCart = (sourceImage: HTMLImageElement | null) => {
    const cartEl = cartButtonRef.current;
    if (!cartEl || !sourceImage) {
      triggerCartPulse();
      return;
    }

    const sourceRect = sourceImage.getBoundingClientRect();
    const targetRect = cartEl.getBoundingClientRect();
    const clone = sourceImage.cloneNode(true) as HTMLImageElement;

    const startX = sourceRect.left + sourceRect.width / 2;
    const startY = sourceRect.top + sourceRect.height / 2;
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    clone.className = "fly-clone";
    clone.style.position = "fixed";
    clone.style.left = `${startX - 24}px`;
    clone.style.top = `${startY - 24}px`;
    clone.style.width = "48px";
    clone.style.height = "48px";
    clone.style.objectFit = "cover";
    clone.style.borderRadius = "12px";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "120";
    clone.style.opacity = "1";
    clone.style.transform = "translate(0, 0) scale(1)";
    clone.style.transition = "transform 0.7s ease-in-out, opacity 0.7s ease-in-out";
    document.body.appendChild(clone);

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    window.requestAnimationFrame(() => {
      clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.3)`;
      clone.style.opacity = "0";
    });

    window.setTimeout(() => {
      clone.remove();
      triggerCartPulse();
    }, 720);
  };

  const handleBuyClick = (
    event: MouseEvent<HTMLButtonElement>,
    item: { id: string; name: string; price: number }
  ) => {
    const card = event.currentTarget.closest(".freefire-card");
    const image = card?.querySelector(".freefire-image img") as HTMLImageElement | null;
    animateToCart(image);
    addToCart(item);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError("Veuillez renseigner vos identifiants.");
      return;
    }

    setIsAuthenticated(true);
    navigate("home");
  };

  const handleMobileLink = (target: "home" | "free-fire" | "login") => {
    navigate(target);
  };

  const handleGamesLink = () => {
    navigate("home");
    window.setTimeout(() => {
      document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".reveal"));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [page]);
  return (
    <div className={`app ${showIntro ? "intro-active" : ""}`}>
      {showIntro && (
        <div
          id="intro"
          className={`intro-overlay ${introLeaving ? "leaving" : ""}`}
        >
          <div className="intro-backdrop" aria-hidden />
          <div className="intro-particles" aria-hidden />
          <div className="intro-card">
            <div className="intro-logo">
              <img src="/hero-right.jpeg" alt="Nexy Shop" />
              <span className="intro-sweep" aria-hidden />
            </div>
            <div className="intro-text">
              <h1>Nexy Shop</h1>
              <p>Entrez dans l'univers gaming</p>
            </div>
            <div className="intro-icons" aria-hidden>
              <span>🎮</span>
              <span>💎</span>
              <span>🪙</span>
              <span>⚡</span>
            </div>
          </div>
        </div>
      )}
      <header className="site-header">
        <div className="header-inner">
          <a
            className="brand"
            href="/"
            onClick={(event) => {
              event.preventDefault();
              navigate("home");
            }}
          >
            <span className="brand-logo" aria-hidden>
              <img src="/hero-right.jpeg" alt="Nexy Shop" />
            </span>
            <span className="brand-text">Nexy Shop</span>
          </a>
          <div className="header-cta">
            <button
              className="menu-toggle"
              type="button"
              aria-label="Ouvrir le menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
            <button
              className={`btn cart-btn ${cartBump ? "bump" : ""}`}
              type="button"
              onClick={() => setIsCartOpen(true)}
              ref={cartButtonRef}
            >
              <span className="cart-icon" aria-hidden>🛒</span>
              <span className="cart-text">Panier</span>
              {cartCount > 0 && (
                <span className={`cart-count ${cartBump ? "bump" : ""}`}>
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate("login")}
            >
              {isAuthenticated ? "Mon compte" : "Connexion"}
            </button>
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        >
          <aside
            className="mobile-menu"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="mobile-menu-link"
              type="button"
              onClick={() => handleMobileLink("login")}
            >
              Connexion
            </button>
            <button
              className="mobile-menu-link"
              type="button"
              onClick={() => {
                setIsCartOpen(true);
                setIsMenuOpen(false);
              }}
            >
              Panier
            </button>
            <button
              className="mobile-menu-link"
              type="button"
              onClick={() => handleMobileLink("free-fire")}
            >
              Free Fire
            </button>
            <button
              className="mobile-menu-link"
              type="button"
              onClick={handleGamesLink}
            >
              Autres jeux
            </button>
          </aside>
        </div>
      )}

      <main
        id="mainContent"
        className={`main-content ${introDone ? "" : "main-hidden"}`}
      >
        {page === "home" && (
          <section id="home" className="hero reveal">
          <div className="hero-content">
            <span className="hero-tag">Premium gaming credits</span>
            <h1>
              Achetez vos diamants Free Fire
              <br />et credits de jeux en toute securite
            </h1>
            <p>
              Livraison rapide • Paiement securise • Support 24/7
            </p>
          </div>
          <div className="hero-visual reveal">
            <div className="hero-image">
              <img src="/image copy 3.png" alt="Diamants Free Fire" loading="eager" />
            </div>
            <div className="hero-chests" aria-hidden>
              <div className="chest" />
              <div className="chest" />
            </div>
            <div className="hero-turtle" aria-hidden>
              <svg viewBox="0 0 200 140" role="img" aria-label="Tortue gaming">
                <defs>
                  <linearGradient id="shell" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#1b2540" />
                    <stop offset="1" stopColor="#26335c" />
                  </linearGradient>
                  <linearGradient id="neon" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#7c5cff" />
                    <stop offset="1" stopColor="#57d4ff" />
                  </linearGradient>
                </defs>
                <ellipse cx="100" cy="70" rx="70" ry="44" fill="url(#shell)" />
                <path
                  d="M40 70c10-22 42-34 60-32 18-2 50 10 60 32"
                  stroke="url(#neon)"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M60 58c10-8 30-12 40-12 10 0 30 4 40 12"
                  stroke="url(#neon)"
                  strokeWidth="3"
                  fill="none"
                />
                <circle cx="38" cy="86" r="12" fill="#1c2742" />
                <circle cx="162" cy="86" r="12" fill="#1c2742" />
                <circle cx="100" cy="28" r="12" fill="#1c2742" />
                <circle cx="100" cy="28" r="4" fill="#7c5cff" />
                <circle cx="34" cy="86" r="3" fill="#7c5cff" />
                <circle cx="166" cy="86" r="3" fill="#7c5cff" />
              </svg>
            </div>
          </div>
          </section>
        )}

        {page === "home" && (
          <section id="games" className="section reveal">
            <div className="section-head">
              <h2>Nos jeux populaires</h2>
              <p>Rechargez vos jeux favoris avec des credits officiels.</p>
            </div>
            <div className="game-grid">
              {games.map((game) => (
                <article className={`game-card game-${game.theme} reveal`} key={game.id}>
                  <div className="game-art" aria-hidden>
                    {game.id === "free-fire" ? (
                      <img src="/image copy 4.png" alt={game.name} loading="lazy" />
                    ) : (
                      <span>{game.name}</span>
                    )}
                  </div>
                  <div className="game-info">
                    <h3>{game.name}</h3>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => navigate("free-fire")}
                    >
                      Acheter
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {page === "home" && (
          <section className="section reveal">
            <div className="section-head">
              <h2>Pourquoi nous choisir ?</h2>
              <p>Une experience fluide, rapide et totalement securisee.</p>
            </div>
            <div className="features-grid">
              <div className="feature-card reveal">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2l5 9-5 11-5-11 5-9z" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h4>Livraison instantanee</h4>
                <p>Recevez vos diamants en quelques minutes.</p>
              </div>
              <div className="feature-card reveal">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M4 12l4-4h12v10H8l-4-4z" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h4>Paiement securise</h4>
                <p>Transactions protegees et fournisseurs fiables.</p>
              </div>
              <div className="feature-card reveal">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M4 14a8 8 0 0116 0v5H4v-5z" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h4>Support 24/7</h4>
                <p>Une equipe toujours la pour vous aider.</p>
              </div>
              <div className="feature-card reveal">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2l3 7h7l-6 4 2 7-6-4-6 4 2-7-6-4h7z" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h4>Clients satisfaits</h4>
                <p>Des milliers de gamers nous font confiance.</p>
              </div>
            </div>
          </section>
        )}


        {page === "login" && (
          <section className="login-page reveal">
            <div className="login-card">
              <div className="section-head">
                <h2>Connexion</h2>
                <p>Accedez a votre compte Nexy Shop.</p>
              </div>
              {loginError && <p className="login-error">{loginError}</p>}
              <form className="login-form" onSubmit={handleLoginSubmit}>
                <label>
                  Email ou nom d'utilisateur
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(event) => setLoginIdentifier(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Mot de passe
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    required
                  />
                </label>
                <button className="btn btn-primary" type="submit">
                  Se connecter
                </button>
                <div className="login-links">
                  <button type="button" className="link-btn">
                    Creer un compte
                  </button>
                  <button type="button" className="link-btn">
                    Mot de passe oublie ?
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {page === "free-fire" && (
          <section className="freefire-page reveal">
            <div className="freefire-banner reveal">
              <img src="/image copy.png" alt="Free Fire" loading="eager" />
              <div className="freefire-banner-overlay">
                <h2>Free Fire</h2>
                <p>Recharge officielle Nexy Shop</p>
              </div>
            </div>

            <div className="section-head">
              <h2>Packs de diamants</h2>
              <p>Packs officiels, livraison instantanee.</p>
            </div>
            <div className="freefire-grid freefire-packs">
              {freeFirePacks.map((pack) => (
                <article className="freefire-card reveal" key={pack.id}>
                  <div className="freefire-card-top">
                    <span className="freefire-tag">Pack</span>
                    <h3>{pack.title}</h3>
                  </div>
                  <div className="freefire-image">
                    <img src="/image.png" alt={pack.title} loading="lazy" />
                  </div>
                  <div className="freefire-card-bottom">
                    <div>
                      <div className="freefire-price">{formatPrice(pack.price)}</div>
                      <p className="freefire-meta">Chargement instantane</p>
                    </div>
                    <button
                      className="btn freefire-btn"
                      type="button"
                      onClick={(event) =>
                        handleBuyClick(event, {
                          id: pack.id,
                          name: pack.title,
                          price: pack.price,
                        })
                      }
                    >
                      Acheter
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="section-head">
              <h2>Abonnements</h2>
              <p>Bonus quotidiens avec renouvellement automatique.</p>
            </div>
            <div className="freefire-grid freefire-subs">
              {freeFireSubs.map((sub) => (
                <article className="freefire-card reveal" key={sub.id}>
                  <div className="freefire-card-top">
                    <span className="freefire-tag">Abonnement</span>
                    <h3>{sub.title}</h3>
                  </div>
                  <div className="freefire-image">
                    <img src="/image.png" alt={sub.title} loading="lazy" />
                  </div>
                  <div className="freefire-card-bottom">
                    <div>
                      <div className="freefire-price">{formatPrice(sub.price)}</div>
                      <p className="freefire-meta">
                        {sub.diamonds} diamants / {sub.period === "week" ? "semaine" : "mois"}
                      </p>
                    </div>
                    <button
                      className="btn freefire-btn"
                      type="button"
                      onClick={(event) =>
                        handleBuyClick(event, {
                          id: sub.id,
                          name: sub.title,
                          price: sub.price,
                        })
                      }
                    >
                      Acheter
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-links">
            <a href="#">Mentions legales</a>
            <a href="#">Conditions</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-payments" aria-hidden>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>PayPal</span>
          </div>
        </div>
      </footer>
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <aside
            className="cart-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-header">
              <h3>Panier</h3>
              <button
                type="button"
                className="link-btn"
                onClick={() => setIsCartOpen(false)}
              >
                Fermer
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="cart-empty">Votre panier est vide.</p>
            ) : (
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                    <div className="cart-item-meta">
                      <span>x{item.quantity}</span>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <button className="btn btn-primary" type="button">
                Payer
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
