import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiX,
  FiSave,
  FiChevronDown,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { regionService } from '../../../services/regionService';

export function RegionsPage() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    is_active: true,
    destinationsText: '',
  });

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const data = await regionService.getAllRegionsAdmin();
      setRegions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast.error('Failed to load regions');
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegions = regions.filter((r) => {
    if (!r || !r.name) return false;
    return r.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleInputChange = (field, value) => {
    if (field === 'name' && !editingId) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      setFormData((prev) => ({ ...prev, name: value, slug }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', image: '', is_active: true, destinationsText: '' });
    setEditingId(null);
  };

  const handleEdit = (region) => {
    setFormData({
      name: region.name,
      slug: region.slug,
      image: region.image || '',
      is_active: region.is_active,
      destinationsText: (region.destinations || [])
        .map((d) => d.name)
        .join('\n'),
    });
    setEditingId(region.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }

    const destinations = formData.destinationsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name,
      slug: formData.slug,
      image: formData.image || undefined,
      is_active: formData.is_active,
      destinations,
    };

    try {
      setIsSubmitting(true);

      if (editingId) {
        await regionService.updateRegion(editingId, payload);
        toast.success('Region updated successfully');
      } else {
        await regionService.createRegion(payload);
        toast.success('Region created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchRegions();
    } catch (error) {
      console.error('Error saving region:', error);
      toast.error(error.response?.data?.message || 'Failed to save region');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this region and its destinations?')) {
      return;
    }

    try {
      await regionService.deleteRegion(id);
      setRegions(regions.filter((r) => r.id !== id));
      toast.success('Region deleted successfully');
    } catch (error) {
      console.error('Error deleting region:', error);
      toast.error('Failed to delete region');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            Popular Destinations
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base lg:text-lg">
            Manage the regions and destinations shown on the homepage
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
          Add Region
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 md:gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Regions List */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin">
            <div className="h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      ) : filteredRegions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <FiChevronDown size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4 rotate-180" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No regions found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {searchTerm ? 'Try adjusting your search' : 'Create your first region to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegions.map((region) => (
            <div
              key={region.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all"
            >
              {region.image && (
                <div className="h-32 w-full overflow-hidden">
                  <img
                    src={region.image}
                    alt={region.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {region.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {region.slug}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      region.is_active
                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {region.is_active ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                    {region.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {region.destinations && region.destinations.length > 0 && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                    {region.destinations.map((d) => d.name).join(', ')}
                  </p>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleEdit(region)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-all"
                  >
                    <FiEdit size={16} />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(region.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                  >
                    <FiTrash2 size={16} />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Region' : 'New Region'}
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
                  Region Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Europe"
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
                  placeholder="e.g., europe"
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Destinations */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Destinations (one per line)
                </label>
                <textarea
                  value={formData.destinationsText}
                  onChange={(e) => handleInputChange('destinationsText', e.target.value)}
                  placeholder={'France\nItaly\nSpain'}
                  rows="5"
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 resize-none"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Each line becomes a destination link under this region on the homepage.
                </p>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <input
                  id="region-active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="region-active" className="text-sm font-medium text-slate-900 dark:text-white">
                  Show this region on the homepage
                </label>
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

export default RegionsPage;
