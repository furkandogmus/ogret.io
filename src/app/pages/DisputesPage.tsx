import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import api from "../api/client";
import { toast } from "sonner";
import { AlertTriangle, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

interface Dispute {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  lesson?: { id: string };
  complainant?: { id: string; fullName: string };
  respondent?: { id: string; fullName: string };
}

export function DisputesPage() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"mine" | "against">("mine");
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const endpoint = tab === "mine" ? "/disputes" : "/disputes/against-me";
    api.get(endpoint)
      .then(res => setDisputes(res.data.content || res.data))
      .catch(() => toast.error("İhtilaflar yüklenemedi"))
      .finally(() => setLoading(false));
  }, [tab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !lessonId.trim()) {
      toast.error("Tüm alanları doldurun");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/disputes", { lessonId, subject, description });
      toast.success("İhtilaf kaydı oluşturuldu");
      setShowForm(false);
      setSubject("");
      setDescription("");
      setLessonId("");
      const res = await api.get("/disputes");
      setDisputes(res.data.content || res.data);
    } catch {
      toast.error("İhtilaf oluşturulamadı");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">İhtilaflar</h1>
        <button onClick={() => setShowForm(!showForm)} className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90">
          Yeni İhtilaf
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-6 space-y-3">
          <input value={lessonId} onChange={e => setLessonId(e.target.value)}
            placeholder="Ders ID" className="w-full border rounded px-3 py-2 text-sm" />
          <input value={subject} onChange={e => setSubject(e.target.value)}
            placeholder="Konu" className="w-full border rounded px-3 py-2 text-sm" />
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Açıklama" rows={3} className="w-full border rounded px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting}
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm hover:opacity-90 disabled:opacity-50">
              {submitting ? "Gönderiliyor..." : "Gönder"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-muted-foreground px-4 py-1.5 rounded text-sm hover:bg-secondary">
              İptal
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("mine")}
          className={`px-4 py-1.5 rounded-full text-sm ${tab === "mine" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
          Açtığım İhtilaflar
        </button>
        <button onClick={() => setTab("against")}
          className={`px-4 py-1.5 rounded-full text-sm ${tab === "against" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
          Hakkımdaki İhtilaflar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Henüz ihtilaf kaydı bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map(d => (
            <div key={d.id} className="border rounded-lg">
              <button onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${d.status === "OPEN" ? "bg-red-500" : "bg-green-500"}`} />
                  <div>
                    <p className="font-medium text-sm">{d.subject}</p>
                    <p className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString("tr-TR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    d.status === "OPEN" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}>
                    {d.status === "OPEN" ? "Açık" : "Çözüldü"}
                  </span>
                  {expanded === d.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              {expanded === d.id && (
                <div className="px-4 pb-4 border-t pt-3">
                  <p className="text-sm text-muted-foreground">{d.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Karşı taraf: {tab === "mine" ? d.respondent?.fullName : d.complainant?.fullName}</span>
                    <span>Öncelik: {d.priority}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
