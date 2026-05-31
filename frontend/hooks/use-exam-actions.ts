"use client";

import { useState, useCallback } from "react";
import examService from "@/services/api/exam";

export type ExamData = {
  id: string;
  name: string;
  description?: string;
  reference_values: Record<string, unknown>;
  unit?: string;
  is_active: boolean;
  created_at: string;
};

export type ExamModalState =
  | { type: "idle" }
  | { type: "view";   exam: ExamData }
  | { type: "edit";   exam: ExamData }
  | { type: "create" }
  | { type: "delete"; exam: ExamData };

/**
 * useExamActions — Centralise la logique CRUD des examens.
 * La vue ne gère que l'affichage ; toute mutation passe ici.
 */
export function useExamActions(onRefresh: () => void) {
  const [modal, setModal]   = useState<ExamModalState>({ type: "idle" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  // ── Ouverture des modaux ──────────────────────────────
  const openView   = useCallback((exam: ExamData) => setModal({ type: "view",   exam }), []);
  const openEdit   = useCallback((exam: ExamData) => setModal({ type: "edit",   exam }), []);
  const openCreate = useCallback(()               => setModal({ type: "create" }),        []);
  const openDelete = useCallback((exam: ExamData) => setModal({ type: "delete", exam }), []);
  const closeModal = useCallback(() => { setModal({ type: "idle" }); setError(null); },   []);

  // ── Mutations ─────────────────────────────────────────
  const handleCreate = useCallback(async (payload: {
    name: string;
    description?: string;
    unit?: string;
    reference_values?: Record<string, unknown>;
  }) => {
    setSaving(true);
    setError(null);
    try {
      await examService.createExam({
        ...payload,
        reference_values: payload.reference_values ?? {},
        is_active: true,
      });
      closeModal();
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(e?.response?.data?.detail ?? e?.message ?? "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  }, [closeModal, onRefresh]);

  const handleUpdate = useCallback(async (id: string, payload: {
    name?: string;
    description?: string;
    unit?: string;
    is_active?: boolean;
    reference_values?: Record<string, unknown>;
  }) => {
    setSaving(true);
    setError(null);
    try {
      await examService.updateExam(id, payload);
      closeModal();
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(e?.response?.data?.detail ?? e?.message ?? "Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  }, [closeModal, onRefresh]);

  const handleDelete = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await examService.deleteExam(id);
      closeModal();
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(e?.response?.data?.detail ?? e?.message ?? "Erreur lors de la suppression");
    } finally {
      setSaving(false);
    }
  }, [closeModal, onRefresh]);

  const handleToggleActive = useCallback(async (exam: ExamData) => {
    try {
      await examService.updateExam(exam.id, { is_active: !exam.is_active });
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(e?.response?.data?.detail ?? e?.message ?? "Erreur");
    }
  }, [onRefresh]);

  return {
    modal,
    saving,
    error,
    setError,
    openView,
    openEdit,
    openCreate,
    openDelete,
    closeModal,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleActive,
  };
}
