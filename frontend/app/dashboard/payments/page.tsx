"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";
import paymentService from "@/services/api/payment";
import { AlertCircle, Plus, Loader2, CreditCard, TrendingUp, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState<"ALL" | "CARTE" | "ESPECES" | "CHEQUE" | "VIREMENT">("ALL");

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getPayments(page, 10);
      setPayments(response.items || []);
      setTotalPages(response.pages || 1);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Erreur lors du chargement des paiements";
      setError(errorMessage);
      console.error("Error loading payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [page]);

  const getMethodBadgeVariant = (method: string) => {
    const methodUpper = method?.toUpperCase();
    switch (methodUpper) {
      case "CARTE":
        return "default";
      case "ESPECES":
        return "success";
      case "CHEQUE":
        return "warning";
      case "VIREMENT":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getMethodLabel = (method: string) => {
    const methodUpper = method?.toUpperCase();
    switch (methodUpper) {
      case "CARTE":
        return "Carte Bancaire";
      case "ESPECES":
        return "Espèces";
      case "CHEQUE":
        return "Chèque";
      case "VIREMENT":
        return "Virement";
      default:
        return method;
    }
  };

  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
    byMethod: {
      carte: payments.filter(p => p.method?.toUpperCase() === "CARTE").length,
      especes: payments.filter(p => p.method?.toUpperCase() === "ESPECES").length,
      cheque: payments.filter(p => p.method?.toUpperCase() === "CHEQUE").length,
      virement: payments.filter(p => p.method?.toUpperCase() === "VIREMENT").length,
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(search.toLowerCase()) ||
      payment.invoice_id?.toString().includes(search);

    const matchesMethod = filterMethod === "ALL" || payment.method?.toUpperCase() === filterMethod;

    return matchesSearch && matchesMethod;
  });

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-8 animate-fade-in">
        {/* Professional Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">Règlement des Prestations 💳</h1>
              <p className="text-green-100 text-lg">Visualisez les règlements reçus, enregistrez les paiements et solider les écritures</p>
            </div>
            <div className="hidden md:block">
              <CreditCard className="w-24 h-24 opacity-20" />
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Amount Card */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5 rounded-full blur-2xl bg-green-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-green-700">Total Paiements</CardTitle>
              <div className="p-2.5 rounded-xl bg-green-200">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-green-700">{stats.totalAmount.toFixed(2)}€</div>
              <p className="text-xs text-green-600 mt-2">{stats.total} paiements enregistrés</p>
            </CardContent>
          </Card>

          {/* Payment Methods Card */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10 rounded-full blur-2xl bg-primary-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-neutral-600">Méthodes de Paiement</CardTitle>
              <div className="p-2.5 rounded-xl bg-primary-100">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Carte:</span>
                  <span className="font-semibold text-neutral-900">{stats.byMethod.carte}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Espèces:</span>
                  <span className="font-semibold text-neutral-900">{stats.byMethod.especes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Chèque:</span>
                  <span className="font-semibold text-neutral-900">{stats.byMethod.cheque}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Virement:</span>
                  <span className="font-semibold text-neutral-900">{stats.byMethod.virement}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters and Search */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Filtres et Recherche</CardTitle>
                <CardDescription>Trouvez les paiements que vous recherchez</CardDescription>
              </div>
              <Search className="w-6 h-6 text-green-600 opacity-30" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Rechercher par ID ou facture..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 py-3 transition-all focus:ring-2 focus:ring-green-500"
                />
              </div>
              <Button className="gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all">
                <Plus className="w-4 h-4" />
                Nouveau Paiement
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {["ALL", "CARTE", "ESPECES", "CHEQUE", "VIREMENT"].map((method) => (
                <Button
                  key={method}
                  variant={filterMethod === method ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterMethod(method as any)}
                  className={filterMethod === method ? "bg-green-600 hover:bg-green-700 shadow-md" : "hover:bg-neutral-100"}
                >
                  {method === "ALL" ? "Tous" : getMethodLabel(method)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-800">{error}</span>
          </Alert>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-2" />
            <p className="text-neutral-600">Chargement des paiements...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800">Aucun paiement trouvé. Créez un nouveau paiement pour commencer.</span>
          </Alert>
        ) : (
          <div className="grid gap-6">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="relative overflow-hidden hover:shadow-lg transition-all duration-200 border-0">
                <div className="absolute top-0 right-0 w-20 h-20 opacity-5 rounded-full blur-2xl bg-green-500"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-bold text-lg text-neutral-900">Paiement #{payment.id.slice(0, 8)}</h3>
                        <Badge variant={getMethodBadgeVariant(payment.method)} className="shadow-sm">
                          {getMethodLabel(payment.method)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-neutral-500 font-medium">Montant</p>
                          <p className="text-sm font-bold text-green-600">{parseFloat(payment.amount).toFixed(2)}€</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 font-medium">Facture</p>
                          <p className="text-sm font-semibold text-neutral-900">{payment.invoice_id}</p>
                        </div>
                        {payment.reference && (
                          <div>
                            <p className="text-xs text-neutral-500 font-medium">Référence</p>
                            <p className="text-sm font-semibold text-neutral-900">{payment.reference}</p>
                          </div>
                        )}
                      </div>
                      {payment.notes && (
                        <p className="text-xs text-neutral-500 mt-3">
                          Notes: <span className="text-neutral-700 font-medium">{payment.notes}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex gap-2 justify-center items-center">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
            >
              Précédent
            </Button>
            <span className="px-4 py-2">Page {page} / {totalPages}</span>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </RoleGuard>
    </ProtectedRoute>
  );
}
