import { FormEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Activity,
  BadgeCheck,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  Quote,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../providers/AuthProvider";
import {
  adminApi,
  referenceApi,
  type AdminDashboardResponse,
  type AdminUserResponse,
  type Page,
  type ReferenceResponse,
} from "../api/services";

interface VerificationItem {
  id: string;
  tutorId: string;
  tutorName: string;
  documentType: string;
  documentUrl: string;
  status: string;
  createdAt: string;
}

type AdminTab = "dashboard" | "users" | "verifications" | "references";
type RoleFilter = "ALL" | AdminUserResponse["role"];
type BooleanFilter = "ALL" | "true" | "false";

const emptyUsers: Page<AdminUserResponse> = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
};

const roleLabels: Record<AdminUserResponse["role"], string> = {
  ADMIN: "Admin",
  TUTOR: "Öğretmen",
  STUDENT: "Öğrenci",
};

const roleStyles: Record<AdminUserResponse["role"], string> = {
  ADMIN: "bg-violet-50 text-violet-700 border-violet-100",
  TUTOR: "bg-emerald-50 text-emerald-700 border-emerald-100",
  STUDENT: "bg-sky-50 text-sky-700 border-sky-100",
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [stats, setStats] = useState<AdminDashboardResponse | null>(null);
  const [users, setUsers] = useState<Page<AdminUserResponse>>(emptyUsers);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [references, setReferences] = useState<ReferenceResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [profileComplete, setProfileComplete] = useState<BooleanFilter>("ALL");
  const [page, setPage] = useState(0);

  const [passwordUser, setPasswordUser] = useState<AdminUserResponse | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const fetchStats = useCallback(async () => {
    const { data } = await adminApi.getDashboard();
    setStats(data);
  }, []);

  const fetchVerifications = useCallback(async () => {
    const { data } = await adminApi.getVerifications();
    setVerifications(data as VerificationItem[]);
  }, []);

  const fetchReferences = useCallback(async () => {
    const { data } = await referenceApi.getPending();
    setReferences(data);
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await adminApi.getUsers({
        q: query || undefined,
        role: role === "ALL" ? undefined : role,
        profileComplete: profileComplete === "ALL" ? undefined : profileComplete === "true",
        page,
        size: 20,
      });
      setUsers(data);
      setFetchError("");
    } catch {
      setFetchError("Kullanıcılar yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setUsersLoading(false);
    }
  }, [page, profileComplete, query, role]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
      return;
    }
    if (!loading) {
      Promise.allSettled([fetchStats(), fetchVerifications(), fetchReferences()])
        .then((results) => {
          if (results.some((result) => result.status === "rejected")) {
            setFetchError("Yönetim verilerinin bir bölümü yüklenemedi.");
          }
        })
        .finally(() => setPageLoading(false));
    }
  }, [fetchReferences, fetchStats, fetchVerifications, isAdmin, loading, navigate, user]);

  useEffect(() => {
    if (!loading && user && isAdmin) void fetchUsers();
  }, [fetchUsers, isAdmin, loading, user]);

  const refreshAll = async () => {
    setFetchError("");
    await Promise.allSettled([fetchStats(), fetchVerifications(), fetchReferences(), fetchUsers()]);
    toast.success("Yönetim verileri yenilendi");
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(0);
    setQuery(queryInput.trim());
  };

  const changeFilter = (setter: (value: never) => void, value: string) => {
    setPage(0);
    setter(value as never);
  };

  const handleTemporaryPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!passwordUser || temporaryPassword.length < 6) return;
    setActionId(passwordUser.id);
    try {
      await adminApi.setTemporaryPassword(passwordUser.id, temporaryPassword);
      toast.success("Geçici şifre kaydedildi; kullanıcının açık oturumları kapatıldı");
      setPasswordUser(null);
      setTemporaryPassword("");
    } catch {
      toast.error("Geçici şifre ayarlanamadı");
    } finally {
      setActionId(null);
    }
  };

  const handleVerification = async (id: string, approved: boolean) => {
    setActionId(id);
    try {
      await adminApi.reviewVerification(id, approved);
      await Promise.all([fetchVerifications(), fetchStats()]);
      toast.success(approved ? "Belge onaylandı" : "Belge reddedildi");
    } catch {
      toast.error("Doğrulama işlemi tamamlanamadı");
    } finally {
      setActionId(null);
    }
  };

  const handleReference = async (id: string, approved: boolean) => {
    setActionId(id);
    try {
      await referenceApi.updateStatus(id, approved);
      await Promise.all([fetchReferences(), fetchStats()]);
      toast.success(approved ? "Referans yayınlandı" : "Referans reddedildi");
    } catch {
      toast.error("Referans işlemi tamamlanamadı");
    } finally {
      setActionId(null);
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-stone-300" />
        <h1 className="font-bold">Yönetim paneli yüklenemedi</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sunucu bağlantısını kontrol edip tekrar deneyin.</p>
        <button onClick={() => void refreshAll()} className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm text-white">Tekrar dene</button>
      </div>
    );
  }

  const cards = [
    { label: "Toplam Kullanıcı", value: stats.totalUsers, detail: `${stats.totalAdmins ?? 0} admin`, icon: Users, tone: "bg-sky-50 text-sky-700" },
    { label: "Öğretmen", value: stats.totalTutors, detail: `${stats.identityVerifiedTutors ?? 0} kimliği doğrulanmış`, icon: GraduationCap, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Öğrenci", value: stats.totalStudents, detail: "Kayıtlı öğrenci", icon: UserCheck, tone: "bg-violet-50 text-violet-700" },
    { label: "Toplam Ders", value: stats.totalLessons, detail: `${stats.pendingLessons ?? 0} talep bekliyor`, icon: BookOpen, tone: "bg-amber-50 text-amber-700" },
    { label: "Aktif İlan", value: stats.activeListings ?? 0, detail: "Aramada görünür", icon: BadgeCheck, tone: "bg-teal-50 text-teal-700" },
    { label: "Mesaj", value: stats.totalMessages ?? 0, detail: "Toplam mesaj trafiği", icon: MessageSquare, tone: "bg-rose-50 text-rose-700" },
  ];

  const tabs: { key: AdminTab; label: string; icon: typeof LayoutDashboard; count?: number }[] = [
    { key: "dashboard", label: "Genel Bakış", icon: LayoutDashboard },
    { key: "users", label: "Kullanıcılar", icon: UserCog },
    { key: "verifications", label: "Doğrulamalar", icon: FileCheck2, count: verifications.length },
    { key: "references", label: "Referanslar", icon: Quote, count: references.length },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-emerald-950 p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              <Activity className="h-4 w-4" /> Canlı yönetim merkezi
            </div>
            <h1 className="text-2xl font-bold md:text-3xl">Admin Paneli</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-300">Kullanıcıları, ders akışını ve bekleyen içerikleri tek ekrandan yönetin.</p>
          </div>
          <button onClick={() => void refreshAll()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm hover:bg-white/15">
            <RefreshCw className="h-4 w-4" /> Verileri yenile
          </button>
        </div>
      </section>

      {fetchError && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{fetchError}</div>}

      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-sm" aria-label="Admin bölümleri">
        {tabs.map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition ${tab === item.key ? "bg-stone-900 text-white shadow-sm" : "text-muted-foreground hover:bg-stone-50 hover:text-foreground"}`}>
            <item.icon className="h-4 w-4" /> {item.label}
            {item.count !== undefined && <span className={`rounded-full px-2 py-0.5 text-xs ${tab === item.key ? "bg-white/15" : "bg-stone-100"}`}>{item.count}</span>}
          </button>
        ))}
      </nav>

      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <article key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div><p className="text-3xl font-bold text-foreground">{card.value}</p><p className="mt-1 text-sm font-semibold">{card.label}</p></div>
                  <div className={`rounded-xl p-3 ${card.tone}`}><card.icon className="h-5 w-5" /></div>
                </div>
                <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">{card.detail}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-base font-bold">Operasyon özeti</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["Profili tamamlanmış", stats.completedProfiles ?? 0], ["Bekleyen ders", stats.pendingLessons ?? 0],
                  ["Onaylı ders", stats.confirmedLessons ?? 0], ["Tamamlanan ders", stats.completedLessons ?? 0],
                ].map(([label, value]) => <div key={label} className="rounded-xl bg-stone-50 p-4"><p className="text-xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-base font-bold">İşlem bekleyenler</h2>
              <div className="mt-4 space-y-2">
                {[["Kimlik belgesi", stats.pendingVerifications ?? verifications.length, "verifications"], ["Öğretmen referansı", stats.pendingReferences ?? references.length, "references"], ["Açık uyuşmazlık", stats.openDisputes ?? 0, "dashboard"]].map(([label, value, target]) => (
                  <button key={label} onClick={() => setTab(target as AdminTab)} className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-left hover:bg-stone-50"><span className="text-sm font-medium">{label}</span><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{value}</span></button>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === "users" && (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
              <form onSubmit={submitSearch} className="flex min-w-0 flex-1 gap-2">
                <label className="relative block min-w-0 flex-1"><span className="sr-only">Kullanıcı ara</span><Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><input value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="İsim, e-posta veya telefon ara" className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500" /></label>
                <button className="rounded-xl bg-primary px-4 py-2.5 text-sm text-white">Ara</button>
              </form>
              <div className="grid grid-cols-2 gap-2">
                <select aria-label="Rol filtresi" value={role} onChange={(event) => changeFilter(setRole as (value: never) => void, event.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="ALL">Tüm roller</option><option value="STUDENT">Öğrenci</option><option value="TUTOR">Öğretmen</option><option value="ADMIN">Admin</option></select>
                <select aria-label="Profil filtresi" value={profileComplete} onChange={(event) => changeFilter(setProfileComplete as (value: never) => void, event.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"><option value="ALL">Tüm profiller</option><option value="true">Hazır</option><option value="false">Eksik</option></select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500"><tr><th className="px-5 py-3">Kullanıcı</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Aktivite</th><th className="px-4 py-3">Profil / Kimlik</th><th className="px-4 py-3">Kayıt</th><th className="px-5 py-3 text-right">İşlemler</th></tr></thead>
              <tbody className="divide-y divide-border">
                {usersLoading ? <tr><td colSpan={6} className="px-5 py-14 text-center"><RefreshCw className="mx-auto h-6 w-6 animate-spin text-primary" /></td></tr> : users.content.length === 0 ? <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-muted-foreground">Filtrelerle eşleşen kullanıcı bulunamadı.</td></tr> : users.content.map((managedUser) => (
                  <tr key={managedUser.id} className="hover:bg-stone-50/60">
                    <td className="px-5 py-4"><div className="font-semibold">{managedUser.fullName}</div><div className="mt-0.5 text-xs text-muted-foreground">{managedUser.email} · {managedUser.phone}</div></td>
                    <td className="px-4 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${roleStyles[managedUser.role]}`}>{roleLabels[managedUser.role]}</span></td>
                    <td className="px-4 py-4"><div className={`text-xs font-semibold ${managedUser.online ? "text-emerald-700" : "text-stone-600"}`}>{managedUser.online ? "Şu an çevrimiçi" : "Çevrimdışı"}</div><div className="mt-1 text-xs text-muted-foreground">{managedUser.lastActiveAt ? `Son aktif: ${formatDate(managedUser.lastActiveAt)}` : "Henüz aktiflik yok"}</div></td>
                    <td className="px-4 py-4"><div className="text-xs font-medium">{managedUser.profileComplete ? "Profil hazır" : "Profil eksik"}</div>{managedUser.role === "TUTOR" && <div className={`mt-1 text-xs ${managedUser.identityVerified ? "text-emerald-700" : "text-muted-foreground"}`}>{managedUser.identityVerified ? "Kimliği doğrulanmış" : "Kimlik doğrulanmamış"}</div>}</td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">{formatDate(managedUser.createdAt)}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2"><button disabled={managedUser.role === "ADMIN"} onClick={() => { setPasswordUser(managedUser); setTemporaryPassword(""); }} title={managedUser.role === "ADMIN" ? "Admin şifreleri bu ekrandan değiştirilemez" : "Geçici şifre belirle"} className="rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-30"><KeyRound className="h-4 w-4" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-4"><p className="text-xs text-muted-foreground">Toplam {users.totalElements} kullanıcı</p><div className="flex items-center gap-2"><button disabled={page === 0 || usersLoading} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-border p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span className="min-w-20 text-center text-xs font-medium">{users.totalPages === 0 ? 0 : page + 1} / {users.totalPages}</span><button disabled={page >= users.totalPages - 1 || usersLoading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-border p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></div></div>
        </section>
      )}

      {tab === "verifications" && <ModerationTable title="Bekleyen kimlik belgeleri" empty="Bekleyen doğrulama bulunmuyor" columns={["Öğretmen", "Belge türü", "Gönderim", "Belge", "İşlem"]}>{verifications.map((item) => <tr key={item.id} className="border-t border-border"><td className="px-5 py-4 text-sm font-semibold">{item.tutorName}</td><td className="px-4 py-4 text-sm text-muted-foreground">{item.documentType}</td><td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(item.createdAt)}</td><td className="px-4 py-4"><a href={item.documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">Belgeyi aç <ExternalLink className="h-3.5 w-3.5" /></a></td><td className="px-5 py-4"><ActionButtons busy={actionId === item.id} onApprove={() => void handleVerification(item.id, true)} onReject={() => void handleVerification(item.id, false)} /></td></tr>)}</ModerationTable>}

      {tab === "references" && <ModerationTable title="Bekleyen öğretmen referansları" empty="Bekleyen referans/tavsiye bulunmuyor" columns={["Öğretmen", "Tavsiye eden", "İlişki", "Tavsiye", "İşlem"]}>{references.map((item) => <tr key={item.id} className="border-t border-border"><td className="px-5 py-4 text-sm font-semibold">{item.tutorName}</td><td className="px-4 py-4"><div className="text-sm">{item.recommenderName}</div><div className="text-xs text-muted-foreground">{item.recommenderEmail}</div></td><td className="px-4 py-4 text-sm text-muted-foreground">{item.recommenderTitle}</td><td className="max-w-md px-4 py-4 text-sm text-muted-foreground"><p className="line-clamp-3">{item.comment}</p></td><td className="px-5 py-4"><ActionButtons busy={actionId === item.id} onApprove={() => void handleReference(item.id, true)} onReject={() => void handleReference(item.id, false)} /></td></tr>)}</ModerationTable>}

      {passwordUser && <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="password-title"><form onSubmit={handleTemporaryPassword} className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 id="password-title" className="font-bold">Geçici şifre belirle</h2><p className="mt-1 text-sm text-muted-foreground">{passwordUser.fullName} için yeni giriş şifresi oluşturun.</p></div><button type="button" onClick={() => setPasswordUser(null)} className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"><X className="h-5 w-5" /></button></div><div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">Bu işlem mevcut şifreyi değiştirir ve kullanıcının açık oturumlarını kapatır. Şifre yalnızca kullanıcıyla güvenli biçimde paylaşılmalıdır.</div><label className="mt-5 block text-sm font-semibold">Yeni geçici şifre<input autoFocus type="password" minLength={6} maxLength={100} required value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} placeholder="En az 6 karakter" className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setPasswordUser(null)} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm">Vazgeç</button><button disabled={temporaryPassword.length < 6 || actionId === passwordUser.id} className="rounded-xl bg-primary px-4 py-2.5 text-sm text-white disabled:opacity-50">Şifreyi kaydet</button></div></form></div>}
    </div>
  );
}

function ModerationTable({ title, empty, columns, children }: { title: string; empty: string; columns: string[]; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="border-b border-border px-5 py-4"><h2 className="text-base font-bold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">Onay ve ret işlemleri denetim kaydına eklenir.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead className="bg-stone-50"><tr>{columns.map((column) => <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500 first:pl-5 last:pr-5 last:text-right">{column}</th>)}</tr></thead><tbody>{hasChildren ? children : <tr><td colSpan={columns.length} className="px-5 py-14 text-center text-sm text-muted-foreground">{empty}</td></tr>}</tbody></table></div></section>;
}

function ActionButtons({ busy, onApprove, onReject }: { busy: boolean; onApprove: () => void; onReject: () => void }) {
  return <div className="flex items-center justify-end gap-1"><button aria-label="Onayla" disabled={busy} onClick={onApprove} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-40"><CheckCircle className="h-5 w-5" /></button><button aria-label="Reddet" disabled={busy} onClick={onReject} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40"><XCircle className="h-5 w-5" /></button></div>;
}
