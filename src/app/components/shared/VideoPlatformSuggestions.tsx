import { ExternalLink, Info } from "lucide-react";

const PLATFORMS = [
  {
    name: "Zoom",
    url: "https://zoom.us",
    description: "Ekran paylaşımı, kayıt, 100 kişiye kadar ücretsiz (40 dk sınırı)",
    free: true,
  },
  {
    name: "Google Meet",
    url: "https://meet.google.com",
    description: "Google hesabı ile ücretsiz, 60 dk sınırsız, ekran paylaşımı",
    free: true,
  },
  {
    name: "Jitsi Meet",
    url: "https://meet.jit.si",
    description: "Açık kaynak, ücretsiz, hesap gerektirmez, sınırsız süre",
    free: true,
  },
];

export function VideoPlatformSuggestions() {
  return (
    <div className="border rounded-lg p-4 bg-primary/5">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-sm mb-2">Online Ders Platformları</h4>
          <p className="text-xs text-muted-foreground mb-3">
            DersPlatform bünyesinde görüntülü görüşme altyapısı bulunmamaktadır.
            Aşağıdaki ücretsiz platformlardan birini kullanarak dersinizi gerçekleştirebilirsiniz.
          </p>
          <div className="space-y-2">
            {PLATFORMS.map(p => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-background border rounded px-3 py-2 hover:border-primary transition-colors group"
              >
                <div>
                  <span className="text-sm font-medium">{p.name}</span>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
