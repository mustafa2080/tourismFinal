import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus, FiEdit, FiTrash2, FiSearch, FiX, FiSave, FiEye, FiEyeOff,
  FiImage, FiFolder,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { blogService } from '../../../services/blogService';
import { uploadService } from '../../../services/uploadService';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  featured_image: '',
  category_id: '',
  tags: '',
  meta_title: '',
  meta_description: '',
  published: false,
};

export function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  // Categories management
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await blogService.getCategories();
      setCategories(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      setCategories([]);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await blogService.getStats();
      setStats(res?.data || null);
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      setStats(null);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await blogService.getAllPostsForAdmin({
        limit: 100,
        search: searchTerm || undefined,
        published: publishedFilter === '' ? undefined : publishedFilter === 'published',
      });
      setPosts(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, publishedFilter]);

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [fetchCategories, fetchStats]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const generateSlug = (value) =>
    value.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const handleInputChange = (field, value) => {
    if (field === 'title' && !editingId) {
      setFormData((prev) => ({ ...prev, title: value, slug: generateSlug(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setPreviewMode(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, and WebP images are allowed');
      e.target.value = '';
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image must be under 5MB');
      e.target.value = '';
      return;
    }

    try {
      setUploadingImage(true);
      const dataUrl = await uploadService.fileToBase64(file);
      setFormData((prev) => ({ ...prev, featured_image: dataUrl }));
      toast.success('Cover image added');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleEdit = async (post) => {
    try {
      const res = await blogService.getBlogPostByIdForAdmin(post.id);
      const full = res?.data || post;
      setFormData({
        title: full.title || '',
        slug: full.slug || '',
        excerpt: full.excerpt || '',
        body: full.body || '',
        featured_image: full.featured_image || '',
        category_id: full.category_id || '',
        tags: Array.isArray(full.tags) ? full.tags.join(', ') : '',
        meta_title: full.meta_title || '',
        meta_description: full.meta_description || '',
        published: !!full.published,
      });
      setEditingId(full.id);
      setPreviewMode(false);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading post for edit:', error);
      toast.error('Failed to load post');
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.body.trim() || formData.body.trim().length < 50) {
      toast.error('Content must be at least 50 characters');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      excerpt: formData.excerpt.trim(),
      body: formData.body.trim(),
      featured_image: formData.featured_image || undefined,
      category_id: formData.category_id || undefined,
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      meta_title: formData.meta_title.trim() || undefined,
      meta_description: formData.meta_description.trim() || undefined,
      published: formData.published,
    };

    try {
      setIsSubmitting(true);
      if (editingId) {
        await blogService.updateBlogPost(editingId, payload);
        toast.success('Post updated successfully');
      } else {
        await blogService.createBlogPost(payload);
        toast.success('Post created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchPosts();
      fetchStats();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(error?.message || error?.response?.data?.message || 'Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await blogService.deleteBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Post deleted successfully');
      fetchStats();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      if (post.published) {
        await blogService.unpublishBlogPost(post.id);
        toast.success('Post unpublished');
      } else {
        await blogService.publishBlogPost(post.id);
        toast.success('Post published');
      }
      fetchPosts();
      fetchStats();
    } catch (error) {
      console.error('Error toggling publish state:', error);
      toast.error('Failed to update post status');
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '' });
    setEditingCategoryId(null);
  };

  const handleEditCategory = (cat) => {
    setCategoryForm({ name: cat.name || '', description: cat.description || '' });
    setEditingCategoryId(cat.id);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      setSavingCategory(true);
      if (editingCategoryId) {
        await blogService.updateCategory(editingCategoryId, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        });
        toast.success('Category updated');
      } else {
        await blogService.createCategory(categoryForm.name.trim(), categoryForm.description.trim());
        toast.success('Category created');
      }
      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error?.message || error?.response?.data?.message || 'Failed to save category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Posts using it will keep their category_id but it will no longer resolve.')) return;
    try {
      await blogService.deleteCategory(id);
      toast.success('Category deleted');
      if (editingCategoryId === id) resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error?.message || error?.response?.data?.message || 'Failed to delete category');
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (!searchTerm) return true;
    return p.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            Blog
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base lg:text-lg">
            Manage blog posts and categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { resetCategoryForm(); setShowCategoriesModal(true); }}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-semibold"
          >
            <FiFolder size={18} />
            Categories
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-md font-semibold"
          >
            <FiPlus size={20} />
            New Post
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Posts', value: stats.totalPosts ?? stats.total ?? 0 },
            { label: 'Published', value: stats.published ?? 0 },
            { label: 'Drafts', value: stats.drafts ?? stats.draft ?? 0 },
            { label: 'Total Views', value: stats.totalViews ?? stats.views ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>
        <select
          value={publishedFilter}
          onChange={(e) => setPublishedFilter(e.target.value)}
          className="px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No posts found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {searchTerm ? 'Try adjusting your search' : 'Create your first blog post to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-left">
                <tr>
                  <th className="px-5 py-3 font-semibold">Post</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Views</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#14b8a6] flex-shrink-0 overflow-hidden flex items-center justify-center text-white font-bold">
                          {post.featured_image ? (
                            <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            post.title?.[0]?.toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">{post.title}</p>
                          <p className="text-xs text-slate-400 truncate max-w-xs">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {post.category?.name || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        post.published
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{post.views_count || 0}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatDate(post.published_at || post.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          title={post.published ? 'Unpublish' : 'Publish'}
                          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          {post.published ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                        <button
                          onClick={() => handleEdit(post)}
                          title="Edit"
                          className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          title="Delete"
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Post' : 'New Post'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiX size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Cover image */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Cover Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {formData.featured_image ? (
                      <img src={formData.featured_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FiImage size={24} className="text-slate-400" />
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-sm font-medium">
                    {uploadingImage ? 'Uploading...' : 'Choose Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                  {formData.featured_image && (
                    <button
                      onClick={() => setFormData((prev) => ({ ...prev, featured_image: '' }))}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., 10 Best Beaches in Egypt"
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="10-best-beaches-in-egypt"
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Category + Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="beaches, egypt, travel"
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Short summary shown in the blog list"
                  rows="2"
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                    Content * (HTML)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewMode((p) => !p)}
                    className="text-xs font-semibold text-teal-600 hover:underline"
                  >
                    {previewMode ? 'Edit' : 'Preview'}
                  </button>
                </div>
                {previewMode ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 min-h-[200px] bg-white dark:bg-slate-700"
                    dangerouslySetInnerHTML={{ __html: formData.body || '<p class="text-slate-400">Nothing to preview</p>' }}
                  />
                ) : (
                  <textarea
                    value={formData.body}
                    onChange={(e) => handleInputChange('body', e.target.value)}
                    placeholder="<p>Write your post content as HTML...</p>"
                    rows="12"
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-mono text-sm resize-y"
                  />
                )}
              </div>

              {/* SEO fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    placeholder="SEO title (optional)"
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Meta Description
                  </label>
                  <input
                    type="text"
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    placeholder="SEO description (optional)"
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Published toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => handleInputChange('published', e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Publish immediately
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 px-4 py-2 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave size={16} />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Modal */}
      {showCategoriesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Blog Categories
              </h2>
              <button
                onClick={() => { setShowCategoriesModal(false); resetCategoryForm(); }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiX size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Add / edit form */}
            <div className="space-y-3 mb-6 p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Travel Tips"
                  className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional short description"
                  className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 text-sm"
                />
              </div>
              <div className="flex gap-2">
                {editingCategoryId && (
                  <button
                    onClick={resetCategoryForm}
                    className="flex-1 px-3 py-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-sm font-semibold"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  onClick={handleSaveCategory}
                  disabled={savingCategory}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-all text-sm font-semibold"
                >
                  {savingCategory ? 'Saving...' : editingCategoryId ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
                  No categories yet. Add one above.
                </p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEditCategory(cat)}
                        title="Edit"
                        className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        title="Delete"
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogPage;
