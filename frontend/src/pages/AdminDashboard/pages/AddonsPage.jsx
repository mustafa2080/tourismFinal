import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiChevronDown, FiRefreshCw, FiEye, FiDatabase, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import adminService from '../../../services/adminService';
import { addonsService } from '../../../services';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function AddonsPage() {
  const { t } = useTranslation();
  const [addons, setAddons] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [selectedPackageForCreate, setSelectedPackageForCreate] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dbStats, setDbStats] = useState({
    totalAddons: 0,
    availableAddons: 0,
    unavailableAddons: 0,
    categories: {},
  });

  const [formData, setFormData] = useState({
    min_quantity: 1,
    max_quantity: 1,
    sort_order: 0,
    is_available: true,
    // English translations
    en_name: '',
    en_short_description: '',
    en_detailed_description: '',
    en_whats_included: '',
    en_whats_excluded: '',
    en_daily_itinerary: '',
    // Arabic translations
    ar_name: '',
    ar_short_description: '',
    ar_detailed_description: '',
    ar_whats_included: '',
    ar_whats_excluded: '',
    ar_daily_itinerary: '',
    // Spanish translations
    es_name: '',
    es_short_description: '',
    es_detailed_description: '',
    es_whats_included: '',
    es_whats_excluded: '',
    es_daily_itinerary: '',
    // German translations
    de_name: '',
    de_short_description: '',
    de_detailed_description: '',
    de_whats_included: '',
    de_whats_excluded: '',
    de_daily_itinerary: '',
    // Russian translations
    ru_name: '',
    ru_short_description: '',
    ru_detailed_description: '',
    ru_whats_included: '',
    ru_whats_excluded: '',
    ru_daily_itinerary: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Monitor modal state and form data
  useEffect(() => {
    if (showModal && modalMode === 'edit') {
      console.log('📋 [useEffect] Modal opened for edit:', {
        category: formData.category,
        category_type: typeof formData.category,
        price: formData.price,
        name: formData.name,
      });
    }
  }, [showModal, modalMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('📥 [AddonsPage] Fetching all data...');
      
      // Get all packages first
      const packagesRes = await adminService.getAllPackages(100, 0);
      if (packagesRes?.success && Array.isArray(packagesRes.data)) {
        console.log(`✅ [AddonsPage] Loaded ${packagesRes.data.length} packages`);
        setPackages(packagesRes.data);
      }

      // Get all addons directly from admin service
      console.log('📝 [AddonsPage] Fetching all addons from admin API...');
      const addonsRes = await adminService.getAllAddons(100, 0);
      
      console.log('🟢 [AddonsPage] Response structure:', {
        success: addonsRes?.success,
        dataCount: addonsRes?.data?.length || 0,
        hasPagination: !!addonsRes?.pagination,
        hasStats: !!addonsRes?.stats,
      });

      if (addonsRes?.success && Array.isArray(addonsRes.data)) {
        console.log(`✅ [AddonsPage] Loaded ${addonsRes.data.length} addons directly from API`);
        
        // Log first addon to check API response structure
        if (addonsRes.data.length > 0) {
          console.log('📋 [AddonsPage] First addon from API:', {
            id: addonsRes.data[0].id,
            name: addonsRes.data[0].name,
            price: addonsRes.data[0].price,
            price_type: typeof addonsRes.data[0].price,
            raw: addonsRes.data[0],
          });
        }
        
        // Enrich addons with package names and validate data
        const enrichedAddons = addonsRes.data.map((addon, idx) => {
          const pkg = packagesRes.data?.find(p => p.id === addon.package_id);
          
          // Ensure price is a number
          const price = typeof addon.price === 'number' ? addon.price : (parseFloat(addon.price) || 0);
          
          const enriched = {
            ...addon,
            package_id: addon.package_id || addon.packageId, // Ensure package_id exists
            packageName: pkg?.title || addon.packageName || 'Unknown',
            name: addon.name || 'Unnamed Add-on', // Fallback for name
            price: price, // Ensure price is a valid number
            description: addon.description || '', // Ensure description exists
            category: addon.category || 'addon', // Ensure category exists
            is_available: addon.is_available !== undefined ? addon.is_available : true,
          };
          
          // Log enriched data for first few addons
          if (idx < 3) {
            console.log(`📝 [AddonsPage] Enriched addon ${idx}:`, {
              id: enriched.id,
              name: enriched.name,
              price_original: addon.price,
              price_enriched: enriched.price,
              price_type: typeof enriched.price,
              category_original: addon.category,
              category_enriched: enriched.category,
            });
          }
          
          return enriched;
        });
        
        setAddons(enrichedAddons);

        // Use stats from API if available, otherwise calculate
        if (addonsRes.stats) {
          console.log('📊 [AddonsPage] Using stats from API:', addonsRes.stats);
          setDbStats(addonsRes.stats);
        } else {
          const stats = {
            totalAddons: enrichedAddons.length,
            availableAddons: enrichedAddons.filter(a => a.is_available).length,
            unavailableAddons: enrichedAddons.filter(a => !a.is_available).length,
            categories: {},
          };
          
          enrichedAddons.forEach(addon => {
            stats.categories[addon.category] = (stats.categories[addon.category] || 0) + 1;
          });
          
          setDbStats(stats);
          console.log('📊 [AddonsPage] Calculated Statistics:', stats);
        }
      } else {
        console.warn('⚠️ [AddonsPage] Invalid response from API:', {
          success: addonsRes?.success,
          isArray: Array.isArray(addonsRes?.data),
        });
        setAddons([]);
        setDbStats({
          totalAddons: 0,
          availableAddons: 0,
          unavailableAddons: 0,
          categories: {},
        });
      }
    } catch (error) {
      console.error('❌ [AddonsPage] Error fetching data:', error);
      toast.error('Failed to load add-ons');
      setAddons([]);
      setDbStats({
        totalAddons: 0,
        availableAddons: 0,
        unavailableAddons: 0,
        categories: {},
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAddons = addons
    .filter(addon => {
      const matchesSearch = addon.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          addon.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          addon.packageName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPackage = selectedPackage === 'all' || addon.package_id === selectedPackage;
      return matchesSearch && matchesPackage;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'price') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (sortBy === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const handleOpenModal = (mode, addon = null) => {
    setModalMode(mode);
    if (mode === 'edit' && addon) {
      console.log('📋 Opening edit modal for addon:', {
        id: addon.id,
        name: addon.name,
        price: addon.price,
        category: addon.category,
        category_type: typeof addon.category,
        package_id: addon.package_id,
      });

      // Ensure addon has required fields
      if (!addon.id || !addon.package_id) {
        toast.error('Error: Cannot open edit dialog - missing required data');
        console.error('❌ Missing required fields:', addon);
        return;
      }

      setSelectedAddon(addon);
      setSelectedPackageForCreate(addon.package_id);
      
      // Ensure price is a number, not a string
      const price = typeof addon.price === 'string' ? parseFloat(addon.price) : (addon.price || 0);
      
      // Ensure category is set correctly
      const category = addon.category || 'addon';
      console.log('📝 Setting form data with category:', category);
      
      setFormData({
        name: addon.name || '',
        description: addon.description || '',
        price: price, // Make sure it's a number
        category: category, // Make sure category is set
        is_available: addon.is_available !== false,
        min_quantity: addon.min_quantity || 1,
        max_quantity: addon.max_quantity || 1,
        en_name: addon.name || '',
        en_short_description: addon.description || '',
        en_detailed_description: '',
        en_whats_included: '',
        en_whats_excluded: '',
        en_daily_itinerary: '',
        ar_name: '',
        ar_short_description: '',
        ar_detailed_description: '',
        ar_whats_included: '',
        ar_whats_excluded: '',
        ar_daily_itinerary: '',
        es_name: '',
        es_short_description: '',
        es_detailed_description: '',
        es_whats_included: '',
        es_whats_excluded: '',
        es_daily_itinerary: '',
        de_name: '',
        de_short_description: '',
        de_detailed_description: '',
        de_whats_included: '',
        de_whats_excluded: '',
        de_daily_itinerary: '',
        ru_name: '',
        ru_short_description: '',
        ru_detailed_description: '',
        ru_whats_included: '',
        ru_whats_excluded: '',
        ru_daily_itinerary: '',
      });
    } else {
      setSelectedAddon(null);
      setSelectedPackageForCreate('');
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'addon',
        is_available: true,
        min_quantity: 1,
        max_quantity: 1,
        en_name: '',
        en_short_description: '',
        en_detailed_description: '',
        en_whats_included: '',
        en_whats_excluded: '',
        en_daily_itinerary: '',
        ar_name: '',
        ar_short_description: '',
        ar_detailed_description: '',
        ar_whats_included: '',
        ar_whats_excluded: '',
        ar_daily_itinerary: '',
        es_name: '',
        es_short_description: '',
        es_detailed_description: '',
        es_whats_included: '',
        es_whats_excluded: '',
        es_daily_itinerary: '',
        de_name: '',
        de_short_description: '',
        de_detailed_description: '',
        de_whats_included: '',
        de_whats_excluded: '',
        de_daily_itinerary: '',
        ru_name: '',
        ru_short_description: '',
        ru_detailed_description: '',
        ru_whats_included: '',
        ru_whats_excluded: '',
        ru_daily_itinerary: '',
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let newValue = value;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (name === 'price') {
      // For price, ensure it's always a valid number
      newValue = value === '' ? 0 : parseFloat(value) || 0;
      console.log(`💰 Price changed:`, { from: formData.price, to: newValue, raw: value });
    } else if (name === 'category') {
      // For category, ensure it's set
      newValue = value || 'addon';
      console.log(`📂 Category changed:`, { from: formData.category, to: newValue, raw: value });
    } else if (type === 'number') {
      newValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please fill in the name');
      return;
    }

    if (modalMode === 'create' && !selectedPackageForCreate) {
      toast.error('Please select a package');
      return;
    }

    // Validate price - it can be 0 but not undefined or NaN
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue)) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setSubmitting(true);

      const addonData = {
        name: formData.name,
        description: formData.description,
        price: priceValue, // Use parsed value
        category: formData.category,
        is_available: formData.is_available,
        min_quantity: formData.min_quantity,
        max_quantity: formData.max_quantity,
        en_name: formData.en_name || formData.name,
        en_short_description: formData.en_short_description || formData.description,
        en_detailed_description: formData.en_detailed_description,
        en_whats_included: formData.en_whats_included,
        en_whats_excluded: formData.en_whats_excluded,
        en_daily_itinerary: formData.en_daily_itinerary,
        ar_name: formData.ar_name || formData.name,
        ar_short_description: formData.ar_short_description || formData.description,
        ar_detailed_description: formData.ar_detailed_description,
        ar_whats_included: formData.ar_whats_included,
        ar_whats_excluded: formData.ar_whats_excluded,
        ar_daily_itinerary: formData.ar_daily_itinerary,
        es_name: formData.es_name || formData.name,
        es_short_description: formData.es_short_description || formData.description,
        es_detailed_description: formData.es_detailed_description,
        es_whats_included: formData.es_whats_included,
        es_whats_excluded: formData.es_whats_excluded,
        es_daily_itinerary: formData.es_daily_itinerary,
        de_name: formData.de_name || formData.name,
        de_short_description: formData.de_short_description || formData.description,
        de_detailed_description: formData.de_detailed_description,
        de_whats_included: formData.de_whats_included,
        de_whats_excluded: formData.de_whats_excluded,
        de_daily_itinerary: formData.de_daily_itinerary,
        ru_name: formData.ru_name || formData.name,
        ru_short_description: formData.ru_short_description || formData.description,
        ru_detailed_description: formData.ru_detailed_description,
        ru_whats_included: formData.ru_whats_included,
        ru_whats_excluded: formData.ru_whats_excluded,
        ru_daily_itinerary: formData.ru_daily_itinerary,
      };
      
      console.log('📝 Submit data:', {
        mode: modalMode,
        price: addonData.price,
        name: addonData.name,
      });
      
      if (modalMode === 'create') {
        console.log('📝 Creating addon:', { packageId: selectedPackageForCreate, data: addonData });
        await addonsService.createAddon(selectedPackageForCreate, addonData);
        toast.success('✅ Add-on created successfully');
        fetchData();
        setShowModal(false);
      } else {
        // Validate required data for update
        if (!selectedAddon?.id) {
          toast.error('Error: Add-on ID is missing');
          console.error('❌ Add-on ID is missing:', selectedAddon);
          return;
        }

        if (!selectedAddon?.package_id) {
          toast.error('Error: Package ID is missing');
          console.error('❌ Package ID is missing:', selectedAddon);
          return;
        }

        console.log('📝 Updating addon:', { 
          packageId: selectedAddon.package_id, 
          addonId: selectedAddon.id,
          oldPrice: selectedAddon.price,
          newPrice: addonData.price,
          data: addonData 
        });
        
        const updateResponse = await addonsService.updateAddon(selectedAddon.package_id, selectedAddon.id, addonData);
        
        console.log('✅ Update Response:', {
          success: updateResponse.success,
          message: updateResponse.message,
          returnedPrice: updateResponse.data?.price,
          returnedName: updateResponse.data?.name,
        });
        
        toast.success('✅ Add-on updated successfully');
        
        // Refresh data to get latest from DB
        console.log('🔄 Refreshing data from server...');
        await fetchData();
        
        console.log('✅ Data refresh complete');
        setShowModal(false);
      }
    } catch (error) {
      console.error('❌ Error saving addon:', error);
      toast.error(error.message || 'Failed to save add-on');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addon) => {
    if (!confirm('Are you sure you want to delete this add-on?')) return;

    try {
      // Validate required data
      if (!addon.id) {
        toast.error('Error: Add-on ID is missing');
        console.error('❌ Add-on ID is missing:', addon);
        return;
      }

      if (!addon.package_id) {
        toast.error('Error: Package ID is missing');
        console.error('❌ Package ID is missing:', addon);
        return;
      }

      console.log('🗑️ Deleting addon:', { 
        addonId: addon.id,
        packageId: addon.package_id,
        addonName: addon.name
      });
      
      await addonsService.deleteAddon(addon.package_id, addon.id);
      toast.success('✅ Add-on deleted successfully');
      console.log('✅ Delete successful, refreshing data...');
      fetchData();
    } catch (error) {
      console.error('❌ Error deleting addon:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || error.message || 'Failed to delete add-on');
    }
  };

  const categoryLabels = {
    addon: '✨ Optional Add-on',
    room_upgrade: '🏨 Room Upgrade',
    meal_plan: '🍽️ Meal Plan',
    activity: '🎭 Activity',
    transfer: '🚗 Transfer',
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('addons.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('addons.description')}</p>
          </div>
        </div>
        
        {/* Database Stats */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-2">
            <FiDatabase className="text-blue-600" size={18} />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('addons.totalAddons')}</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dbStats.totalAddons}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2 mb-2">
            <FiEye className="text-green-600" size={18} />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('addons.available')}</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dbStats.availableAddons}</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
          <div className="flex items-center gap-2 mb-2">
            <FiX className="text-red-600" size={18} />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('addons.unavailable')}</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{dbStats.unavailableAddons}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={fetchData}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          title="Refresh data"
        >
          <FiRefreshCw size={18} />
          {t('addons.refresh')}
        </button>
        
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
        >
          <FiPlus size={20} />
          {t('addons.addNew')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <FiSearch className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder={t('addons.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">{t('addons.allPackages')}</option>
            {packages.map(pkg => (
              <option key={pkg.id} value={pkg.id}>{pkg.title}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="created_at">{t('addons.sortByDate')}</option>
            <option value="name">{t('addons.sortByName')}</option>
            <option value="price">{t('addons.sortByPrice')}</option>
            <option value="category">{t('addons.sortByCategory')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden border border-slate-200 dark:border-slate-700">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">{t('addons.loading')}</p>
          </div>
        ) : filteredAddons.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">{t('addons.noAddons')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">{t('addons.name')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">{t('addons.category')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    <div className="flex items-center gap-1">
                      {t('addons.price')}
                      {sortBy === 'price' && (sortOrder === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">{t('addons.quantity')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">{t('addons.status')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">{t('addons.package')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">{t('addons.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredAddons.map((addon, index) => {
                  // Log price for debugging
                  if (index < 3) {
                    console.log(`📊 [Table] Rendering addon ${index}:`, {
                      id: addon.id,
                      name: addon.name,
                      price: addon.price,
                      price_type: typeof addon.price,
                      display: `$${typeof addon.price === 'number' ? addon.price.toFixed(2) : '0.00'}`,
                    });
                  }
                  
                  return (
                    <tr key={addon.id || `addon-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" data-addon-id={addon.id} data-package-id={addon.package_id}>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{index + 1}</span>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{addon.name || 'Unnamed'}</div>
                            {addon.description && <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{addon.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{categoryLabels[addon.category] || addon.category || 'addon'}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        ${typeof addon.price === 'number' ? addon.price.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {addon.min_quantity === addon.max_quantity 
                          ? addon.min_quantity 
                          : `${addon.min_quantity} - ${addon.max_quantity === -1 ? '∞' : addon.max_quantity}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          addon.is_available 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {addon.is_available ? '✓ Available' : '✗ Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {addon.packageName || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal('edit', addon)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(addon)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {modalMode === 'create' ? `➕ ${t('addons.createAddon')}` : `✏️ ${t('addons.editAddon')}`}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    {t('addons.selectPackage')} *
                  </label>
                  <select
                    value={selectedPackageForCreate}
                    onChange={(e) => setSelectedPackageForCreate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">{t('addons.pleaseSelect')}</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t('addons.name')} *
                </label>
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
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t('common.description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder={t('addons.describeAddon')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    {t('addons.price')} ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price === 0 && modalMode === 'edit' ? '' : formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    {t('addons.categoryLabel')} *
                  </label>
                  <select
                    key={`category-${modalMode}-${formData.category}`}
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="addon">{t('addons.addonOption')}</option>
                    <option value="room_upgrade">{t('addons.roomUpgrade')}</option>
                    <option value="meal_plan">{t('addons.mealPlan')}</option>
                    <option value="activity">{t('addons.activity')}</option>
                    <option value="transfer">{t('addons.transfer')}</option>
                  </select>
                  <div className="text-xs text-slate-500 mt-1">
                    Selected: {formData.category}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    {t('addons.minQuantity')}
                  </label>
                  <input
                    type="number"
                    name="min_quantity"
                    value={formData.min_quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    {t('addons.maxQuantity')}
                  </label>
                  <input
                    type="number"
                    name="max_quantity"
                    value={formData.max_quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleInputChange}
                  id="is_available"
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="is_available" className="text-sm font-medium text-slate-900 dark:text-white">
                  {t('addons.availableForBooking')}
                </label>
              </div>

              {/* Translations Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-6">
                  {/* English */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-xl">🇬🇧</span> English
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="English Name"
                        value={formData.en_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, en_name: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <textarea
                        placeholder="English Description"
                        value={formData.en_short_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, en_short_description: e.target.value }))}
                        rows="2"
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Arabic */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-xl">🇸🇦</span> العربية (Arabic)
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Arabic Name"
                        value={formData.ar_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, ar_name: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <textarea
                        placeholder="Arabic Description"
                        value={formData.ar_short_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, ar_short_description: e.target.value }))}
                        rows="2"
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Spanish */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-xl">🇪🇸</span> Español (Spanish)
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Spanish Name"
                        value={formData.es_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, es_name: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <textarea
                        placeholder="Spanish Description"
                        value={formData.es_short_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, es_short_description: e.target.value }))}
                        rows="2"
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* German */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-xl">🇩🇪</span> Deutsch (German)
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="German Name"
                        value={formData.de_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, de_name: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <textarea
                        placeholder="German Description"
                        value={formData.de_short_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, de_short_description: e.target.value }))}
                        rows="2"
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Russian */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-xl">🇷🇺</span> Русский (Russian)
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Russian Name"
                        value={formData.ru_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, ru_name: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <textarea
                        placeholder="Russian Description"
                        value={formData.ru_short_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, ru_short_description: e.target.value }))}
                        rows="2"
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  {t('addons.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors font-medium"
                >
                  {submitting ? t('addons.saving') : (modalMode === 'create' ? `➕ ${t('addons.create')}` : `💾 ${t('addons.update')}`)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddonsPage;
