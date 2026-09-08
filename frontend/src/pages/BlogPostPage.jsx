import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { blogService } from '../services/blogService';
import { FiClock, FiEye, FiArrowLeft, FiTag, FiCalendar } from 'react-icons/fi';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const res = await blogService.getBlogPostBySlug(slug);
        const data = res?.data;
        if (!mounted) return;

        if (!data) {
          setNotFound(true);
          setPost(null);
          return;
        }
        setPost(data);

        blogService.getRelatedPosts(data.id, 3)
          .then((r) => { if (mounted) setRelated(Array.isArray(r?.data) ? r.data : []); })
          .catch(() => { if (mounted) setRelated([]); });
      } catch (error) {
        console.error('Failed to load blog post:', error);
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [slug]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ED9A58] flex flex-col">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#ED9A58] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-24">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Article not found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This post may have been removed or the link is incorrect.
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ED9A58] text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <FiArrowLeft size={18} /> Back to Blog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ED9A58] flex flex-col">
      <Header />

      <article className="flex-1">
        {/* Cover image */}
        <div className="w-full h-64 sm:h-80 md:h-96 bg-[#ED9A58] relative overflow-hidden">
          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-[#ED9A58] " />
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-8">
            <div className="max-w-4xl mx-auto">
              {post.category?.name && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 text-teal-700 text-xs font-bold rounded-full mb-3">
                  <FiTag size={11} /> {post.category.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Meta bar */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <FiCalendar size={14} /> {formatDate(post.published_at || post.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <FiClock size={14} /> {post.read_time_minutes || 1} min read
            </span>
            <span className="flex items-center gap-1.5">
              <FiEye size={14} /> {post.views_count || 0} views
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-4xl mx-auto">
            <div
              className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-teal-600 dark:prose-a:text-teal-400"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 pb-16">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/blog/${r.slug}`}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <div className="h-32 bg-[#ED9A58] overflow-hidden">
                      {r.featured_image && (
                        <img src={r.featured_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {r.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
