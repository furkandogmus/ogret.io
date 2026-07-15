import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Users, BookOpen, Shield, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import api from "../api/client";

interface DashboardStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalLessons: number;
  pendingVerifications: number;
}

interface VerificationItem {
  id: string;
  tutorId: string;
  tutorName: string;
  documentType: string;
  documentUrl: string;
  status: string;
  createdAt: string;
}

interface ReferenceItem {
  id: string;
  tutorId: string;
  tutorName: string;
  recommenderName: string;
  recommenderEmail: string;
  recommenderTitle: string;
  comment: string;
  status: string;
  createdAt: string;
}

export function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [tab, setTab] = useState<"dashboard" | "verifications" | "references">("dashboard");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
      return;
    }
    if (!loading) {
      Promise.all([fetchStats(), fetchVerifications(), fetchReferences()]).finally(() => setPageLoading(false));
    }
  }, [user, loading]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/dashboard");
      setStats(data);
    } catch {
      setFetchError("İstatistikler yüklenirken hata oluştu");
    }
  };

  const fetchVerifications = async () => {
    try {
      const { data } = await api.get("/admin/verifications");
      setVerifications(data);
    } catch {
      setFetchError("Doğrulamalar yüklenirken hata oluştu");
    }
  };

  const fetchReferences = async () => {
    try {
      const { data } = await api.get("/admin/references");
      setReferences(data);
    } catch {
      setFetchError("Referanslar yüklenirken hata oluştu");
    }
  };

  const handleVerification = async (id: string, approved: boolean) => {
    try {
      await api.put(`/admin/verifications/${id}`, { approved });
      fetchVerifications();
      fetchStats();
    } catch {
      setFetchError("İşlem sırasında hata oluştu");
    }
  };

  const handleReference = async (id: string, approved: boolean) => {
    try {
      await api.put(`/admin/references/${id}`, { approved });
      fetchReferences();
      fetchStats();
    } catch {
      setFetchError("İşlem sırasında hata oluştu");
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "Toplam Kullanıcı", value: stats.totalUsers, icon: Users, color: "bg-emerald-500" },
    { label: "Öğretmen", value: stats.totalTutors, icon: Shield, color: "bg-green-500" },
    { label: "Öğrenci", value: stats.totalStudents, icon: Users, color: "bg-purple-500" },
    { label: "Toplam Ders", value: stats.totalLessons, icon: BookOpen, color: "bg-emerald-500" },
    { label: "Bekleyen Doğrulama", value: stats.pendingVerifications, icon: Shield, color: "bg-red-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Paneli</h1>
        <p className="text-muted-foreground">Platform yönetimi ve kullanıcı doğrulamaları</p>
      </div>

      {fetchError && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{fetchError}</div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setTab("dashboard")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "dashboard" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setTab("verifications")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "verifications" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
          }`}
        >
          Doğrulamalar
        </button>
        <button
          onClick={() => setTab("references")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "references" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
          }`}
        >
          Referanslar ({references.length})
        </button>
      </div>

      {tab === "dashboard" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-border p-5 space-y-3">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "verifications" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Öğretmen</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Belge Türü</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tarih</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {verifications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      Bekleyen doğrulama bulunmuyor
                    </td>
                  </tr>
                )}
                {verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{v.tutorName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{v.documentType}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(v.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleVerification(v.id, true)}
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleVerification(v.id, false)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "references" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Öğretmen</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tavsiye Eden</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">İlişki / Unvan</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tavsiye Metni</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tarih</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {references.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      Bekleyen referans/tavsiye bulunmuyor
                    </td>
                  </tr>
                )}
                {references.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{r.tutorName}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <div>{r.recommenderName}</div>
                      <div className="text-xs text-muted-foreground">{r.recommenderEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.recommenderTitle}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate" title={r.comment}>
                      {r.comment}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleReference(r.id, true)}
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReference(r.id, false)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
