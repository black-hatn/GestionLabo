"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export function ModulePage({
  title,
  resource,
  samplePayload,
}: {
  title: string;
  resource: string;
  samplePayload: Record<string, unknown>;
}) {
  const { accessToken } = useAuthStore();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [body, setBody] = useState(JSON.stringify(samplePayload, null, 2));
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await api.list<Record<string, unknown>>(resource, accessToken);
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Loading failed");
    }
  }, [accessToken, resource]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    try {
      const payload = JSON.parse(body) as Record<string, unknown>;
      await api.create(resource, payload, accessToken);
      await loadItems();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Creation failed");
    }
  };

  return (
    <div className="card" style={{ display: "grid", gap: "1rem" }}>
      <h2>{title}</h2>
      <form onSubmit={onCreate} style={{ display: "grid", gap: "0.5rem" }}>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} />
        <button type="submit">Creer</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <pre style={{ overflowX: "auto", background: "#111827", color: "#e5e7eb", padding: "0.8rem", borderRadius: 8 }}>
        {JSON.stringify(items, null, 2)}
      </pre>
    </div>
  );
}
