import { useEffect } from "react";
import { Link } from "react-router";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useSeo } from "../../hooks/useSeo";
import { blogPosts } from "./blogData";

export function BlogIndexPage() {
  useEffect(() => {
    let link = document.querySelector("link[rel='alternate'][type='application/rss+xml']");
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("type", "application/rss+xml");
      link.setAttribute("title", "öğret.io Blog RSS");
      link.setAttribute("href", "https://ogret.io/feed.xml");
      document.head.appendChild(link);
    }
    return () => { link?.remove(); };
  }, []);

  useSeo({
    title: "Blog - Özel Ders Rehberi",
    description: "Özel ders, sınav hazırlığı, yabancı dil öğrenimi ve eğitim üzerine faydalı içerikler. öğret.io blog rehberi.",
    canonical: "https://ogret.io/blog",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">Blog</h1>
        <p className="text-stone-500 mt-2 text-sm font-medium">
          Özel ders, eğitim ve öğrenme üzerine faydalı içerikler
        </p>
      </div>

      <div className="space-y-6">
        {blogPosts.map((post) => (
          <article key={post.slug} className="bg-white border border-stone-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <Link to={`/blog/${post.slug}`} className="block">
              <div className="flex items-center gap-3 text-xs text-stone-400 font-medium mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.date).toLocaleDateString("tr-TR")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readingTime}
                </span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 mb-2 hover:text-emerald-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-stone-500 leading-relaxed">
                {post.description}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 hover:gap-2 transition-all">
                Devamını Oku <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
