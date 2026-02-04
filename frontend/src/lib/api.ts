export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function csrf() {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  try {
    await fetch(API_BASE.replace(/\/api$/, "/sanctum/csrf-cookie"), {
      credentials: "include",
    });
  } catch (e) {
    // Erreur CSRF silencieuse - continuer quand même
  }
}

function getXsrfToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiPost<T = unknown>(path: string, body: Record<string, unknown>) {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  await csrf();
  const token = getXsrfToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["X-XSRF-TOKEN"] = token;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorData = await res.json();
      
      // Si c'est une erreur de validation avec détails
      if (errorData.errors && typeof errorData.errors === 'object') {
        const errorDetails = Object.entries(errorData.errors)
          .map(([field, msgs]: [string, unknown]) => {
            const messages = Array.isArray(msgs) ? msgs[0] : msgs;
            return messages;
          })
          .join(", ");
        errorMessage = errorDetails || errorData.message || "Erreur de validation";
      } else {
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      }
    } catch {
      const text = await res.text();
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return (await res.json()) as T;
}

export async function apiGet<T = unknown>(path: string) {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as T;
}

export async function apiDelete<T = unknown>(path: string) {
  await csrf();
  const token = getXsrfToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["X-XSRF-TOKEN"] = token;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
    } catch {
      const text = await res.text();
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return (await res.json()) as T;
}
