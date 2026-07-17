import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import { LessonRequestModal } from "../shared/LessonRequestModal";
import { useModal } from "../../providers/ModalProvider";
import { JsonLd } from "../shared/JsonLd";
import { CookieConsent } from "../shared/CookieConsent";

export function RootLayout() {
  const { selectedTutor, closeModal } = useModal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "öğret.io",
        url: "https://ogret.io/",
        description: "Öğrencilerle özel ders öğretmenlerini doğrudan buluşturan ücretsiz platform.",
        inLanguage: "tr",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://ogret.io/arama?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "öğret.io",
        url: "https://ogret.io/",
        logo: "https://ogret.io/favicon.svg",
        sameAs: [],
      }} />
      <main>
        <Navbar />
        <Outlet />
        {selectedTutor && (
          <LessonRequestModal tutor={selectedTutor} onClose={closeModal} />
        )}
      </main>
      <CookieConsent />
    </div>
  );
}
