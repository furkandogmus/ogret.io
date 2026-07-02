import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { subjectApi, listingApi } from "../api/services";
import type { SubjectResponse, ListingResponse, Page } from "../api/services";
import { TutorCard } from "../components/shared/TutorCard";

const SORT_OPTIONS = [
  { value: "score", label: "En İyi Eşleşme" },
  { value: "rating", label: "En Yüksek Puan" },
  { value: "price_asc", label: "Düşük Fiyat" },
];

const SIZE = 12;

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ListingResponse[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activePopover, setActivePopover] = useState<"price" | "rating" | null>(null);

  const [pageable, setPageable] = useState<Pick<Page<unknown>, "page" | "totalPages" | "totalElements">>({
    page: 0, totalPages: 0, totalElements: 0,
  });

  // Read filter state from URL search params
  const q = searchParams.get("q") || "";
  const subjectId = searchParams.get("subjectId") || "";
  const maxPrice = Number(searchParams.get("maxPrice")) || 1000;
  const minRating = Number(searchParams.get("minRating")) || 0;
  const onlyOnline = searchParams.get("online") === "true";
  const sort = searchParams.get("sort") || "score";
  const page = Number(searchParams.get("page")) || 0;

  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const updateParams = useCallback((updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "0" || value === "1000" || value === "false" || value === "score") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    if (!("page" in updates)) {
      next.delete("page");
    }
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    subjectApi.list().then(({ data }) => setSubjects(data)).catch(() => toast.error("Konular yüklenemedi"));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== q) {
        updateParams({ q: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, q, updateParams]);

  useEffect(() => {
    fetchResults();
  }, [q, subjectId, maxPrice, minRating, onlyOnline, sort, page]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data } = await listingApi.searchListings({
        q: q || undefined,
        subjectId: subjectId || undefined,
        maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        online: onlyOnline || undefined,
        sort: sort || undefined,
        page,
        size: SIZE,
      });
      setResults(data?.content || []);
      setPageable({ page: data?.page ?? 0, totalPages: data?.totalPages ?? 0, totalElements: data?.totalElements ?? 0 });
    } catch {
      toast.error("Arama sonuçları yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (p: number) => {
    updateParams({ page: String(p) });
  };

  const clearFilters = () => {
    setSearchParams(q ? { q } : {}, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <form onSubmit={(e) => { e.preventDefault(); updateParams({ q: searchInput }); }} className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="İlan veya ders ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </form>
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
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
      </div>
      {showFilters && (
        <div className="relative bg-white border border-stone-100 shadow-md rounded-2xl p-5 space-y-4 z-20">
          {activePopover && (
            <div className="fixed inset-0 bg-transparent z-10" onClick={() => setActivePopover(null)} />
          )}
          <div className="relative z-20">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">Ders Kategorisi</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => updateParams({ subjectId: "" })}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${
                  !subjectId ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15" : "bg-stone-50 text-stone-600 border border-stone-200/40 hover:bg-stone-100"
                }`}
              >
                Tümü
              </button>
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => updateParams({ subjectId: s.id })}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${
                    subjectId === s.id ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15" : "bg-stone-50 text-stone-600 border border-stone-200/40 hover:bg-stone-100"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-stone-100/60 relative z-20">
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
                      onChange={(e) => updateParams({ maxPrice: e.target.value })}
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
                        onClick={() => { updateParams({ minRating: String(r) }); setActivePopover(null); }}
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
            <div className="flex items-center gap-3 pt-4 sm:pt-0">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyOnline}
                    onChange={(e) => updateParams({ online: e.target.checked ? "true" : "" })}
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
          {loading ? "Yükleniyor..." : `${pageable.totalElements} ilan bulundu`}
        </p>
        {(subjectId || maxPrice < 1000 || minRating > 0 || onlyOnline) && (
          <button
            onClick={clearFilters}
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
            onClick={clearFilters}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/10 active:scale-[0.97]"
          >
            Tüm Filtreleri Temizle
          </button>
        </div>
      ) : (
        <>
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
          {pageable.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 0}
                className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pageable.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i)}
                  className={`min-w-[36px] h-9 rounded-xl text-xs font-bold transition-colors ${
                    i === page
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= pageable.totalPages - 1}
                className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
