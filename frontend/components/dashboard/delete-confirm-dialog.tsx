"use client";

import { Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  itemName: string;
  itemType?: string;
  saving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * DeleteConfirmDialog — Dialog générique de confirmation de suppression.
 * Réutilisable pour n'importe quelle entité (examen, patient, utilisateur…).
 */
export function DeleteConfirmDialog({
  open, itemName, itemType = "cet élément", saving, onConfirm, onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-scale-in
          dark:bg-[#0c1828] dark:border dark:border-white/[0.08]
          bg-white border border-slate-200">

        <div className="p-6">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-400" />
          </div>

          {/* Text */}
          <div className="text-center mb-6">
            <h3 className="font-bold text-lg dark:text-white text-slate-900 mb-2">
              Supprimer {itemType} ?
            </h3>
            <p className="text-sm dark:text-slate-400 text-slate-500">
              <span className="font-semibold dark:text-white text-slate-800">&laquo;{itemName}&raquo;</span>
              {" "}sera définitivement supprimé. Cette action est irréversible.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} disabled={saving} className="flex-1 btn-ghost h-10">
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={onConfirm}
              disabled={saving}
              className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Suppression...</>
                : <><Trash2 className="w-4 h-4 mr-2" />Supprimer</>
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
