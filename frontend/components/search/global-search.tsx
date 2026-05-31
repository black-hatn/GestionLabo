"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, User, ClipboardList, X } from "lucide-react";
import apiClient from "@/services/api/client";

/* ── Types ── */
interface PatientResult {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  record_number?: string;
}

interface DemandeResult {
  id: string;
  patient_name?: string;
  exam_name?: string;
  status?: string;
}

interface SearchItem {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  type: "patient" | "demande";
}

/* ── Debounce hook ── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function GlobalSearch() {
  const router = useRouter();

  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState<SearchItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [open, setOpen]           = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  /* ── Fetch results ── */
  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const [patientsRes, demandesRes] = await Promise.allSettled([
        apiClient.get("/patients", { params: { search: q, limit: 5 } }),
        apiClient.get("/demandes", { params: { search: q, limit: 3 } }),
      ]);

      const patients: SearchItem[] =
        patientsRes.status === "fulfilled"
          ? ((patientsRes.value.data?.items ?? patientsRes.value.data ?? []) as PatientResult[]).map(
              (p) => ({
                id:       p.id,
                label:    p.name ?? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || `Patient #${p.id.slice(0, 6)}`,
                sublabel: p.record_number ? `Dossier n°${p.record_number}` : "Patient",
                href:     `/dashboard/patients/${p.id}`,
                type:     "patient" as const,
              })
            )
          : [];

      const demandes: SearchItem[] =
        demandesRes.status === "fulfilled"
          ? ((demandesRes.value.data?.items ?? demandesRes.value.data ?? []) as DemandeResult[]).map(
              (d) => ({
                id:       d.id,
                label:    d.exam_name ?? `Demande #${d.id.slice(0, 6)}`,
                sublabel: d.patient_name ? `Patient : ${d.patient_name}` : (d.status ?? "Demande"),
                href:     `/dashboard/demandes/${d.id}`,
                type:     "demande" as const,
              })
            )
          : [];

      setResults([...patients, ...demandes]);
      setOpen(true);
      setActiveIdx(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  /* ── Outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Keyboard navigation ── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;

    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = activeIdx >= 0 ? results[activeIdx] : results[0];
      if (item) {
        router.push(item.href);
        setOpen(false);
        setQuery("");
      }
    }
  };

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs md:max-w-sm">
      {/* ── Input ── */}
      <div
        className="flex items-center gap-2 rounded-xl border px-3.5 py-2 transition-all"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderColor: open || query ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.07)",
        }}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-spin" />
        ) : (
          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        )}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Rechercher patient, examen..."
          className="bg-transparent border-none p-0 text-sm text-slate-300 focus:outline-none w-full placeholder-slate-600"
          autoComplete="off"
        />

        {query && (
          <button onClick={handleClear} className="text-slate-600 hover:text-slate-400 transition-colors shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <kbd className="text-[10px] font-semibold text-slate-600 border border-white/[0.08] rounded px-1.5 py-0.5 hidden sm:block shrink-0">
          ⌘K
        </kbd>
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div
          className="absolute top-[calc(100%+8px)] left-0 right-0 rounded-xl border overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          style={{
            background: "#0c1828",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          {/* Empty state */}
          {!loading && results.length === 0 && query.trim() && (
            <div className="px-4 py-6 text-center text-xs text-slate-600">
              Aucun résultat pour{" "}
              <span className="text-slate-400 font-semibold">&ldquo;{query}&rdquo;</span>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <ul>
              {/* Patients group header */}
              {results.some(r => r.type === "patient") && (
                <li className="px-4 pt-3 pb-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Patients</span>
                </li>
              )}
              {results
                .filter(r => r.type === "patient")
                .map((item, i) => {
                  const globalIdx = results.indexOf(item);
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleSelect(item.href)}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          activeIdx === globalIdx ? "bg-emerald-500/10" : "hover:bg-emerald-500/[0.06]"
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">{item.label}</p>
                          <p className="text-xs text-slate-500 truncate">{item.sublabel}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}

              {/* Demandes group header */}
              {results.some(r => r.type === "demande") && (
                <li className="px-4 pt-3 pb-1 border-t border-white/[0.05]">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Demandes</span>
                </li>
              )}
              {results
                .filter(r => r.type === "demande")
                .map((item) => {
                  const globalIdx = results.indexOf(item);
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleSelect(item.href)}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          activeIdx === globalIdx ? "bg-emerald-500/10" : "hover:bg-emerald-500/[0.06]"
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
                          <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">{item.label}</p>
                          <p className="text-xs text-slate-500 truncate">{item.sublabel}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
            </ul>
          )}

          {/* Footer hint */}
          {results.length > 0 && (
            <div className="px-4 py-2 border-t border-white/[0.05] flex items-center gap-3 text-[10px] text-slate-700">
              <span><kbd className="border border-white/[0.08] rounded px-1 bg-white/[0.03]">↑↓</kbd> naviguer</span>
              <span><kbd className="border border-white/[0.08] rounded px-1 bg-white/[0.03]">↵</kbd> ouvrir</span>
              <span><kbd className="border border-white/[0.08] rounded px-1 bg-white/[0.03]">Esc</kbd> fermer</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
