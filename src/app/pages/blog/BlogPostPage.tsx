import { useParams, Link } from "react-router";
import { Calendar, Clock, ArrowLeft, BookOpen } from "lucide-react";
import { useSeo } from "../../hooks/useSeo";
import { JsonLd } from "../../components/shared/JsonLd";
import { BlogIllustration } from "../../components/shared/BlogIllustration";
import { getBlogPost, blogPosts } from "./blogData";

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  useSeo({
    title: post ? post.title : "Blog Yazısı",
    description: post?.description || "Blog yazısı bulunamadı.",
    canonical: post ? `https://ogret.io/blog/${post.slug}` : undefined,
    article: true,
    publishedTime: post ? new Date(post.date).toISOString() : undefined,
  });

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-900">Blog yazısı bulunamadı</h1>
        <p className="text-stone-500 mt-2">Aradığınız yazı mevcut değil.</p>
        <Link to="/blog" className="inline-block mt-6 text-emerald-600 font-bold text-sm hover:underline">
          Blog'a Dön
        </Link>
      </div>
    );
  }

  const relatedPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Blog'a Dön
      </Link>

      <article>
        <div className="flex items-center gap-3 text-xs text-stone-400 font-medium mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.date).toLocaleDateString("tr-TR")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readingTime}
          </span>
        </div>

        {post.image && (
          <BlogIllustration slug={post.image} className="w-full h-52 rounded-2xl mb-6" />
        )}

        <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="prose prose-stone max-w-none space-y-5 text-stone-600 text-sm leading-relaxed">
          {post.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-stone-100">
          <h2 className="text-lg font-bold text-stone-900 mb-4">Benzer Yazılar</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.slug}
                to={`/blog/${rp.slug}`}
                className="bg-white border border-stone-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <h3 className="text-sm font-bold text-stone-900 hover:text-emerald-600 transition-colors">
                  {rp.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{rp.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        author: {
          "@type": "Organization",
          name: "öğret.io",
        },
        publisher: {
          "@type": "Organization",
          name: "öğret.io",
          logo: { "@type": "ImageObject", url: "https://ogret.io/favicon.svg" },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": `https://ogret.io/blog/${post.slug}` },
      }} />
    </div>
  );
}
