import { useEffect, useState } from "react";

interface AvatarProps {
  src?: string | null;
  alt: string;
  className?: string;
  online?: boolean;
}

export function Avatar({ src, alt, className = "w-10 h-10", online }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = alt.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  if (src && !imageFailed) {
    return (
      <div className="relative inline-flex flex-shrink-0">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className={`rounded-xl object-cover bg-stone-100 ${className}`}
        />
        {online !== undefined && (
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            online ? "bg-green-500" : "bg-gray-400"
          }`} />
        )}
      </div>
    );
  }
  return (
    <div className={`relative inline-flex flex-shrink-0 rounded-xl bg-primary/10 flex items-center justify-center font-medium text-primary ${className}`}>
      {initial}
      {online !== undefined && (
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
          online ? "bg-green-500" : "bg-gray-400"
        }`} />
      )}
    </div>
  );
}
