import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Calendar, Clock, ArrowRight, Tag, TrendingUp } from "lucide-react";
import { blogApi } from "../api/services";
import type { BlogPostResponse, BlogCategoryResponse } from "../api/services";

export function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPostResponse[]>([]);
  const [categories, setCategories] = useState<BlogCategoryResponse[]>([]);
  const [featured, setFeatured] = useState<BlogPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    blogApi.getCategories().then(res => setCategories(res.data));
    blogApi.getFeatured({ size: 3 }).then(res => setFeatured(res.data.content));
  }, []);

  useEffect(() => {
    setLoading(true);
    blogApi.getPosts({ categoryId: activeCategory || undefined, page, size: 9 })
      .then(res => {
        setPosts(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, page]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Blog & Öğrenme İpuçları</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Ders çalışma taktikleri, sınav stratejileri ve öğrenme yolculuğunda sana rehberlik edecek yazılar.
        </p>
      </div>

      {featured.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Öne Çıkanlar</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <article className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <span className="text-4xl text-primary/30">{post.title[0]}</span>
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {post.category?.name}
                    </span>
                    <h3 className="font-semibold mt-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.publishedAt?.slice(0, 10)}</span>
                      {post.readingTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime} dk</span>}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => { setSearchParams({}); setPage(0); }}
          className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
            !activeCategory ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
          }`}
        >
          Tümü
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setSearchParams({ category: cat.slug }); setPage(0); }}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              activeCategory === cat.slug ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Henüz blog yazısı bulunmuyor.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group">
              <article className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="h-32 bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                  <span className="text-3xl text-muted-foreground/30">{post.title[0]}</span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {post.category?.name}
                    </span>
                    {post.tags?.slice(0, 2).map(tag => (
                      <span key={tag.id} className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <Tag className="w-3 h-3" />{tag.name}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.publishedAt?.slice(0, 10)}</span>
                      {post.readingTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime} dk</span>}
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-9 h-9 rounded text-sm ${
                page === i ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
