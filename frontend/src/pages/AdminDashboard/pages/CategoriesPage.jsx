import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiX,
  FiSave,
  FiChevronDown,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { categoryService } from '../../../services/categoryService';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      // Ensure we have an array and filter out any undefined/null items
      const categoryList = Array.isArray(data) ? data : (data?.data ? data.data : []);
      const validCategories = categoryList.filter(cat => cat && cat.id && cat.name && cat.slug);
      setCategories(validCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    // Ensure cat, name, and slug exist before accessing them
    if (!cat || !cat.name || !cat.slug) return false;
    return (
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle form input
  const handleInputChange = (field, value) => {
    // Auto-generate slug from name if editing name
    if (field === 'name' && !editingId) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: slug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '' });
    setEditingId(null);
  };

  // Open edit modal
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setEditingId(category.id);
    setShowModal(true);
  };

  // Save category
  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingId) {
        // Update
        await categoryService.updateCategory(editingId, formData);
        setCategories(categories.map(cat =>
          cat.id === editingId ? { ...cat, ...formData } : cat
        ));
        toast.success('Category updated successfully');
      } else {
        // Create
        const response = await categoryService.createCategory(formData);
        const newCategory = response?.data || response;
        // Ensure new category has all required fields
        if (newCategory && newCategory.id && newCategory.name && newCategory.slug) {
          setCategories([...categories, newCategory]);
          toast.success('Category created successfully');
        } else {
          throw new Error('Invalid category data returned from server');
        }
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            Tour Categories
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Manage tour package categories
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-md font-semibold"
        >
          <FiPlus size={20} />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 md:gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin">
            <div className="h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <FiChevronDown size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4 rotate-180" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No categories found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {searchTerm ? 'Try adjusting your search' : 'Create your first category to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => {
            // Double-check category has all required fields before rendering
            if (!category || !category.id || !category.name) return null;
            
            return (
            <div
              key={category.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {category.slug || 'N/A'}
                  </p>
                </div>

                {category.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-all"
                  >
                    <FiEdit size={16} />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                  >
                    <FiTrash2 size={16} />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Category' : 'New Category'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiX size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Adventure Tours"
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="e.g., adventure-tours"
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Optional description"
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
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
    </div>
  );
}

export default CategoriesPage;
