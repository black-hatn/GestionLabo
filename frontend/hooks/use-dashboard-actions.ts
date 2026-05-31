"use client";

import { useState, useCallback } from "react";

export type DashboardDialog =
  | "schedule"   // Planifier un examen
  | "report"     // Rapport IA
  | "alert"      // Résultats critiques
  | null;

/**
 * useDashboardActions — gère l'état des dialogs du tableau de bord.
 * Séparation logique (hook) / rendu (page).
 */
export function useDashboardActions() {
  const [openDialog, setOpenDialog] = useState<DashboardDialog>(null);

  const openSchedule = useCallback(() => setOpenDialog("schedule"), []);
  const openReport   = useCallback(() => setOpenDialog("report"),   []);
  const openAlert    = useCallback(() => setOpenDialog("alert"),     []);
  const closeDialog  = useCallback(() => setOpenDialog(null),        []);

  return { openDialog, openSchedule, openReport, openAlert, closeDialog };
}
