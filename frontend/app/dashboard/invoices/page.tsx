"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";
import invoiceService from "@/services/api/invoice";
import { useAuthStore } from "@/lib/auth-store";
import { AlertCircle, Plus, Eye, Edit2, Trash2, Download, Loader2, Receipt, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function InvoicesPage() {
  const user = useAuthStore(state => state.user);
  // Only ADMIN and RECEPTIONIST can create/edit invoices
  const canWrite = ["ADMIN", "RECEPTIONIST"].includes(user?.role ?? "");

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PAYEE" | "ENVOYEE" | "EN_RETARD">("ALL");

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceService.getInvoices(page, 10);
      setInvoices(response.items || []);
      setTotalPages(response.pages || 1);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Erreur lors du chargement des factures";
      setError(errorMessage);
      console.error("Error loading invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [page]);

  const getStatusBadgeVariant = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "PAYEE":
        return "success";
      case "ENVOYEE":
        return "default";
      case "BROUILLON":
        return "secondary";
      case "EN_RETARD":
        return "danger";
      case "ANNULEE":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "PAYEE":
        return "Payée";
      case "ENVOYEE":
        return "Envoyée";
      case "BROUILLON":
        return "Brouillon";
      case "EN_RETARD":
        return "En Retard";
      case "ANNULEE":
        return "Annulée";
      default:
        return status;
    }
  };

  // Calculate statistics
  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status?.toUpperCase() === "PAYEE").length,
    pending: invoices.filter(i => i.status?.toUpperCase() === "ENVOYEE").length,
    overdue: invoices.filter(i => i.status?.toUpperCase() === "EN_RETARD").length,
    totalAmount: invoices.reduce((sum, i) => sum + (parseFloat(i.total_amount) || 0), 0),
    paidAmount: invoices.reduce((sum, i) => sum + (parseFloat(i.paid_amount) || 0), 0),
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      invoice.patient_id.toString().toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || invoice.status?.toUpperCase() === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN", "RECEPTIONIST"]}>
      <div className="space-y-8 animate-fade-in">
        {/* Professional Header Section */}
        <div className="bg-gradient-to-r from-warning-600 to-warning-700 rounded-2xl p-8 text-white shadow-lg animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">Facturation & Devis 💰</h1>
              <p className="text-warning-100 text-lg">Gérez vos factures, devis et documents de facturation</p>
            </div>
            <div className="hidden md:block">
              <Receipt className="w-24 h-24 opacity-20" />
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Invoices Card */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10 rounded-full blur-2xl bg-primary-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-neutral-600">Total Factures</CardTitle>
              <div className="p-2.5 rounded-xl bg-primary-100">
                <Receipt className="w-5 h-5 text-primary-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-neutral-900">{stats.total}</div>
              <p className="text-xs text-neutral-500 mt-2">Factures enregistrées</p>
            </CardContent>
          </Card>

          {/* Paid Amount Card */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5 rounded-full blur-2xl bg-green-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-green-700">Payées</CardTitle>
              <div className="p-2.5 rounded-xl bg-green-200">
                <Receipt className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-green-700">{stats.paid}</div>
              <p className="text-xs text-green-600 mt-2">{stats.paidAmount.toFixed(2)}€ payés</p>
            </CardContent>
          </Card>

          {/* Pending Card */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5 rounded-full blur-2xl bg-blue-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-blue-700">En Attente</CardTitle>
              <div className="p-2.5 rounded-xl bg-blue-200">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-700">{stats.pending}</div>
              <p className="text-xs text-blue-600 mt-2">À relancer</p>
            </CardContent>
          </Card>

          {/* Overdue Card */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-red-50 to-red-100/50">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5 rounded-full blur-2xl bg-red-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-red-700">En Retard</CardTitle>
              <div className="p-2.5 rounded-xl bg-red-200">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-red-700">{stats.overdue}</div>
              <p className="text-xs text-red-600 mt-2">Action requise</p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-800">{error}</span>
          </Alert>
        )}

        {/* Enhanced Filters and Search */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Filtres et Recherche</CardTitle>
                <CardDescription>Trouvez les factures que vous recherchez</CardDescription>
              </div>
              <TrendingUp className="w-6 h-6 text-warning-600 opacity-30" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Rechercher par n° facture ou patient..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 py-3 transition-all focus:ring-2 focus:ring-warning-500"
                />
              </div>
              {!!canWrite && (
                <Link href="/dashboard/invoices/new" className="sm:w-auto">
                  <Button className="gap-2 w-full sm:w-auto bg-warning-600 hover:bg-warning-700 shadow-md hover:shadow-lg transition-all">
                    <Plus className="w-4 h-4" />
                    Nouvelle Facture
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {["ALL", "PAYEE", "ENVOYEE", "EN_RETARD"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status as any)}
                  className={filterStatus === status ? "bg-warning-600 hover:bg-warning-700 shadow-md" : "hover:bg-neutral-100"}
                >
                  {status === "ALL" ? "Tous" : status === "PAYEE" ? "Payées" : status === "ENVOYEE" ? "Envoyées" : "En Retard"}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-warning-600 mb-2" />
            <p className="text-neutral-600">Chargement des factures...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800">Aucune facture trouvée. Créez une nouvelle facture pour commencer.</span>
          </Alert>
        ) : (
          <div className="grid gap-6">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="relative overflow-hidden hover:shadow-lg transition-all duration-200 border-0">
                <div className="absolute top-0 right-0 w-20 h-20 opacity-5 rounded-full blur-2xl bg-warning-500"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-bold text-lg text-neutral-900">Facture #{invoice.invoice_number}</h3>
                        <Badge variant={getStatusBadgeVariant(invoice.status)} className="shadow-sm">
                          {getStatusLabel(invoice.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-neutral-500 font-medium">Patient</p>
                          <p className="text-sm font-semibold text-neutral-900">{invoice.patient_id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 font-medium">Montant Total</p>
                          <p className="text-sm font-bold text-neutral-900">{parseFloat(invoice.total_amount).toFixed(2)}€</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 font-medium">Payé</p>
                          <p className="text-sm font-bold text-green-600">{parseFloat(invoice.paid_amount).toFixed(2)}€</p>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500">
                        Émise le: {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Link href={`/dashboard/invoices/${invoice.id}`}>
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-warning-100 hover:text-warning-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-warning-100 hover:text-warning-700 transition-colors">
                        <Download className="w-4 h-4" />
                      </Button>
                      {!!canWrite && (
                        <>
                          <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-warning-100 hover:text-warning-700 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-red-100 hover:text-red-700 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
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
