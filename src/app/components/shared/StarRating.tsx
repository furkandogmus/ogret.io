import { Star } from "lucide-react";

export function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "w-3.5 h-3.5" : size === "md" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} ${i <= Math.round(rating) ? "fill-emerald-400 text-emerald-400" : "fill-transparent text-stone-200"}`}
        />
      ))}
    </div>
  );
}
