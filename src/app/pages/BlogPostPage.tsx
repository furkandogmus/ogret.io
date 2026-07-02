import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Calendar, Clock, Eye, Tag, Share2 } from "lucide-react";
import { toast } from "sonner";
import { blogApi } from "../api/services";
import type { BlogPostResponse, BlogCategoryResponse, BlogPostResponse as TBlogPostResponse } from "../api/services";

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostResponse | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    blogApi.getPost(slug)
      .then(res => {
        setPost(res.data);
        blogApi.recordView(res.data.id);
      })
      .catch(() => toast.error("Yazı bulunamadı"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (post?.category?.id) {
      blogApi.getPosts({ categoryId: post.category.id, size: 3 })
        .then(res => setRelatedPosts(res.data.content.filter(p => p.id !== post.id)));
    }
  }, [post]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link kopyalandı!");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Yazı bulunamadı.</p>
        <Link to="/blog" className="text-primary hover:underline mt-2 inline-block">Blog'a dön</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/blog" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Blog'a dön
      </Link>

      <article>
        <div className="flex items-center gap-3 mb-3">
          {post.category && (
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {post.category.name}
            </span>
          )}
          {post.isFeatured && (
            <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
              Öne Çıkan
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          {post.publishedAt && (
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(post.publishedAt).toLocaleDateString("tr-TR")}</span>
          )}
          {post.readingTime && (
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.readingTime} dk okuma</span>
          )}
          <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.viewCount} görüntülenme</span>
          <button onClick={handleShare} className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Share2 className="w-4 h-4" /> Paylaş
          </button>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map(tag => (
              <span key={tag.id} className="text-xs bg-secondary px-2 py-1 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3" />{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-gray max-w-none mb-10">
          {post.content.split('\n').map((paragraph, i) => (
            paragraph.trim() ? <p key={i} className="mb-4 leading-relaxed">{paragraph}</p> : null
          ))}
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="border-t pt-8 mt-8">
          <h2 className="text-xl font-semibold mb-4">Benzer Yazılar</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedPosts.map(rp => (
              <Link key={rp.id} to={`/blog/${rp.slug}`} className="group">
                <article className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">{rp.category?.name}</span>
                  <h3 className="font-medium text-sm mt-1 group-hover:text-primary transition-colors line-clamp-2">{rp.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />{rp.publishedAt?.slice(0, 10)}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
