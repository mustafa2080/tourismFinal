import apiClient from './apiClient';

/**
 * Blog service — matches the real backend routes mounted at /api/blog
 * (backend/src/routes/blog.routes.ts). No comments/likes support exists
 * on the backend, so those methods were removed rather than calling
 * endpoints that don't exist.
 */
export const blogService = {
  // ---------- Public ----------

  /**
   * Get published posts with pagination and filters.
   * @param {Object} options - { limit, offset, category, search, tag }
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async getBlogPosts(options = {}) {
    const { limit = 10, offset = 0, category = null, search = '', tag = null } = options;
    const params = { limit, offset };
    if (category) params.category = category;
    if (search) params.search = search;
    if (tag) params.tag = tag;
    return apiClient.get('/blog', { params });
  },

  /** Get a single published post by slug. */
  async getBlogPostBySlug(slug) {
    return apiClient.get(`/blog/${slug}`);
  },

  /** Search published posts by free-text query. */
  async searchBlogPosts(query, options = {}) {
    const { limit = 10 } = options;
    return apiClient.get('/blog/search', { params: { q: query, limit } });
  },

  /** Get the most recent published posts. */
  async getRecentPosts(limit = 5) {
    return apiClient.get('/blog/recent', { params: { limit } });
  },

  /** Get all blog categories. */
  async getCategories() {
    return apiClient.get('/blog/categories');
  },

  /** Get posts related to a given post (by category/tags). */
  async getRelatedPosts(postId, limit = 3) {
    return apiClient.get(`/blog/${postId}/related`, { params: { limit } });
  },

  // ---------- Admin ----------

  /**
   * Get all posts for the admin list (published + drafts), with filters.
   * @param {Object} options - { limit, offset, category, search, published }
   */
  async getAllPostsForAdmin(options = {}) {
    const { limit = 20, offset = 0, category = null, search = '', published = undefined } = options;
    const params = { limit, offset };
    if (category) params.category = category;
    if (search) params.search = search;
    if (published !== undefined) params.published = published;
    return apiClient.get('/blog/admin/all', { params });
  },

  /** Get a single post by ID for admin editing (works for drafts too). */
  async getBlogPostByIdForAdmin(postId) {
    return apiClient.get(`/blog/admin/${postId}`);
  },

  /**
   * Create a new blog post.
   * @param {Object} postData - { title, slug, excerpt, body, featuredImage, categoryId, tags, metaTitle, metaDescription, published }
   */
  async createBlogPost(postData) {
    const { title, body } = postData;
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (!body || body.trim().length < 50) {
      throw new Error('Content must be at least 50 characters');
    }
    return apiClient.post('/blog', postData);
  },

  /** Update an existing blog post (partial update). */
  async updateBlogPost(postId, updateData) {
    if (updateData.body && updateData.body.trim().length < 50) {
      throw new Error('Content must be at least 50 characters');
    }
    return apiClient.put(`/blog/${postId}`, updateData);
  },

  /** Delete a blog post. */
  async deleteBlogPost(postId) {
    return apiClient.delete(`/blog/${postId}`);
  },

  /** Publish a blog post. */
  async publishBlogPost(postId) {
    return apiClient.post(`/blog/${postId}/publish`);
  },

  /** Unpublish a blog post. */
  async unpublishBlogPost(postId) {
    return apiClient.post(`/blog/${postId}/unpublish`);
  },

  /** Get blog stats for the admin dashboard. */
  async getStats() {
    return apiClient.get('/blog/admin/stats');
  },

  // ---------- Categories (admin) ----------

  async createCategory(name, description) {
    return apiClient.post('/blog/admin/categories', { name, description });
  },

  async updateCategory(categoryId, updateData) {
    return apiClient.put(`/blog/admin/categories/${categoryId}`, updateData);
  },

  async deleteCategory(categoryId) {
    return apiClient.delete(`/blog/admin/categories/${categoryId}`);
  },
};

export default blogService;
