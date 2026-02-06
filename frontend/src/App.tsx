import { useEffect, useRef, useState } from "react";
import type { AnchorHTMLAttributes, FormEvent, MouseEvent } from "react";
import "./App.css";

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname || "/");

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname || "/");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return pathname;
}

function useRouter() {
  return {
    push: (href: string) => {
      window.history.pushState({}, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
    },
  };
}

function Link(
  props: { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">
) {
  const { href, onClick, ...rest } = props;

  return (
    <a
      href={href}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        if (
          event.button !== 0 ||
          event.metaKey ||
          event.altKey ||
          event.ctrlKey ||
          event.shiftKey
        ) {
          return;
        }

        if (
          href.startsWith("#") ||
          href.startsWith("http://") ||
          href.startsWith("https://") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        ) {
          return;
        }

        event.preventDefault();
        window.history.pushState({}, "", href);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }}
    />
  );
}

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

type StoredUser = {
  name: string;
  email: string;
  password: string;
};

type PurchaseEntry = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  date: string;
};

type Page = "home" | "free-fire" | "login" | "account";

const formatPrice = (value: number) =>
  `${value.toLocaleString("fr-FR")} FCFA`;

const formatDateTime = (isoDate: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));

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

const USERS_STORAGE_KEY = "nexy_users";
const SESSION_STORAGE_KEY = "nexy_session";
const CART_STORAGE_KEY = "nexy_cart";
const purchasesKeyFor = (email: string) => `nexy_purchases_${email}`;

const safeParseJSON = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const readStoredUsers = (): StoredUser[] => {
  if (typeof window === "undefined") return [];
  return safeParseJSON<StoredUser[]>(localStorage.getItem(USERS_STORAGE_KEY), []);
};

const getInitialAuthState = () => {
  if (typeof window === "undefined") {
    return { storedUsers: [] as StoredUser[], sessionUser: null as StoredUser | null };
  }
  const storedUsers = readStoredUsers();
  const sessionEmail = localStorage.getItem(SESSION_STORAGE_KEY);
  const sessionUser = sessionEmail
    ? storedUsers.find((user) => user.email === sessionEmail) ?? null
    : null;
  return { storedUsers, sessionUser };
};

const readPurchases = (email: string): PurchaseEntry[] => {
  if (typeof window === "undefined") return [];
  return safeParseJSON<PurchaseEntry[]>(localStorage.getItem(purchasesKeyFor(email)), []);
};

const storePurchases = (email: string, entries: PurchaseEntry[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(purchasesKeyFor(email), JSON.stringify(entries));
  } catch {
    // ignore storage errors
  }
};

const readStoredCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  return safeParseJSON<CartItem[]>(localStorage.getItem(CART_STORAGE_KEY), []);
};

const storeCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
};

const ROUTE_MAP: Record<Page, string> = {
  home: "/",
  "free-fire": "/free-fire",
  login: "/login",
  account: "/mon-compte",
};

const INTRO_ENABLED = false;
const INTRO_SESSION_KEY = "nexy_intro_seen";
const INTRO_TITLE = "NEXY SHOP";

function App() {
  const router = useRouter();
  const pathname = usePathname();

  const page: Page =
    pathname === "/free-fire"
      ? "free-fire"
      : pathname === "/login"
      ? "login"
      : pathname === "/mon-compte"
      ? "account"
      : "home";

  const initialAuthStateRef = useRef(getInitialAuthState());
  const [users, setUsers] = useState<StoredUser[]>(initialAuthStateRef.current.storedUsers);
  const [authUser, setAuthUser] = useState<StoredUser | null>(initialAuthStateRef.current.sessionUser);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseEntry[]>(
    initialAuthStateRef.current.sessionUser
      ? readPurchases(initialAuthStateRef.current.sessionUser.email)
      : []
  );

  const initialShouldShowIntro = (() => {
    if (!INTRO_ENABLED) return false;
    try {
      return sessionStorage.getItem(INTRO_SESSION_KEY) !== "1";
    } catch {
      return true;
    }
  })();

  const [showIntro, setShowIntro] = useState(initialShouldShowIntro);
  const [introLeaving, setIntroLeaving] = useState(false);
  const [introDone, setIntroDone] = useState(!initialShouldShowIntro);

  const [cart, setCart] = useState<CartItem[]>(() => readStoredCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = Boolean(authUser);

  useEffect(() => {
    if (!INTRO_ENABLED) return;
    if (!showIntro) return;

    const isMobile = window.matchMedia?.("(max-width: 600px), (hover: none)")?.matches ?? false;
    const totalDurationMs = isMobile ? 1800 : 2400;
    const exitMs = 400;
    const leaveAtMs = Math.max(0, totalDurationMs - exitMs);

    const leaveTimer = window.setTimeout(() => setIntroLeaving(true), leaveAtMs);
    const doneTimer = window.setTimeout(() => {
      setShowIntro(false);
      setIntroLeaving(false);
      setIntroDone(true);
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      } catch {
        // ignore
      }
    }, totalDurationMs);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [showIntro]);

  useEffect(() => {
    if (!authUser) {
      setPurchaseHistory([]);
      return;
    }
    setPurchaseHistory(readPurchases(authUser.email));
  }, [authUser]);

  useEffect(() => {
    storeCart(cart);
  }, [cart]);

  useEffect(() => {
    if (pathname === ROUTE_MAP.account && !authUser) {
      setAuthModeWithReset("login");
      router.push(ROUTE_MAP.login);
      return;
    }
    if (pathname === ROUTE_MAP.login && authUser) {
      router.push(ROUTE_MAP.account);
    }
  }, [pathname, authUser, router]);

  const navigate = (next: Page) => {
    setIsMenuOpen(false);
    router.push(ROUTE_MAP[next]);
  };

  const setAuthModeWithReset = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthError(null);
  };

  const goToAuthPage = (mode: "login" | "register" = "login") => {
    setAuthModeWithReset(mode);
    navigate("login");
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const accountInitial = authUser?.name?.trim()?.charAt(0).toUpperCase() ?? "N";

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
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      triggerCartPulse();
      return;
    }

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

  const finishAuth = (user: StoredUser) => {
    setAuthUser(user);
    setAuthModeWithReset("login");
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, user.email);
    } catch {
      // ignore storage persistence errors
    }
    navigate("account");
  };

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword.trim();

    if (!email || !password) {
      setAuthError("Veuillez renseigner vos identifiants.");
      return;
    }

    const matchingUser = users.find(
      (user) => user.email.toLowerCase() === email
    );

    if (!matchingUser || matchingUser.password !== password) {
      setAuthError("Email ou mot de passe incorrect.");
      return;
    }

    finishAuth(matchingUser);
    setLoginEmail("");
    setLoginPassword("");
  };

  const handleRegisterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    const name = registerName.trim();
    const email = registerEmail.trim().toLowerCase();
    const password = registerPassword.trim();

    if (!name || !email || !password) {
      setAuthError("Veuillez completer tous les champs.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Le mot de passe doit contenir au moins 6 caracteres.");
      return;
    }

    const emailTaken = users.some(
      (user) => user.email.toLowerCase() === email
    );

    if (emailTaken) {
      setAuthError("Un compte existe deja avec cet email.");
      return;
    }

    const newUser: StoredUser = { name, email, password };
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
    } catch {
      // ignore storage persistence errors
    }

    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    finishAuth(newUser);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setPurchaseHistory([]);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsCartOpen(false);
    setAuthModeWithReset("login");
    navigate("login");
  };

  const handleMobileLink = (target: Page) => {
    if (target === "login") {
      goToAuthPage();
      return;
    }
    if (target === "account" && !isAuthenticated) {
      goToAuthPage();
      return;
    }
    navigate(target);
  };

  const handleCheckout = () => {
    if (!cart.length) return;
    if (!authUser) {
      setIsCartOpen(false);
      setAuthError("Connectez-vous pour finaliser votre achat.");
      goToAuthPage();
      return;
    }

    const timestamp = new Date().toISOString();
    const entries = cart.map((item) => ({
      id: `${item.id}-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      date: timestamp,
    }));

    const updatedHistory = [...entries, ...purchaseHistory];
    setPurchaseHistory(updatedHistory);
    storePurchases(authUser.email, updatedHistory);
    setCart([]);
    setIsCartOpen(false);
  };

  const handleGamesLink = () => {
    if (pathname !== "/") router.push("/");
    window.setTimeout(() => {
      document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
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
          <div className="intro-streaks" aria-hidden />
          <div className="intro-card">
            <div className="intro-logo">
              <img src="/hero-right.jpeg" alt="Nexy Shop" />
              <span className="intro-sweep" aria-hidden />
              <span className="intro-glow" aria-hidden />
            </div>
            <div className="intro-text">
              <div className="intro-title" aria-label={INTRO_TITLE}>
                {Array.from(INTRO_TITLE).map((char, index) => (
                  <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${char}-${index}`}
                    className="intro-letter"
                    style={{ ["--i" as any]: index }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </div>
              <div className="intro-progress" aria-hidden>
                <div className="intro-progress-bar" />
              </div>
            </div>
          </div>
        </div>
      )}
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" onClick={() => setIsMenuOpen(false)}>
            <span className="brand-logo" aria-hidden>
              <img src="/hero-right.jpeg" alt="Nexy Shop" />
            </span>
            <span className="brand-text">Nexy Shop</span>
          </Link>

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
              onClick={() => (isAuthenticated ? navigate("account") : goToAuthPage())}
            >
              {isAuthenticated ? "Mon compte" : "Connexion"}
            </button>
            {isAuthenticated && (
              <button
                className="btn btn-ghost"
                type="button"
                onClick={handleLogout}
              >
                Deconnexion
              </button>
            )}
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
            {isAuthenticated ? (
              <>
                <button
                  className="mobile-menu-link"
                  type="button"
                  onClick={() => handleMobileLink("account")}
                >
                  Mon compte
                </button>
                <button
                  className="mobile-menu-link"
                  type="button"
                  onClick={handleLogout}
                >
                  Deconnexion
                </button>
              </>
            ) : (
              <button
                className="mobile-menu-link"
                type="button"
                onClick={() => handleMobileLink("login")}
              >
                Connexion / Inscription
              </button>
            )}
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
                <h2>{authMode === "login" ? "Connexion" : "Creer un compte"}</h2>
                <p>
                  {authMode === "login"
                    ? "Accedez a votre compte Nexy Shop."
                    : "Rejoignez Nexy Shop et synchronisez vos achats."}
                </p>
              </div>
              <div className="auth-toggle" role="tablist" aria-label="Choix du mode d'authentification">
                <button
                  type="button"
                  className={authMode === "login" ? "active" : ""}
                  onClick={() => setAuthModeWithReset("login")}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  className={authMode === "register" ? "active" : ""}
                  onClick={() => setAuthModeWithReset("register")}
                >
                  Inscription
                </button>
              </div>
              {authError && <p className="login-error">{authError}</p>}
              {authMode === "login" ? (
                <form className="login-form" onSubmit={handleLoginSubmit}>
                  <label>
                    Email
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
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
                </form>
              ) : (
                <form className="login-form" onSubmit={handleRegisterSubmit}>
                  <label>
                    Nom complet
                    <input
                      type="text"
                      value={registerName}
                      onChange={(event) => setRegisterName(event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(event) => setRegisterEmail(event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Mot de passe
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(event) => setRegisterPassword(event.target.value)}
                      required
                      minLength={6}
                    />
                  </label>
                  <button className="btn btn-primary" type="submit">
                    Creer mon compte
                  </button>
                </form>
              )}
              <p className="auth-hint">
                {authMode === "login" ? "Pas encore de compte ?" : "Deja membre ?"}{" "}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() =>
                    setAuthModeWithReset(authMode === "login" ? "register" : "login")
                  }
                >
                  {authMode === "login" ? "Inscrivez-vous" : "Connectez-vous"}
                </button>
              </p>
            </div>
          </section>
        )}

        {page === "account" && authUser && (
          <section className="account-page reveal">
            <header className="account-header">
              <div className="account-brand">
                <span className="brand-logo" aria-hidden>
                  <img src="/hero-right.jpeg" alt="Nexy Shop" />
                </span>
                <div>
                  <p className="account-kicker">Mon compte</p>
                  <h2>Bienvenue, {authUser.name}</h2>
                </div>
              </div>
              <div className="account-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setIsCartOpen(true)}>
                  Voir panier
                </button>
                <button className="btn btn-primary" type="button" onClick={handleLogout}>
                  Deconnexion
                </button>
              </div>
            </header>

            <div className="account-profile-card">
              <div className="account-avatar" aria-hidden>
                {accountInitial}
              </div>
              <div className="account-profile-info">
                <h3>{authUser.name}</h3>
                <p>{authUser.email}</p>
              </div>
            </div>

            <section className="account-purchases">
              <div className="section-head">
                <h3>Mes achats</h3>
                <p>Historique recent de vos transactions Nexy Shop.</p>
              </div>
              {purchaseHistory.length === 0 ? (
                <div className="account-empty">
                  <p>Aucun achat enregistre pour le moment.</p>
                  <button className="btn btn-primary" type="button" onClick={() => navigate("home")}>
                    Explorer les offres
                  </button>
                </div>
              ) : (
                <div className="purchase-list">
                  {purchaseHistory.map((purchase) => (
                    <article className="purchase-card" key={purchase.id}>
                      <div>
                        <h4>{purchase.name}</h4>
                        <p className="purchase-meta">
                          {purchase.quantity}x • {formatDateTime(purchase.date)}
                        </p>
                      </div>
                      <div className="purchase-total">
                        <span>Total</span>
                        <strong>{formatPrice(purchase.total)}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
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
              <button className="btn btn-primary" type="button" onClick={handleCheckout}>
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
