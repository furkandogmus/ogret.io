import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  Search, SlidersHorizontal, X,
} from "lucide-react";
import { subjectApi, listingApi } from "../api/services";
import type { SubjectResponse, ListingResponse } from "../api/services";
import { TutorCard } from "../components/shared/TutorCard";

const SORT_OPTIONS = [
  { value: "score", label: "En İyi Eşleşme" },
  { value: "rating", label: "En Yüksek Puan" },
  { value: "price_asc", label: "Düşük Fiyat" },
];

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<ListingResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("score");
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject") || "");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [activePopover, setActivePopover] = useState<"price" | "rating" | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    subjectApi.list().then(({ data }) => setSubjects(data)).catch(() => toast.error("Konular yüklenemedi"));
  }, []);

  // Sync state when searchParams URL query changes
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchTerm(q);
    const sub = searchParams.get("subject") || "";
    setSelectedSubject(sub);
  }, [searchParams]);

  // Debounce search input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchResults();
  }, [sort, selectedSubject, maxPrice, minRating, onlyOnline, debouncedSearch]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data } = await listingApi.searchListings({
        q: debouncedSearch || undefined,
        subjectId: selectedSubject || undefined,
        maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        online: onlyOnline || undefined,
        sort,
      });
      setResults(data?.content || data || []);
    } catch {
      toast.error("Arama sonuçları yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="İlan veya ders ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </form>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border transition-colors ${
            showFilters ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>      {showFilters && (
        <div className="relative bg-white border border-stone-100 shadow-md rounded-2xl p-5 space-y-4 z-20">
          {/* Backdrop to close popovers when clicking outside */}
          {activePopover && (
            <div className="fixed inset-0 bg-transparent z-10" onClick={() => setActivePopover(null)} />
          )}

          {/* Ders Kategorisi (Inline Row of Buttons - Matches Test & Superprof Subject Row) */}
          <div className="relative z-20">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">Ders Kategorisi</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSubject("")}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${
                  !selectedSubject ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15" : "bg-stone-50 text-stone-600 border border-stone-200/40 hover:bg-stone-100"
                }`}
              >
                Tümü
              </button>
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${
                    selectedSubject === s.id ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15" : "bg-stone-50 text-stone-600 border border-stone-200/40 hover:bg-stone-100"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-stone-100/60 relative z-20">
            
            {/* Max Saatlik Ücret Popover Pill */}
            <div className="relative">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Max Saatlik Ücret</label>
              <button
                onClick={() => setActivePopover(activePopover === "price" ? null : "price")}
                className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all ${
                  maxPrice < 1000 ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm" : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                }`}
              >
                {maxPrice < 1000 ? `₺${maxPrice} ve altı` : "Tüm Fiyatlar"}
              </button>
              {activePopover === "price" && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-stone-150 shadow-xl rounded-2xl p-4 z-30 space-y-3">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Max Saatlik Ücret</span>
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-stone-400 mt-1">
                      <span>₺0</span>
                      <span className="text-emerald-600">₺{maxPrice}</span>
                      <span>₺1000</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Min Puan Popover Pill */}
            <div className="relative">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Min Puan</label>
              <button
                onClick={() => setActivePopover(activePopover === "rating" ? null : "rating")}
                className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all ${
                  minRating > 0 ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm" : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                }`}
              >
                {minRating > 0 ? `${minRating}★ ve üzeri` : "Tüm Puanlar"}
              </button>
              {activePopover === "rating" && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-stone-150 shadow-xl rounded-2xl p-4 z-30 space-y-3">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Min Puan</span>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => { setMinRating(r); setActivePopover(null); }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          minRating === r
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                        }`}
                      >
                        {r === 0 ? "Tümü" : `${r}★`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sadece Online Olanlar inline toggle */}
            <div className="flex items-center gap-3 pt-4 sm:pt-0">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyOnline}
                    onChange={(e) => setOnlyOnline(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-200 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
                <span className="text-xs font-bold text-stone-600">Sadece Online Olanlar</span>
              </div>
            </div>

          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Yükleniyor..." : `${results.length} ilan bulundu`}
        </p>
        {selectedSubject && (
          <button
            onClick={() => setSelectedSubject("")}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <X className="w-3 h-3" />
            Filtreleri Temizle
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 skeleton" />
                  <div className="h-3 w-1/2 skeleton" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full skeleton" />
                <div className="h-3 w-5/6 skeleton" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-4 w-16 skeleton" />
                <div className="h-5 w-20 rounded-lg skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 bg-white border border-stone-100 rounded-3xl p-8 max-w-md mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 bg-stone-50 text-stone-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-stone-900">Aradığınız kriterde ilan bulunamadı</p>
            <p className="text-xs text-stone-400 font-medium">Arama kelimenizi değiştirmeyi veya filtreleri sıfırlamayı deneyebilirsiniz.</p>
          </div>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedSubject("");
              setMaxPrice(1000);
              setMinRating(0);
              setOnlyOnline(false);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/10 active:scale-[0.97]"
          >
            Tüm Filtreleri Temizle
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((l) => (
            <TutorCard
              key={`listing-${l.id}`}
              id={l.tutorId}
              fullName={l.tutorName}
              avatarUrl={l.tutorAvatar}
              listingTitle={l.title}
              rating={0}
              reviewCount={0}
              hourlyRate={l.hourlyRate}
              experienceYears={0}
              online={l.allowsOnline}
              verified={false}
              subjects={[l.subjectName]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
