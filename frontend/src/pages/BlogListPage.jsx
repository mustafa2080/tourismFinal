import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { blogService } from '../services/blogService';
import { FiSearch, FiClock, FiEye, FiArrowRight, FiTag } from 'react-icons/fi';

const POSTS_PER_PAGE = 9;

const BlogListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const activeCategory = searchParams.get('category') || '';
  const activeSearch = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    blogService.getCategories()
      .then((res) => setCategories(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setCategories([]));
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * POSTS_PER_PAGE;
      const res = await blogService.getBlogPosts({
        limit: POSTS_PER_PAGE,
        offset,
        category: activeCategory || undefined,
        search: activeSearch || undefined,
      });
      setPosts(Array.isArray(res?.data) ? res.data : []);
      setTotal(res?.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      setPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, activeSearch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in updates)) next.delete('page');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim() });
  };


  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    if (p > 1) next.set('page', String(p));
    else next.delete('page');
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative pt-8 sm:pt-12 md:pt-20 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            Our <span className="bg-[#0d9488] bg-clip-text text-transparent">Travel Blog</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Stories, guides, and inspiration to help you plan your next adventure.
          </p>
        </div>
      </section>

      {/* Search + Category Filters */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            />
          </form>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateParams({ category: '' })}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
 !activeCategory
 ? 'bg-[#0d9488] text-white shadow-md'
 : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-400'
 }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParams({ category: cat.slug })}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
 activeCategory === cat.slug
 ? 'bg-[#0d9488] text-white shadow-md'
 : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-400'
 }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-7xl mx-auto pb-16">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-16 text-center">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {activeSearch || activeCategory ? 'Try adjusting your search or filters' : 'Check back soon for new content'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-48 bg-[#0d9488] relative overflow-hidden">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/80 text-4xl font-bold">
                        {post.title?.[0]?.toUpperCase()}
                      </div>
                    )}
                    {post.category?.name && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-slate-900/90 text-teal-700 dark:text-teal-400 text-xs font-bold rounded-full flex items-center gap-1">
                        <FiTag size={11} />
                        {post.category.name}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FiClock size={12} /> {post.read_time_minutes || 1} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FiEye size={12} /> {post.views_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-teal-400 transition-all"
              >
                Prev
              </button>
              <span className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-teal-400 transition-all flex items-center gap-1"
              >
                Next <FiArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogListPage;
