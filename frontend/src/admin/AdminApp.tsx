import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { adminApi } from "./api";
import type { AdminCategory, AdminProduct, AdminPromotion, SiteContentItem } from "./types";
import "./Admin.css";

type Props = {
  pathname: string;
  onNavigate: (href: string) => void;
};

const TOKEN_KEY = "nexy_admin_token";

export default function AdminApp({ pathname, onNavigate }: Props) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const adminPath = pathname.replace(/^\/admin/, "") || "/";
  const isLoginPage = adminPath === "/login";

  useEffect(() => {
    if (!token) {
      setIsSessionChecked(true);
      return;
    }

    let mounted = true;
    adminApi.session(token)
      .then(() => {
        if (!mounted) return;
        setIsSessionChecked(true);
      })
      .catch(() => {
        if (!mounted) return;
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setIsSessionChecked(true);
        onNavigate("/admin/login");
      });

    return () => {
      mounted = false;
    };
  }, [token, onNavigate]);

  useEffect(() => {
    if (!isSessionChecked) return;

    if (!token && !isLoginPage) {
      onNavigate("/admin/login");
      return;
    }

    if (token && (adminPath === "/" || adminPath === "/login")) {
      onNavigate("/admin/dashboard");
    }
  }, [token, adminPath, isLoginPage, isSessionChecked, onNavigate]);

  const handleLogout = async () => {
    if (!token) return;
    await adminApi.logout(token).catch(() => undefined);
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    onNavigate("/admin/login");
  };

  if (!isSessionChecked) {
    return <div className="admin-login">Verification session admin...</div>;
  }

  if (!token) {
    return (
      <AdminLogin
        onSuccess={(nextToken) => {
          localStorage.setItem(TOKEN_KEY, nextToken);
          setToken(nextToken);
          onNavigate("/admin/dashboard");
        }}
      />
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">Nexy Shop Admin</div>
        <nav className="admin-nav">
          {[
            ["/admin/dashboard", "Dashboard"],
            ["/admin/products", "Produits"],
            ["/admin/categories", "Categories"],
            ["/admin/promotions", "Promotions"],
            ["/admin/media", "Media"],
            ["/admin/content", "Contenu"],
            ["/admin/theme", "Theme"],
            ["/admin/settings", "Parametres"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className={`admin-nav-link ${pathname === href ? "active" : ""}`}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(href);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        {feedback && <div className={`admin-feedback ${status === "saved" ? "pulse" : ""}`}>{feedback}</div>}
        <AdminRouter
          token={token}
          pathname={pathname}
          onNavigate={onNavigate}
          onFeedback={setFeedback}
          onStatus={setStatus}
          onLogout={handleLogout}
        />
      </main>
    </div>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await adminApi.login(code.trim());
      onSuccess(result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login">
      <div className="admin-card admin-login-card">
        <h1>Connexion admin</h1>
        <p>Entrez le code admin (verification serveur).</p>
        <form onSubmit={submit}>
          <input
            className="admin-input"
            type="password"
            placeholder="Code admin"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
          <div style={{ marginTop: 10 }}>
            <button className="admin-btn" type="submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
          {error && <p style={{ color: "#ffb3b3" }}>{error}</p>}
        </form>
      </div>
    </section>
  );
}

function AdminRouter(props: {
  token: string;
  pathname: string;
  onNavigate: (href: string) => void;
  onFeedback: (message: string) => void;
  onStatus: (value: "idle" | "saving" | "saved") => void;
  onLogout: () => void;
}) {
  if (props.pathname === "/admin/dashboard") {
    return <AdminDashboard token={props.token} onStatus={props.onStatus} />;
  }
  if (props.pathname === "/admin/products" || props.pathname === "/admin/products/new" || /^\/admin\/products\/\d+$/.test(props.pathname)) {
    return <ProductsPage {...props} />;
  }
  if (props.pathname === "/admin/categories" || props.pathname === "/admin/categories/new" || /^\/admin\/categories\/\d+$/.test(props.pathname)) {
    return <CategoriesPage {...props} />;
  }
  if (props.pathname === "/admin/promotions") {
    return <PromotionsPage {...props} />;
  }
  if (props.pathname === "/admin/media") {
    return <MediaPage {...props} />;
  }
  if (props.pathname === "/admin/content") {
    return <ContentPage {...props} />;
  }
  if (props.pathname === "/admin/theme") {
    return <ThemePage {...props} />;
  }
  if (props.pathname === "/admin/settings") {
    return <SettingsPage {...props} />;
  }

  return <AdminDashboard token={props.token} onStatus={props.onStatus} />;
}

function AdminDashboard({ token, onStatus }: { token: string; onStatus: (value: "idle" | "saving" | "saved") => void }) {
  const [counts, setCounts] = useState({ products: 0, categories: 0, promotions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onStatus("idle");
    setLoading(true);
    Promise.all([
      adminApi.products.list(token),
      adminApi.categories.list(token),
      adminApi.promotions.list(token),
    ]).then(([products, categories, promotions]) => {
      setCounts({ products: products.length, categories: categories.length, promotions: promotions.length });
      setLoading(false);
    });
  }, [token, onStatus]);

  return (
    <section className="admin-page">
      <AdminTopbar title="Dashboard" status={loading ? "Chargement..." : "Pret"} />
      <div className="admin-card admin-stats">
        {loading ? (
          <div className="admin-skeleton-row" />
        ) : (
          <div className="admin-row">
            <div><strong>{counts.products}</strong> produits</div>
            <div><strong>{counts.categories}</strong> categories</div>
            <div><strong>{counts.promotions}</strong> promotions</div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProductsPage({ token, pathname, onNavigate, onFeedback, onStatus }: { token: string; pathname: string; onNavigate: (href: string) => void; onFeedback: (msg: string) => void; onStatus: (value: "idle" | "saving" | "saved") => void; }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const editingId = useMemo(() => {
    const match = pathname.match(/^\/admin\/products\/(\d+)$/);
    return match ? Number(match[1]) : null;
  }, [pathname]);

  const isFormView = pathname === "/admin/products/new" || editingId !== null;

  const refresh = () => {
    setLoading(true);
    Promise.all([
      adminApi.products.list(token),
      adminApi.categories.list(token),
      adminApi.promotions.list(token),
    ]).then(([nextProducts, nextCategories, nextPromotions]) => {
      setProducts(nextProducts);
      setCategories(nextCategories);
      setPromotions(nextPromotions);
      setLoading(false);
    });
  };

  useEffect(() => {
    onStatus("idle");
    refresh();
  }, [token, onStatus]);

  const filteredProducts = products.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && product.is_active) ||
      (filter === "inactive" && !product.is_active);
    return matchesQuery && matchesFilter;
  });

  const promotionByProductId = new Map(
    promotions
      .filter((promo) => promo.scope_type === "product" && promo.is_active)
      .map((promo) => [promo.scope_id, promo])
  );

  if (isFormView) {
    return (
      <ProductForm
        token={token}
        categories={categories}
        productId={editingId}
        onStatus={onStatus}
        onDone={() => {
          onFeedback("Produit enregistre");
          onStatus("saved");
          window.setTimeout(() => onStatus("idle"), 1400);
          refresh();
          onNavigate("/admin/products");
        }}
      />
    );
  }

  return (
    <section className="admin-page">
      <AdminTopbar
        title="Produits"
        status={loading ? "Chargement..." : "Pret"}
        actionLabel="Ajouter"
        onAction={() => onNavigate("/admin/products/new")}
      />
      <div className="admin-card">
        <div className="admin-row">
          <input
            className="admin-input admin-search"
            placeholder="Rechercher un produit"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select className="admin-select" value={filter} onChange={(event) => setFilter(event.target.value as "all" | "active" | "inactive")}>
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Nom</th><th>Categorie</th><th>Prix</th><th>Promo</th><th>Etat</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="admin-skeleton-row">
                <td colSpan={6}><span /></td>
              </tr>
            )}
            {!loading && filteredProducts.map((product) => {
              const promo = promotionByProductId.get(product.id);
              return (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category?.name ?? "-"}</td>
                <td>{product.base_price.toLocaleString("fr-FR")} {product.currency}</td>
                <td>
                  {promo ? (
                    <span className="admin-badge active">Promo</span>
                  ) : (
                    <span className="admin-badge inactive">-</span>
                  )}
                </td>
                <td><span className={`admin-badge ${product.is_active ? "active" : "inactive"}`}>{product.is_active ? "Actif" : "Inactif"}</span></td>
                <td>
                  <button className="admin-btn secondary" onClick={() => onNavigate(`/admin/products/${product.id}`)}>Modifier</button>
                  <button
                    className="admin-btn secondary"
                    onClick={async () => {
                      onStatus("saving");
                      await adminApi.products.create(token, {
                        name: `${product.name} (copie)`,
                        slug: "",
                        description: product.description ?? "",
                        image_url: product.image_url ?? "",
                        base_price: product.base_price,
                        currency: product.currency,
                        category_id: product.category_id,
                        is_active: false,
                        sort_order: product.sort_order,
                      });
                      onFeedback("Produit duplique");
                      onStatus("saved");
                      window.setTimeout(() => onStatus("idle"), 1400);
                      refresh();
                    }}
                  >
                    Dupliquer
                  </button>
                  <button
                    className="admin-btn secondary"
                    onClick={async () => {
                      onStatus("saving");
                      if (promo) {
                        await adminApi.promotions.remove(token, promo.id);
                        onFeedback("Promotion retiree");
                      } else {
                        await adminApi.promotions.create(token, {
                          name: `Promo ${product.name}`,
                          scope_type: "product",
                          scope_id: product.id,
                          discount_type: "percent",
                          discount_value: 10,
                          discount_percent: 10,
                          is_active: true,
                        });
                        onFeedback("Promotion ajoutee");
                      }
                      onStatus("saved");
                      window.setTimeout(() => onStatus("idle"), 1400);
                      refresh();
                    }}
                  >
                    {promo ? "Retirer promo" : "Mettre promo"}
                  </button>
                  <button
                    className="admin-btn secondary"
                    onClick={async () => {
                      onStatus("saving");
                      await adminApi.products.update(token, product.id, {
                        ...product,
                        name: product.name,
                        base_price: product.base_price,
                        category_id: product.category_id,
                        is_active: !product.is_active,
                      });
                      onFeedback("Etat mis a jour");
                      onStatus("saved");
                      window.setTimeout(() => onStatus("idle"), 1400);
                      refresh();
                    }}
                  >
                    {product.is_active ? "Desactiver" : "Activer"}
                  </button>
                  <button
                    className="admin-btn danger"
                    onClick={async () => {
                      if (!window.confirm("Cette action est irreversible. Supprimer definitivement ?")) return;
                      onStatus("saving");
                      await adminApi.products.remove(token, product.id);
                      onFeedback("Produit supprime");
                      onStatus("saved");
                      window.setTimeout(() => onStatus("idle"), 1400);
                      refresh();
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProductForm({ token, categories, productId, onDone, onStatus }: { token: string; categories: AdminCategory[]; productId: number | null; onDone: () => void; onStatus: (value: "idle" | "saving" | "saved") => void; }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageStatus, setImageStatus] = useState("");
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState("XOF");
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id ?? 0);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    if (categories.length > 0 && categoryId === 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  useEffect(() => {
    if (!productId) return;
    adminApi.products.get(token, productId).then((product) => {
      setName(product.name);
      setSlug(product.slug);
      setDescription(product.description ?? "");
      setImageUrl(product.image_url ?? "");
      setImagePreview(product.image_url ?? "");
      setPrice(product.base_price);
      setCurrency(product.currency);
      setCategoryId(product.category_id);
      setIsActive(product.is_active);
      setSortOrder(product.sort_order);
    });
  }, [token, productId]);

  const isValid = name.trim().length > 0 && price >= 0 && categoryId > 0;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    onStatus("saving");
    const payload = {
      name,
      slug,
      description,
      image_url: imageUrl,
      base_price: Number(price),
      currency,
      category_id: Number(categoryId),
      is_active: isActive,
      sort_order: Number(sortOrder),
    };

    if (productId) {
      await adminApi.products.update(token, productId, payload);
    } else {
      await adminApi.products.create(token, payload);
    }

    onDone();
  };

  return (
    <section className="admin-page">
      <AdminTopbar title={productId ? "Modifier produit" : "Nouveau produit"} status={isValid ? "Pret" : "Champs manquants"} />
      <div className="admin-card">
      <form className="admin-form-grid" onSubmit={submit}>
        <div><label>Nom</label><input className="admin-input" value={name} onChange={(event) => setName(event.target.value)} required /></div>
        <div><label>Slug</label><input className="admin-input" value={slug} onChange={(event) => setSlug(event.target.value)} /></div>
        <div><label>Categorie</label><select className="admin-select" value={categoryId} onChange={(event) => setCategoryId(Number(event.target.value))}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
        <div><label>Prix</label><input className="admin-input" type="number" min={0} value={price} onChange={(event) => setPrice(Number(event.target.value))} required /></div>
        <div><label>Devise</label><input className="admin-input" value={currency} onChange={(event) => setCurrency(event.target.value)} /></div>
        <div><label>Ordre</label><input className="admin-input" type="number" min={0} value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} /></div>
        <div className="full">
          <label>Image</label>
          <div className="admin-upload">
            <input
              className="admin-input"
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setImageStatus("Upload en cours...");
                try {
                  const result = await adminApi.uploadImage(token, file);
                  setImageUrl(result.url);
                  setImagePreview(result.url);
                  setImageStatus("Image chargee");
                } catch {
                  setImageStatus("Echec upload");
                }
              }}
            />
            {imagePreview && <img className="admin-upload-preview" src={imagePreview} alt="Apercu" />}
            {imageStatus && <span className="admin-upload-status">{imageStatus}</span>}
          </div>
        </div>
        <div className="full"><label>Description</label><textarea className="admin-textarea" value={description} onChange={(event) => setDescription(event.target.value)} /></div>
        <label className="full"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> Actif</label>
        <div className="full"><button className="admin-btn" type="submit" disabled={!isValid}>Enregistrer</button></div>
      </form>
      </div>
    </section>
  );
}

function CategoriesPage({ token, pathname, onNavigate, onFeedback, onStatus }: { token: string; pathname: string; onNavigate: (href: string) => void; onFeedback: (msg: string) => void; onStatus: (value: "idle" | "saving" | "saved") => void; }) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const editingId = useMemo(() => {
    const match = pathname.match(/^\/admin\/categories\/(\d+)$/);
    return match ? Number(match[1]) : null;
  }, [pathname]);

  const isFormView = pathname === "/admin/categories/new" || editingId !== null;

  const refresh = () => {
    setLoading(true);
    adminApi.categories.list(token).then((data) => {
      setCategories(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    onStatus("idle");
    refresh();
  }, [token, onStatus]);

  const filteredCategories = categories.filter((category) => {
    const matchesQuery = category.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && category.is_active) ||
      (filter === "inactive" && !category.is_active);
    return matchesQuery && matchesFilter;
  });

  if (isFormView) {
    return (
      <CategoryForm
        token={token}
        categoryId={editingId}
        onStatus={onStatus}
        onDone={() => {
          onFeedback("Categorie enregistree");
          onStatus("saved");
          window.setTimeout(() => onStatus("idle"), 1400);
          refresh();
          onNavigate("/admin/categories");
        }}
      />
    );
  }

  return (
    <section className="admin-page">
      <AdminTopbar
        title="Categories"
        status={loading ? "Chargement..." : "Pret"}
        actionLabel="Ajouter"
        onAction={() => onNavigate("/admin/categories/new")}
      />
      <div className="admin-card">
        <div className="admin-row">
          <input
            className="admin-input admin-search"
            placeholder="Rechercher une categorie"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select className="admin-select" value={filter} onChange={(event) => setFilter(event.target.value as "all" | "active" | "inactive")}>
            <option value="all">Toutes</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
          </select>
        </div>
      </div>
      <div className="admin-card">
      <table className="admin-table">
        <thead>
          <tr><th>Nom</th><th>Slug</th><th>Ordre</th><th>Etat</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {loading && (
            <tr className="admin-skeleton-row">
              <td colSpan={5}><span /></td>
            </tr>
          )}
          {!loading && filteredCategories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.slug}</td>
              <td>{category.sort_order ?? 0}</td>
              <td><span className={`admin-badge ${category.is_active ? "active" : "inactive"}`}>{category.is_active ? "Actif" : "Inactif"}</span></td>
              <td>
                <button className="admin-btn secondary" onClick={() => onNavigate(`/admin/categories/${category.id}`)}>Modifier</button>
                <button
                  className="admin-btn secondary"
                  onClick={async () => {
                    onStatus("saving");
                    await adminApi.categories.update(token, category.id, {
                      ...category,
                      name: category.name,
                      is_active: !category.is_active,
                    });
                    onFeedback("Etat mis a jour");
                    onStatus("saved");
                    window.setTimeout(() => onStatus("idle"), 1400);
                    refresh();
                  }}
                >
                  {category.is_active ? "Desactiver" : "Activer"}
                </button>
                <button
                  className="admin-btn danger"
                  onClick={async () => {
                    if (!window.confirm("Suppression definitive. Confirmer ?")) return;
                    onStatus("saving");
                    try {
                      await adminApi.categories.remove(token, category.id);
                      onFeedback("Categorie supprimee");
                    } catch (error) {
                      onFeedback(error instanceof Error ? error.message : "Suppression impossible");
                    }
                    onStatus("saved");
                    window.setTimeout(() => onStatus("idle"), 1400);
                    refresh();
                  }}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}

function CategoryForm({ token, categoryId, onDone, onStatus }: { token: string; categoryId: number | null; onDone: () => void; onStatus: (value: "idle" | "saving" | "saved") => void; }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageStatus, setImageStatus] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    if (!categoryId) return;
    adminApi.categories.get(token, categoryId).then((category) => {
      setName(category.name);
      setSlug(category.slug);
      setImageUrl(category.image_url ?? "");
      setImagePreview(category.image_url ?? "");
      setIsActive(category.is_active);
      setSortOrder(category.sort_order ?? 0);
    });
  }, [token, categoryId]);

  const isValid = name.trim().length > 0;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    onStatus("saving");
    const payload = { name, slug, image_url: imageUrl, is_active: isActive, sort_order: sortOrder };
    if (categoryId) {
      await adminApi.categories.update(token, categoryId, payload);
    } else {
      await adminApi.categories.create(token, payload);
    }
    onDone();
  };

  return (
    <section className="admin-page">
      <AdminTopbar title={categoryId ? "Modifier categorie" : "Nouvelle categorie"} status={isValid ? "Pret" : "Champs manquants"} />
      <div className="admin-card">
      <form className="admin-form-grid" onSubmit={submit}>
        <div><label>Nom</label><input className="admin-input" value={name} onChange={(event) => setName(event.target.value)} required /></div>
        <div><label>Slug</label><input className="admin-input" value={slug} onChange={(event) => setSlug(event.target.value)} /></div>
        <div><label>Ordre</label><input className="admin-input" type="number" min={0} value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} /></div>
        <div className="full">
          <label>Image</label>
          <div className="admin-upload">
            <input
              className="admin-input"
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setImageStatus("Upload en cours...");
                try {
                  const result = await adminApi.uploadImage(token, file);
                  setImageUrl(result.url);
                  setImagePreview(result.url);
                  setImageStatus("Image chargee");
                } catch {
                  setImageStatus("Echec upload");
                }
              }}
            />
            {imagePreview && <img className="admin-upload-preview" src={imagePreview} alt="Apercu" />}
            {imageStatus && <span className="admin-upload-status">{imageStatus}</span>}
          </div>
        </div>
        <label className="full"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> Active</label>
        <div className="full"><button className="admin-btn" type="submit" disabled={!isValid}>Enregistrer</button></div>
      </form>
      </div>
    </section>
  );
}

function PromotionsPage({ token, onFeedback, onStatus }: { token: string; onFeedback: (msg: string) => void; onStatus: (value: "idle" | "saving" | "saved") => void; }) {
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [name, setName] = useState("");
  const [scopeType, setScopeType] = useState<"product" | "category">("product");
  const [scopeId, setScopeId] = useState(1);
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState(10);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    adminApi.promotions.list(token).then((data) => {
      setPromotions(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    onStatus("idle");
    refresh();
  }, [token, onStatus]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    onStatus("saving");
    await adminApi.promotions.create(token, {
      name,
      scope_type: scopeType,
      scope_id: Number(scopeId),
      discount_type: discountType,
      discount_value: Number(discountValue),
      discount_percent: discountType === "percent" ? Number(discountValue) : null,
      start_at: startAt || null,
      end_at: endAt || null,
      is_active: true,
    });
    setName("");
    onFeedback("Promotion ajoutee");
    onStatus("saved");
    window.setTimeout(() => onStatus("idle"), 1400);
    refresh();
  };

  const toggleActive = async (promotion: AdminPromotion) => {
    if (!window.confirm("Confirmer le changement d'etat de la promotion ?")) return;
    onStatus("saving");
    await adminApi.promotions.update(token, promotion.id, {
      ...promotion,
      is_active: !promotion.is_active,
    });
    onFeedback("Promotion mise a jour");
    onStatus("saved");
    window.setTimeout(() => onStatus("idle"), 1400);
    refresh();
  };

  return (
    <section className="admin-page">
      <AdminTopbar title="Promotions" status={loading ? "Chargement..." : "Pret"} />
      <div className="admin-card">
        <form className="admin-form-grid" onSubmit={submit}>
          <div><label>Nom</label><input className="admin-input" value={name} onChange={(event) => setName(event.target.value)} required /></div>
          <div><label>Scope</label><select className="admin-select" value={scopeType} onChange={(event) => setScopeType(event.target.value as "product" | "category")}><option value="product">Produit</option><option value="category">Categorie</option></select></div>
          <div><label>Scope ID</label><input className="admin-input" type="number" min={1} value={scopeId} onChange={(event) => setScopeId(Number(event.target.value))} required /></div>
          <div>
            <label>Type</label>
            <select className="admin-select" value={discountType} onChange={(event) => setDiscountType(event.target.value as "percent" | "fixed")}>
              <option value="percent">Pourcentage</option>
              <option value="fixed">Prix fixe</option>
            </select>
          </div>
          <div>
            <label>{discountType === "percent" ? "Reduction (%)" : "Prix fixe"}</label>
            <input
              className="admin-input"
              type="number"
              min={1}
              value={discountValue}
              onChange={(event) => setDiscountValue(Number(event.target.value))}
            />
          </div>
          <div><label>Debut</label><input className="admin-input" type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} /></div>
          <div><label>Fin</label><input className="admin-input" type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} /></div>
          <div className="full"><button className="admin-btn" type="submit">Ajouter promotion</button></div>
        </form>
      </div>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Nom</th><th>Scope</th><th>Reduction</th><th>Etat</th><th>Action</th></tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="admin-skeleton-row">
                <td colSpan={5}><span /></td>
              </tr>
            )}
            {!loading && promotions.map((promotion) => (
              <tr key={promotion.id}>
                <td>{promotion.name}</td>
                <td>{promotion.scope_type} #{promotion.scope_id}</td>
                <td>{promotion.discount_percent ?? 0}%</td>
                <td><span className={`admin-badge ${promotion.is_active ? "active" : "inactive"}`}>{promotion.is_active ? "Active" : "Inactive"}</span></td>
                <td><button className="admin-btn secondary" onClick={() => toggleActive(promotion)}>{promotion.is_active ? "Desactiver" : "Activer"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ContentPage({ token, onFeedback, onStatus }: { token: string; onFeedback: (msg: string) => void; onStatus: (value: "idle" | "saving" | "saved") => void; }) {
  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    adminApi.content.list(token).then((data) => {
      setItems(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    onStatus("idle");
    refresh();
  }, [token, onStatus]);

  const updateItem = (id: number, patch: Partial<SiteContentItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const save = async () => {
    onStatus("saving");
    await adminApi.content.upsert(
      token,
      items.map((item) => ({
        key: item.key,
        value: item.value,
        content_type: item.content_type,
        is_active: item.is_active,
      }))
    );
    onFeedback("Contenu enregistre");
    onStatus("saved");
    window.setTimeout(() => onStatus("idle"), 1400);
  };

  return (
    <section className="admin-page">
      <AdminTopbar title="Contenu" status={loading ? "Chargement..." : "Pret"} actionLabel="Enregistrer" onAction={save} />
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Cle</th><th>Valeur</th><th>Type</th><th>Etat</th></tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="admin-skeleton-row">
                <td colSpan={4}><span /></td>
              </tr>
            )}
            {!loading && items.map((item) => (
              <tr key={item.id}>
                <td>{item.key}</td>
                <td><input className="admin-input" value={item.value ?? ""} onChange={(event) => updateItem(item.id, { value: event.target.value })} /></td>
                <td>
                  <select className="admin-select" value={item.content_type} onChange={(event) => updateItem(item.id, { content_type: event.target.value as "text" | "image" })}>
                    <option value="text">Texte</option>
                    <option value="image">Image</option>
                  </select>
                </td>
                <td><input type="checkbox" checked={item.is_active} onChange={(event) => updateItem(item.id, { is_active: event.target.checked })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MediaPage({ token, onStatus }: { token: string; onStatus: (value: "idle" | "saving" | "saved") => void }) {
  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onStatus("idle");
    setLoading(true);
    adminApi.content.list(token).then((data) => {
      setItems(data.filter((item) => item.key.startsWith("banner_")));
      setLoading(false);
    });
  }, [token, onStatus]);

  const uploadForKey = async (key: string, file: File) => {
    onStatus("saving");
    const result = await adminApi.uploadImage(token, file);
    await adminApi.content.upsert(token, [{ key, value: result.url, content_type: "image", is_active: true }]);
    onStatus("saved");
    window.setTimeout(() => onStatus("idle"), 1400);
    const next = await adminApi.content.list(token);
    setItems(next.filter((item) => item.key.startsWith("banner_")));
  };

  return (
    <section className="admin-page">
      <AdminTopbar title="Media" status={loading ? "Chargement..." : "Pret"} />
      <div className="admin-card">
        {loading && <div className="admin-skeleton-row" />}
        {!loading && items.map((item) => (
          <div className="admin-media-row" key={item.id}>
            <div>
              <strong>{item.key}</strong>
              <div className="admin-upload">
                <input
                  className="admin-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadForKey(item.key, file);
                  }}
                />
                {item.value && <img className="admin-upload-preview" src={item.value} alt={item.key} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ThemePage({ token, onStatus }: { token: string; onStatus: (value: "idle" | "saving" | "saved") => void }) {
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState("dark");
  const [primary, setPrimary] = useState("#7c5cff");
  const [secondary, setSecondary] = useState("#57d4ff");
  const [accent, setAccent] = useState("#ff8c3c");
  const [button, setButton] = useState("#7c5cff");
  const [buttonHover, setButtonHover] = useState("#57d4ff");
  const [radius, setRadius] = useState("14");

  useEffect(() => {
    onStatus("idle");
    setLoading(true);
    adminApi.settings.list(token).then((data) => {
      const getValue = (key: string, fallback: string) =>
        data.find((item) => item.key === key)?.value ?? fallback;
      setMode(getValue("theme_mode", "dark"));
      setPrimary(getValue("theme_primary", "#7c5cff"));
      setSecondary(getValue("theme_secondary", "#57d4ff"));
      setAccent(getValue("theme_accent", "#ff8c3c"));
      setButton(getValue("theme_button", "#7c5cff"));
      setButtonHover(getValue("theme_button_hover", "#57d4ff"));
      setRadius(getValue("theme_radius", "14"));
      setLoading(false);
    });
  }, [token, onStatus]);

  const save = async () => {
    onStatus("saving");
    await adminApi.settings.upsert(token, [
      { key: "theme_mode", value: mode, is_public: true },
      { key: "theme_primary", value: primary, is_public: true },
      { key: "theme_secondary", value: secondary, is_public: true },
      { key: "theme_accent", value: accent, is_public: true },
      { key: "theme_button", value: button, is_public: true },
      { key: "theme_button_hover", value: buttonHover, is_public: true },
      { key: "theme_radius", value: radius, is_public: true },
    ]);
    onStatus("saved");
    window.setTimeout(() => onStatus("idle"), 1400);
  };

  return (
    <section className="admin-page">
      <AdminTopbar title="Theme" status={loading ? "Chargement..." : "Pret"} actionLabel="Enregistrer" onAction={save} />
      <div className="admin-card">
        <form className="admin-form-grid" onSubmit={(event) => { event.preventDefault(); void save(); }}>
          <div>
            <label>Mode</label>
            <select className="admin-select" value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="dark">Sombre</option>
              <option value="light">Clair</option>
            </select>
          </div>
          <div><label>Couleur principale</label><input className="admin-input" type="color" value={primary} onChange={(event) => setPrimary(event.target.value)} /></div>
          <div><label>Couleur secondaire</label><input className="admin-input" type="color" value={secondary} onChange={(event) => setSecondary(event.target.value)} /></div>
          <div><label>Couleur accent</label><input className="admin-input" type="color" value={accent} onChange={(event) => setAccent(event.target.value)} /></div>
          <div><label>Couleur boutons</label><input className="admin-input" type="color" value={button} onChange={(event) => setButton(event.target.value)} /></div>
          <div><label>Couleur hover</label><input className="admin-input" type="color" value={buttonHover} onChange={(event) => setButtonHover(event.target.value)} /></div>
          <div><label>Arrondi (px)</label><input className="admin-input" type="number" min={4} value={radius} onChange={(event) => setRadius(event.target.value)} /></div>
        </form>
      </div>
    </section>
  );
}

function SettingsPage({ token, onLogout, onStatus }: { token: string; onLogout: () => void; onStatus: (value: "idle" | "saving" | "saved") => void }) {
  const [loading, setLoading] = useState(true);
  const [adminButtonEnabled, setAdminButtonEnabled] = useState(true);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [adminCode, setAdminCode] = useState("");

  useEffect(() => {
    onStatus("idle");
    setLoading(true);
    adminApi.settings.list(token).then((data) => {
      const getValue = (key: string, fallback: string) =>
        data.find((item) => item.key === key)?.value ?? fallback;
      setAdminButtonEnabled(getValue("admin_button_enabled", "true") === "true");
      setMaintenanceEnabled(getValue("maintenance_enabled", "false") === "true");
      setMaintenanceMessage(getValue("maintenance_message", ""));
      setAdminCode(getValue("admin_code", ""));
      setLoading(false);
    });
  }, [token, onStatus]);

  const save = async () => {
    onStatus("saving");
    await adminApi.settings.upsert(token, [
      { key: "admin_button_enabled", value: adminButtonEnabled ? "true" : "false", is_public: true },
      { key: "maintenance_enabled", value: maintenanceEnabled ? "true" : "false", is_public: true },
      { key: "maintenance_message", value: maintenanceMessage, is_public: true },
      { key: "admin_code", value: adminCode, is_public: false },
    ]);
    onStatus("saved");
    window.setTimeout(() => onStatus("idle"), 1400);
  };

  return (
    <section className="admin-page">
      <AdminTopbar title="Parametres" status={loading ? "Chargement..." : "Pret"} actionLabel="Enregistrer" onAction={save} />
      <div className="admin-card">
        <form className="admin-form-grid" onSubmit={(event) => { event.preventDefault(); void save(); }}>
          <label className="full"><input type="checkbox" checked={adminButtonEnabled} onChange={(event) => setAdminButtonEnabled(event.target.checked)} /> Bouton Admin visible</label>
          <label className="full"><input type="checkbox" checked={maintenanceEnabled} onChange={(event) => setMaintenanceEnabled(event.target.checked)} /> Mode maintenance</label>
          <div className="full"><label>Message maintenance</label><input className="admin-input" value={maintenanceMessage} onChange={(event) => setMaintenanceMessage(event.target.value)} /></div>
          <div className="full"><label>Nouveau code admin</label><input className="admin-input" value={adminCode} onChange={(event) => setAdminCode(event.target.value)} /></div>
        </form>
      </div>
      <div className="admin-card">
        <p>Base API: {adminApi.baseUrl}</p>
        <button className="admin-btn" onClick={onLogout}>Deconnexion admin</button>
      </div>
    </section>
  );
}

function AdminTopbar({
  title,
  status,
  actionLabel,
  onAction,
}: {
  title: string;
  status: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="admin-topbar">
      <div>
        <h1>{title}</h1>
        <span className="admin-status">{status}</span>
      </div>
      {actionLabel && onAction && (
        <button className="admin-btn" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}
