import { useEffect } from "react";

interface SeoProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

const BASE_TITLE = "öğret.io";
const BASE_DESCRIPTION = "Türkiye'nin en iyi online özel ders platformu. Alanında uzman öğretmenlerle online olarak buluşun.";

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    if (name.startsWith("og:") || name.startsWith("twitter:")) {
      el.setAttribute("property", name);
    } else {
      el.setAttribute("name", name);
    }
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(name: string) {
  const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (el) el.remove();
}

export function useSeo(props: SeoProps) {
  useEffect(() => {
    const fullTitle = props.title ? `${props.title} | ${BASE_TITLE}` : BASE_TITLE;
    document.title = fullTitle;

    setMeta("description", props.description || BASE_DESCRIPTION);
    setMeta("og:title", props.ogTitle || fullTitle);
    setMeta("og:description", props.ogDescription || props.description || BASE_DESCRIPTION);
    setMeta("og:image", props.ogImage || "https://ogret.io/favicon.svg");
    setMeta("og:type", "website");
    setMeta("og:locale", "tr_TR");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", props.ogTitle || fullTitle);
    setMeta("twitter:description", props.ogDescription || props.description || BASE_DESCRIPTION);

    if (props.canonical) {
      let link = document.querySelector("link[rel='canonical']");
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", props.canonical);
    }

    return () => {
      document.title = BASE_TITLE;
      setMeta("description", BASE_DESCRIPTION);
    };
  }, [props.title, props.description, props.ogTitle, props.ogDescription, props.ogImage, props.canonical]);
}
