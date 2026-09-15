import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiRefreshCw, FiMapPin } from 'react-icons/fi';
import { customTripService } from '../../../services/customTripService';
import toast from 'react-hot-toast';

const ITEM_TYPES = [
  { value: 'activity', label: 'Activity' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'transport', label: 'Transport' },
  { value: 'meal', label: 'Meal' },
];

const PRICE_UNITS = [
  { value: 'per_person', label: 'Per Person' },
  { value: 'per_night', label: 'Per Night' },
  { value: 'per_booking', label: 'Per Booking' },
];

const emptyForm = () => ({
  item_type: 'activity',
  destination: '',
  name: '',
  description: '',
  image: '',
  price: 0,
  price_unit: 'per_person',
  tags: '',
  is_active: true,
  sort_order: 0,
});

function TripBuilderOptionsPage() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [formData, setFormData] = useState(emptyForm());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await customTripService.getOptionsAdmin(100, 0);
      setOptions(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      toast.error('Failed to load trip builder options');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOptions = options.filter((opt) => {
    const matchesSearch =
      opt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || opt.item_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenModal = (mode, option = null) => {
    setModalMode(mode);
    if (mode === 'edit' && option) {
      setSelectedOption(option);
      setFormData({
        item_type: option.item_type || 'activity',
        destination: option.destination || '',
        name: option.name || '',
        description: option.description || '',
        image: option.image || '',
        price: typeof option.price === 'number' ? option.price : parseFloat(option.price) || 0,
        price_unit: option.price_unit || 'per_person',
        tags: Array.isArray(option.tags) ? option.tags.join(', ') : '',
        is_active: option.is_active !== false,
        sort_order: option.sort_order || 0,
      });
    } else {
      setSelectedOption(null);
      setFormData(emptyForm());
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;
    if (type === 'checkbox') newValue = checked;
    else if (name === 'price' || name === 'sort_order') newValue = value === '' ? '' : parseFloat(value);
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.destination.trim()) {
      toast.error('Name and destination are required');
      return;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        item_type: formData.item_type,
        destination: formData.destination.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        image: formData.image.trim() || undefined,
        price: priceValue,
        price_unit: formData.price_unit,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order, 10) || 0,
      };

      if (modalMode === 'create') {
        await customTripService.createOption(payload);
        toast.success('Option created successfully');
      } else {
        await customTripService.updateOption(selectedOption.id, payload);
        toast.success('Option updated successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save option');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (option) => {
    if (!confirm(`Delete "${option.name}"?`)) return;
    try {
      await customTripService.deleteOption(option.id);
      toast.success('Option deleted');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete option');
    }
  };

  const itemTypeLabel = (type) => ITEM_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Trip Builder Options</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage the destinations, activities, hotels, transport and meals customers can pick from in Custom Trip.
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <button
          onClick={fetchData}
          className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
        >
          <FiRefreshCw size={18} />
          Refresh
        </button>
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center justify-center gap-2 bg-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
        >
          <FiPlus size={20} />
          Add Option
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <FiSearch className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">All Types</option>
            {ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden border border-slate-200 dark:border-slate-700">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        ) : filteredOptions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">No options yet. Click "Add Option" to create the first one.</p>
          </div>
        ) : (
          <>
            <div className="lg:hidden divide-y divide-slate-200 dark:divide-slate-700">
              {filteredOptions.map((opt) => (
                <div key={opt.id} className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{opt.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <FiMapPin size={12} /> {opt.destination}
                      </div>
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      opt.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {opt.is_active ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-1">Type</p>
                      <p className="text-slate-700 dark:text-slate-300">{itemTypeLabel(opt.item_type)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-1">Price</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        ${typeof opt.price === 'number' ? opt.price.toFixed(2) : parseFloat(opt.price || 0).toFixed(2)} / {opt.price_unit?.replace('per_', '')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleOpenModal('edit', opt)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-teal-700 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400 py-2 rounded-lg text-sm font-semibold"
                    >
                      <FiEdit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(opt)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 py-2 rounded-lg text-sm font-semibold"
                    >
                      <FiTrash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Destination</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredOptions.map((opt) => (
                    <tr key={opt.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{opt.name}</div>
                        {opt.description && <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{opt.description}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{opt.destination}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{itemTypeLabel(opt.item_type)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        ${typeof opt.price === 'number' ? opt.price.toFixed(2) : parseFloat(opt.price || 0).toFixed(2)}
                        <span className="text-xs text-slate-400 font-normal"> / {opt.price_unit?.replace('per_', '')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          opt.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {opt.is_active ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal('edit', opt)}
                            className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 hover:bg-teal-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(opt)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {modalMode === 'create' ? '➕ Add Option' : '✏️ Edit Option'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Destination *</label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="e.g. Cairo, Egypt"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Item Type *</label>
                  <select
                    name="item_type"
                    value={formData.item_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    {ITEM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Price Unit</label>
                  <select
                    name="price_unit"
                    value={formData.price_unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    {PRICE_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g. Nature, Adventure"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Sort Order</label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  id="is_active"
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-900 dark:text-white">
                  Active (visible to customers)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#0d9488] text-white font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripBuilderOptionsPage;
