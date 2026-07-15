import { useState } from "react";
import { useNavigate } from "react-router";
import { Heart, MessageCircle, CheckCircle, Clock, Zap } from "lucide-react";
import { StarRating } from "./StarRating";
import { Avatar } from "./Avatar";
import { favoriteApi } from "../../api/services";

interface TutorCardProps {
  id: string;
  fullName: string;
  avatarUrl?: string;
  title?: string;
  listingTitle?: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  experienceYears: number;
  online: boolean;
  verified: boolean;
  premiumPlan?: string | null;
  responseTimeHours?: number | null;
  subjects: string[];
}

export function TutorCard({
  id, fullName, avatarUrl, title, listingTitle, rating, reviewCount,
  hourlyRate, experienceYears, online, verified, premiumPlan,
  responseTimeHours, subjects,
}: TutorCardProps) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const premiumColors: Record<string, string> = {
    VIP: "bg-purple-50 text-purple-700 border-purple-200",
    PREMIUM: "bg-emerald-50 text-emerald-700 border-emerald-200",
    BASIC: "bg-stone-100 text-stone-600 border-stone-200",
  };

  const premiumLabel = premiumPlan
    ? premiumPlan === "VIP" ? "VIP" : premiumPlan === "PREMIUM" ? "Premium" : "Basic"
    : null;

  const responseLabel = responseTimeHours != null
    ? responseTimeHours < 1 ? "1 saatten az" : `~${Math.round(responseTimeHours)} saat`
    : null;

  return (
    <div
      onClick={() => navigate(`/ogretmen/${id}`)}
      className="card-elevated overflow-hidden flex flex-col h-full hover:scale-[1.01] transition-all duration-300 group cursor-pointer"
    >
      {/* Top Image Section */}
      <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-800 text-3xl font-extrabold">
            {fullName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Favorite (Heart) Button */}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            try {
              if (liked) { await favoriteApi.remove(id); } else { await favoriteApi.add(id); }
              setLiked(!liked);
            } catch { console.error("Favori islemi basarisiz"); }
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 text-white transition-colors z-10"
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
        </button>

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {verified && (
            <span className="bg-emerald-500/90 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-0.5 backdrop-blur-sm shadow-sm">
              <CheckCircle className="w-2.5 h-2.5" /> DOĞRULANMIŞ
            </span>
          )}
          {premiumPlan && (
            <span className="bg-amber-500/90 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-0.5 backdrop-blur-sm shadow-sm">
              <Zap className="w-2.5 h-2.5" /> UZMAN ÖĞRETMEN
            </span>
          )}
        </div>

        {/* Overlay Title / Text */}
        <div className="absolute bottom-3 left-3 right-3 text-white z-10">
          <h3 className="font-semibold text-lg text-white tracking-tight truncate">{fullName}</h3>
          {(listingTitle || title || (experienceYears != null && experienceYears > 0)) && (
            <p className="text-xs text-white/90 font-medium truncate mt-0.5">{listingTitle || title || experienceYears != null && `${experienceYears} yıl desneyim`}</p>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            {reviewCount > 0 ? (
              <>
                <span className="text-amber-500 text-base">★</span>
                <span>{rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground font-normal">({reviewCount} yorum)</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground font-normal">Yeni Üye</span>
            )}
          </div>

          {/* Subjects and Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {subjects.slice(0, 2).map((s) => (
              <span key={s} className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">{s}</span>
            ))}
            {online && (
              <span className="text-[11px] bg-green-50 text-green-700 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                Online
              </span>
            )}
            {responseLabel && (
              <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md flex items-center gap-0.5 font-medium">
                <Clock className="w-2.5 h-2.5" /> {responseLabel}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer (Price & Action Buttons) */}
        <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-stone-100">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-extrabold text-stone-900 text-xl">₺{hourlyRate}</span>
              <span className="text-[11px] text-muted-foreground font-semibold">/saat</span>
            </div>
            <div className="text-[10px] text-rose-500 font-bold mt-0.5">İlk ders ücretsiz</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/mesajlar?userId=${id}`);
              }}
              className="p-2 rounded-xl border border-border hover:bg-stone-50 hover:border-stone-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/ogretmen/${id}`);
              }}
              className="text-xs bg-primary hover:bg-primary/95 text-white px-4.5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
              Profil Gör
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
