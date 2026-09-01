import apiClient from './apiClient';

export const blogService = {
  /**
   * Get all blog posts with pagination and filters
   * @param {Object} options - Options { limit, offset, category, search, sortBy, status }
   * @returns {Promise<Object>} - { posts: Array, total: number, pages: number }
   */
  async getBlogPosts(options = {}) {
    const { 
      limit = 10, 
      offset = 0, 
      category = null, 
      search = '', 
      sortBy = 'recent',
      status = 'published'
    } = options;
    
    const params = { limit, offset, sortBy, status };
    if (category) params.category = category;
    if (search) params.search = search;
    
    return apiClient.get('/blog/posts', { params });
  },

  /**
   * Get single blog post by slug
   * @param {string} slug - Post slug (URL-friendly title)
   * @returns {Promise<Object>} - Full blog post with comments
   */
  async getBlogPostBySlug(slug) {
    return apiClient.get(`/blog/posts/${slug}`);
  },

  /**
   * Get blog post by ID
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} - Full blog post
   */
  async getBlogPostById(postId) {
    return apiClient.get(`/blog/posts/id/${postId}`);
  },

  /**
   * Search blog posts
   * @param {string} query - Search query
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} - Search results
   */
  async searchBlogPosts(query, options = {}) {
    const { limit = 10, offset = 0 } = options;
    return apiClient.get('/blog/posts/search', {
      params: { q: query, limit, offset }
    });
  },

  /**
   * Get recent blog posts
   * @param {number} limit - Number of posts to return
   * @returns {Promise<Array>} - Recent posts
   */
  async getRecentPosts(limit = 5) {
    return apiClient.get('/blog/posts/recent', { params: { limit } });
  },

  /**
   * Get blog posts by category
   * @param {string} category - Category name/slug
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} - Posts in category
   */
  async getPostsByCategory(category, options = {}) {
    const { limit = 10, offset = 0 } = options;
    return apiClient.get(`/blog/categories/${category}/posts`, {
      params: { limit, offset }
    });
  },

  /**
   * Get all blog categories
   * @returns {Promise<Array>} - List of categories
   */
  async getCategories() {
    return apiClient.get('/blog/categories');
  },

  /**
   * Get related posts for a blog post
   * @param {string} postId - Post ID
   * @param {number} limit - Number of related posts
   * @returns {Promise<Array>} - Related posts
   */
  async getRelatedPosts(postId, limit = 3) {
    return apiClient.get(`/blog/posts/${postId}/related`, { params: { limit } });
  },

  /**
   * Get featured blog posts
   * @param {number} limit - Number of featured posts
   * @returns {Promise<Array>} - Featured posts
   */
  async getFeaturedPosts(limit = 3) {
    return apiClient.get('/blog/featured', { params: { limit } });
  },

  /**
   * Create new blog post (admin only)
   * @param {Object} postData - { title, slug, excerpt, content, featuredImage, category, tags }
   * @returns {Promise<Object>} - Created post
   */
  async createBlogPost(postData) {
    const { title, slug, excerpt, content, featuredImage, category, tags } = postData;
    
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (!slug || slug.trim().length === 0) {
      throw new Error('Slug is required');
    }
    if (!content || content.trim().length < 50) {
      throw new Error('Content must be at least 50 characters');
    }
    
    return apiClient.post('/admin/blog/posts', {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt?.trim() || '',
      content: content.trim(),
      featuredImage,
      category,
      tags: tags || []
    });
  },

  /**
   * Update blog post (admin only)
   * @param {string} postId - Post ID
   * @param {Object} updateData - Updated fields
   * @returns {Promise<Object>} - Updated post
   */
  async updateBlogPost(postId, updateData) {
    const { title, slug, excerpt, content, featuredImage, category, tags } = updateData;
    
    if (content && content.trim().length < 50) {
      throw new Error('Content must be at least 50 characters');
    }
    
    const payload = {};
    if (title) payload.title = title.trim();
    if (slug) payload.slug = slug.trim();
    if (excerpt !== undefined) payload.excerpt = excerpt.trim();
    if (content) payload.content = content.trim();
    if (featuredImage) payload.featuredImage = featuredImage;
    if (category) payload.category = category;
    if (tags) payload.tags = tags;
    
    return apiClient.put(`/admin/blog/posts/${postId}`, payload);
  },

  /**
   * Delete blog post (admin only)
   * @param {string} postId - Post ID
   * @returns {Promise<void>}
   */
  async deleteBlogPost(postId) {
    return apiClient.delete(`/admin/blog/posts/${postId}`);
  },

  /**
   * Publish blog post (admin only)
   * @param {string} postId - Post ID
   * @param {string} publishDate - Publish date (optional, defaults to now)
   * @returns {Promise<Object>} - Updated post
   */
  async publishBlogPost(postId, publishDate = null) {
    return apiClient.post(`/admin/blog/posts/${postId}/publish`, { publishDate });
  },

  /**
   * Unpublish blog post (admin only)
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} - Updated post
   */
  async unpublishBlogPost(postId) {
    return apiClient.post(`/admin/blog/posts/${postId}/unpublish`);
  },

  /**
   * Get blog post comments
   * @param {string} postId - Post ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} - Comments
   */
  async getPostComments(postId, options = {}) {
    const { limit = 10, offset = 0 } = options;
    return apiClient.get(`/blog/posts/${postId}/comments`, {
      params: { limit, offset }
    });
  },

  /**
   * Add comment to blog post
   * @param {string} postId - Post ID
   * @param {string} comment - Comment text
   * @returns {Promise<Object>} - Created comment
   */
  async addComment(postId, comment) {
    if (!comment || comment.trim().length < 3) {
      throw new Error('Comment must be at least 3 characters');
    }
    
    return apiClient.post(`/blog/posts/${postId}/comments`, { comment: comment.trim() });
  },

  /**
   * Like/unlike blog post
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} - Result { isLiked: boolean, likesCount: number }
   */
  async toggleLikePost(postId) {
    return apiClient.post(`/blog/posts/${postId}/toggle-like`);
  },

  /**
   * Get blog statistics (admin only)
   * @returns {Promise<Object>} - Stats { totalPosts, published, draft, views, likes }
   */
  async getStats() {
    return apiClient.get('/admin/blog/stats');
  }
};
