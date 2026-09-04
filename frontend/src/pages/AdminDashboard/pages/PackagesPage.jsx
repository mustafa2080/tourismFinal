import { useState, useEffect } from 'react';
import { 
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiMapPin, 
  FiClock, FiDollarSign, FiStar, FiImage, FiTag, FiCalendar,
  FiChevronDown, FiRefreshCw, FiAlertCircle, FiUpload, FiTrash, FiChevronUp
} from 'react-icons/fi';
import { MdTour, MdCheckCircle } from 'react-icons/md';
import adminService from '../../../services/adminService';
import { categoryService } from '../../../services/categoryService';
import { uploadService } from '../../../services/uploadService';
import TranslationFields from '../../../components/TranslationFields';
import toast from 'react-hot-toast';

function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    category_id: '',
    duration_days: 1,
    base_price: 0,
    short_desc: '',
    long_desc: '',
    featured: false,
    images: [],
    itineraries: [],
    inclusions: [],
    exclusions: [],
    // English translations
    en_name: '',
    en_short_description: '',
    en_detailed_description: '',
    en_whats_included: '',
    en_whats_excluded: '',
    en_daily_itinerary: '',
    en_whats_included_items: [],
    en_whats_excluded_items: [],
    en_daily_itinerary_items: [],
    en_daily_itinerary_days: [],
    // Arabic translations
    ar_name: '',
    ar_short_description: '',
    ar_detailed_description: '',
    ar_whats_included: '',
    ar_whats_excluded: '',
    ar_daily_itinerary: '',
    ar_whats_included_items: [],
    ar_whats_excluded_items: [],
    ar_daily_itinerary_items: [],
    ar_daily_itinerary_days: [],
    // Spanish translations
    es_name: '',
    es_short_description: '',
    es_detailed_description: '',
    es_whats_included: '',
    es_whats_excluded: '',
    es_daily_itinerary: '',
    es_whats_included_items: [],
    es_whats_excluded_items: [],
    es_daily_itinerary_items: [],
    es_daily_itinerary_days: [],
    // German translations
    de_name: '',
    de_short_description: '',
    de_detailed_description: '',
    de_whats_included: '',
    de_whats_excluded: '',
    de_daily_itinerary: '',
    de_whats_included_items: [],
    de_whats_excluded_items: [],
    de_daily_itinerary_items: [],
    de_daily_itinerary_days: [],
    // Russian translations
    ru_name: '',
    ru_short_description: '',
    ru_detailed_description: '',
    ru_whats_included: '',
    ru_whats_excluded: '',
    ru_daily_itinerary: '',
    ru_whats_included_items: [],
    ru_whats_excluded_items: [],
    ru_daily_itinerary_items: [],
    ru_daily_itinerary_days: [],
  });

  useEffect(() => {
    fetchCategories();
    fetchPackages();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      const categoryList = Array.isArray(data) ? data : (data?.data ? data.data : []);
      const validCategories = categoryList.filter(cat => cat && cat.id && cat.name);
      setCategories(validCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      console.log('📦 [PackagesPage] Fetching all packages from database...');
      
      const response = await adminService.getAllPackages(100, 0);
      
      console.log('📦 [PackagesPage] Raw response:', response);
      console.log('📦 [PackagesPage] Response type:', typeof response);
      console.log('📦 [PackagesPage] Response.success:', response?.success);
      console.log('📦 [PackagesPage] Response.data type:', Array.isArray(response?.data) ? 'array' : typeof response?.data);
      
      if (response && response.success && Array.isArray(response.data)) {
        console.log(`✅ [PackagesPage] Loaded ${response.data.length} packages`);
        setPackages(response.data);
      } else {
        console.error('❌ [PackagesPage] Unexpected response structure:', response);
        toast.error('Failed to load packages - unexpected response format');
      }
    } catch (error) {
      console.error('❌ [PackagesPage] Error fetching packages:', error);
      console.error('❌ [PackagesPage] Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      toast.error(error.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedPackages = packages
    .filter(pkg => {
      const matchesSearch = 
        pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.destination?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterFeatured === 'all' 
        ? true 
        : filterFeatured === 'featured' 
        ? pkg.featured 
        : !pkg.featured;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.base_price - b.base_price;
      if (sortBy === 'price_high') return b.base_price - a.base_price;
      if (sortBy === 'duration') return a.duration_days - b.duration_days;
      if (sortBy === 'rating') return (parseFloat(b.average_rating) || 0) - (parseFloat(a.average_rating) || 0);
      return 0;
    });

  const handleViewPackage = (pkg) => {
    try {
      setSelectedPackage(pkg);
      const newFormData = {
        title: pkg.title || '',
        destination: pkg.destination || '',
        category_id: pkg.category_id || '',
        duration_days: pkg.duration_days || 1,
        base_price: pkg.base_price || 0,
        short_desc: pkg.short_desc || '',
        long_desc: pkg.long_desc || '',
        featured: pkg.featured || false,
        images: (pkg.images || []).map((img, idx) => {
          let displayUrl = img.url || '';
          if (img.image_data && !displayUrl) {
            let imageData = img.image_data;
            if (typeof imageData === 'string') {
              displayUrl = `data:image/jpeg;base64,${imageData}`;
            } else if (imageData.data && Array.isArray(imageData.data)) {
              const binaryString = String.fromCharCode.apply(null, imageData.data);
              const base64 = btoa(binaryString);
              displayUrl = `data:image/jpeg;base64,${base64}`;
            }
          }
          return {
            ...img,
            url: displayUrl,
            image_data: img.image_data || ''
          };
        }),
        itineraries: pkg.itineraries || [],
        inclusions: pkg.inclusions || [],
        exclusions: pkg.exclusions || [],
        // Add translation fields with defaults
        en_name: pkg.en_name || '',
        en_short_description: pkg.en_short_description || '',
        en_detailed_description: pkg.en_detailed_description || '',
        en_whats_included: pkg.en_whats_included || '',
        en_whats_excluded: pkg.en_whats_excluded || '',
        en_daily_itinerary: pkg.en_daily_itinerary || '',
        en_whats_included_items: pkg.en_whats_included_items || [],
        en_whats_excluded_items: pkg.en_whats_excluded_items || [],
        en_daily_itinerary_items: pkg.en_daily_itinerary_items || [],
        en_daily_itinerary_days: pkg.en_daily_itinerary_days || [],
        ar_name: pkg.ar_name || '',
        ar_short_description: pkg.ar_short_description || '',
        ar_detailed_description: pkg.ar_detailed_description || '',
        ar_whats_included: pkg.ar_whats_included || '',
        ar_whats_excluded: pkg.ar_whats_excluded || '',
        ar_daily_itinerary: pkg.ar_daily_itinerary || '',
        ar_whats_included_items: pkg.ar_whats_included_items || [],
        ar_whats_excluded_items: pkg.ar_whats_excluded_items || [],
        ar_daily_itinerary_items: pkg.ar_daily_itinerary_items || [],
        ar_daily_itinerary_days: pkg.ar_daily_itinerary_days || [],
        es_name: pkg.es_name || '',
        es_short_description: pkg.es_short_description || '',
        es_detailed_description: pkg.es_detailed_description || '',
        es_whats_included: pkg.es_whats_included || '',
        es_whats_excluded: pkg.es_whats_excluded || '',
        es_daily_itinerary: pkg.es_daily_itinerary || '',
        es_whats_included_items: pkg.es_whats_included_items || [],
        es_whats_excluded_items: pkg.es_whats_excluded_items || [],
        es_daily_itinerary_items: pkg.es_daily_itinerary_items || [],
        es_daily_itinerary_days: pkg.es_daily_itinerary_days || [],
        de_name: pkg.de_name || '',
        de_short_description: pkg.de_short_description || '',
        de_detailed_description: pkg.de_detailed_description || '',
        de_whats_included: pkg.de_whats_included || '',
        de_whats_excluded: pkg.de_whats_excluded || '',
        de_daily_itinerary: pkg.de_daily_itinerary || '',
        de_whats_included_items: pkg.de_whats_included_items || [],
        de_whats_excluded_items: pkg.de_whats_excluded_items || [],
        de_daily_itinerary_items: pkg.de_daily_itinerary_items || [],
        de_daily_itinerary_days: pkg.de_daily_itinerary_days || [],
        ru_name: pkg.ru_name || '',
        ru_short_description: pkg.ru_short_description || '',
        ru_detailed_description: pkg.ru_detailed_description || '',
        ru_whats_included: pkg.ru_whats_included || '',
        ru_whats_excluded: pkg.ru_whats_excluded || '',
        ru_daily_itinerary: pkg.ru_daily_itinerary || '',
        ru_whats_included_items: pkg.ru_whats_included_items || [],
        ru_whats_excluded_items: pkg.ru_whats_excluded_items || [],
        ru_daily_itinerary_items: pkg.ru_daily_itinerary_items || [],
        ru_daily_itinerary_days: pkg.ru_daily_itinerary_days || [],
      };
      setFormData(newFormData);
      setModalMode('view');
      setShowModal(true);
    } catch (error) {
      console.error('Error viewing package:', error);
      toast.error('Failed to load package details');
    }
  };

  const handleEditPackage = (pkg) => {
    try {
      setSelectedPackage(pkg);
      const newFormData = {
        title: pkg.title || '',
        destination: pkg.destination || '',
        category_id: pkg.category_id || '',
        duration_days: pkg.duration_days || 1,
        base_price: pkg.base_price || 0,
        short_desc: pkg.short_desc || '',
        long_desc: pkg.long_desc || '',
        featured: pkg.featured || false,
        images: (pkg.images || []).map((img, idx) => {
          let displayUrl = img.url || '';
          if (img.image_data && !displayUrl) {
            let imageData = img.image_data;
            if (typeof imageData === 'string') {
              displayUrl = `data:image/jpeg;base64,${imageData}`;
            } else if (imageData.data && Array.isArray(imageData.data)) {
              const binaryString = String.fromCharCode.apply(null, imageData.data);
              const base64 = btoa(binaryString);
              displayUrl = `data:image/jpeg;base64,${base64}`;
            }
          }
          return {
            ...img,
            url: displayUrl,
            image_data: img.image_data || ''
          };
        }),
        itineraries: pkg.itineraries || [],
        inclusions: pkg.inclusions || [],
        exclusions: pkg.exclusions || [],
        // Add translation fields with defaults
        en_name: pkg.en_name || '',
        en_short_description: pkg.en_short_description || '',
        en_detailed_description: pkg.en_detailed_description || '',
        en_whats_included: pkg.en_whats_included || '',
        en_whats_excluded: pkg.en_whats_excluded || '',
        en_daily_itinerary: pkg.en_daily_itinerary || '',
        en_whats_included_items: pkg.en_whats_included_items || [],
        en_whats_excluded_items: pkg.en_whats_excluded_items || [],
        en_daily_itinerary_items: pkg.en_daily_itinerary_items || [],
        en_daily_itinerary_days: pkg.en_daily_itinerary_days || [],
        ar_name: pkg.ar_name || '',
        ar_short_description: pkg.ar_short_description || '',
        ar_detailed_description: pkg.ar_detailed_description || '',
        ar_whats_included: pkg.ar_whats_included || '',
        ar_whats_excluded: pkg.ar_whats_excluded || '',
        ar_daily_itinerary: pkg.ar_daily_itinerary || '',
        ar_whats_included_items: pkg.ar_whats_included_items || [],
        ar_whats_excluded_items: pkg.ar_whats_excluded_items || [],
        ar_daily_itinerary_items: pkg.ar_daily_itinerary_items || [],
        ar_daily_itinerary_days: pkg.ar_daily_itinerary_days || [],
        es_name: pkg.es_name || '',
        es_short_description: pkg.es_short_description || '',
        es_detailed_description: pkg.es_detailed_description || '',
        es_whats_included: pkg.es_whats_included || '',
        es_whats_excluded: pkg.es_whats_excluded || '',
        es_daily_itinerary: pkg.es_daily_itinerary || '',
        es_whats_included_items: pkg.es_whats_included_items || [],
        es_whats_excluded_items: pkg.es_whats_excluded_items || [],
        es_daily_itinerary_items: pkg.es_daily_itinerary_items || [],
        es_daily_itinerary_days: pkg.es_daily_itinerary_days || [],
        de_name: pkg.de_name || '',
        de_short_description: pkg.de_short_description || '',
        de_detailed_description: pkg.de_detailed_description || '',
        de_whats_included: pkg.de_whats_included || '',
        de_whats_excluded: pkg.de_whats_excluded || '',
        de_daily_itinerary: pkg.de_daily_itinerary || '',
        de_whats_included_items: pkg.de_whats_included_items || [],
        de_whats_excluded_items: pkg.de_whats_excluded_items || [],
        de_daily_itinerary_items: pkg.de_daily_itinerary_items || [],
        de_daily_itinerary_days: pkg.de_daily_itinerary_days || [],
        ru_name: pkg.ru_name || '',
        ru_short_description: pkg.ru_short_description || '',
        ru_detailed_description: pkg.ru_detailed_description || '',
        ru_whats_included: pkg.ru_whats_included || '',
        ru_whats_excluded: pkg.ru_whats_excluded || '',
        ru_daily_itinerary: pkg.ru_daily_itinerary || '',
        ru_whats_included_items: pkg.ru_whats_included_items || [],
        ru_whats_excluded_items: pkg.ru_whats_excluded_items || [],
        ru_daily_itinerary_items: pkg.ru_daily_itinerary_items || [],
        ru_daily_itinerary_days: pkg.ru_daily_itinerary_days || [],
      };
      setFormData(newFormData);
      setModalMode('edit');
      setShowModal(true);
    } catch (error) {
      console.error('Error loading package for edit:', error);
      toast.error('Failed to load package for editing');
    }
  };

  const handleCreatePackage = () => {
    setSelectedPackage(null);
    setFormData({
      title: '',
      destination: '',
      category_id: '',
      duration_days: 1,
      base_price: 0,
      short_desc: '',
      long_desc: '',
      featured: false,
      images: [],
      itineraries: [],
      inclusions: [],
      exclusions: [],
      en_name: '',
      en_short_description: '',
      en_detailed_description: '',
      en_whats_included: '',
      en_whats_excluded: '',
      en_daily_itinerary: '',
      en_whats_included_items: [],
      en_whats_excluded_items: [],
      en_daily_itinerary_items: [],
      en_daily_itinerary_days: [],
      ar_name: '',
      ar_short_description: '',
      ar_detailed_description: '',
      ar_whats_included: '',
      ar_whats_excluded: '',
      ar_daily_itinerary: '',
      ar_whats_included_items: [],
      ar_whats_excluded_items: [],
      ar_daily_itinerary_items: [],
      ar_daily_itinerary_days: [],
      es_name: '',
      es_short_description: '',
      es_detailed_description: '',
      es_whats_included: '',
      es_whats_excluded: '',
      es_daily_itinerary: '',
      es_whats_included_items: [],
      es_whats_excluded_items: [],
      es_daily_itinerary_items: [],
      es_daily_itinerary_days: [],
      de_name: '',
      de_short_description: '',
      de_detailed_description: '',
      de_whats_included: '',
      de_whats_excluded: '',
      de_daily_itinerary: '',
      de_whats_included_items: [],
      de_whats_excluded_items: [],
      de_daily_itinerary_items: [],
      de_daily_itinerary_days: [],
      ru_name: '',
      ru_short_description: '',
      ru_detailed_description: '',
      ru_whats_included: '',
      ru_whats_excluded: '',
      ru_daily_itinerary: '',
      ru_whats_included_items: [],
      ru_whats_excluded_items: [],
      ru_daily_itinerary_items: [],
      ru_daily_itinerary_days: [],
    });
    setImageUploadProgress({});
    setModalMode('create');
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      setUploadingImages(true);
      console.log(`📸 Processing ${files.length} image(s)...`);

      // Validate files
      for (const file of files) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.type}. Only JPEG, PNG, GIF, and WebP are allowed.`);
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error(`File "${file.name}" is too large. Maximum size is 5MB.`);
        }
      }

      console.log('✅ All files validated');

      // Convert to base64
      const base64Images = await uploadService.filesToBase64(files);
      
      const newImages = base64Images.map((img, index) => {
        // Ensure we have clean base64
        let base64Data = img.image_data;
        if (typeof base64Data === 'string' && base64Data.startsWith('data:')) {
          base64Data = base64Data.split(',')[1];
        }

        return {
          image_data: base64Data,
          url: '', // Don't send data URL to backend - only send base64
          alt_text: img.alt_text?.substring(0, 255) || `Package image ${formData.images.length + index + 1}`,
          order: formData.images.length + index
        };
      });

      console.log(`✅ Converted ${newImages.length} image(s) to base64`);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

      toast.success(`✅ ${newImages.length} image(s) added successfully`);
    } catch (error) {
      console.error('❌ Error processing images:', error);
      toast.error(`❌ ${error.message || 'Failed to process images'}`);
    } finally {
      setUploadingImages(false);
      setImageUploadProgress({});
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const moveImageUp = (index) => {
    if (index === 0) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
      return { ...prev, images: newImages };
    });
  };

  const moveImageDown = (index) => {
    if (index === formData.images.length - 1) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      return { ...prev, images: newImages };
    });
  };

  const handleAddItinerary = () => {
    setFormData(prev => ({
      ...prev,
      itineraries: [
        ...prev.itineraries,
        {
          day_number: prev.itineraries.length + 1,
          title: '',
          description: '',
          activities: '',
          meals: '',
          image_url: ''
        }
      ]
    }));
  };

  const handleUpdateItinerary = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      itineraries: prev.itineraries.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleRemoveItinerary = (index) => {
    setFormData(prev => ({
      ...prev,
      itineraries: prev.itineraries
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, day_number: i + 1 }))
    }));
  };

  const handleAddInclusion = () => {
    setFormData(prev => ({
      ...prev,
      inclusions: [...(prev.inclusions || []), '']
    }));
  };

  const handleUpdateInclusion = (index, value) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.map((item, i) =>
        i === index ? value : item
      )
    }));
  };

  const handleRemoveInclusion = (index) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }));
  };

  const handleAddExclusion = () => {
    setFormData(prev => ({
      ...prev,
      exclusions: [...(prev.exclusions || []), '']
    }));
  };

  const handleUpdateExclusion = (index, value) => {
    setFormData(prev => ({
      ...prev,
      exclusions: prev.exclusions.map((item, i) =>
        i === index ? value : item
      )
    }));
  };

  const handleRemoveExclusion = (index) => {
    setFormData(prev => ({
      ...prev,
      exclusions: prev.exclusions.filter((_, i) => i !== index)
    }));
  };

  const handleSavePackage = async () => {
    // Validation
    if (!formData.title || !formData.title.trim()) {
      toast.error('Package name is required');
      return;
    }

    if (!formData.destination || !formData.destination.trim()) {
      toast.error('Destination is required');
      return;
    }

    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.duration_days || formData.duration_days < 1) {
      toast.error('Duration must be at least 1 day');
      return;
    }

    if (!formData.base_price || formData.base_price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    if (formData.images.length === 0 && modalMode !== 'view') {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setSubmitting(true);
      
      // Process images - clean base64 data
      const imagesForRequest = formData.images
        .filter(img => img.image_data && img.image_data.length > 0) // Only images with data
        .map((img, index) => {
          let imageData = img.image_data;
          
          // Remove data URI prefix if present
          if (typeof imageData === 'string' && imageData.includes(',')) {
            imageData = imageData.split(',')[1];
          }

          return {
            image_data: imageData || '',
            url: '', // Empty - we store base64, not URLs
            alt_text: img.alt_text?.trim() || `Package image ${index + 1}`,
            order: index
          };
        });

      // Double check we have images
      if (imagesForRequest.length === 0 && modalMode !== 'view') {
        toast.error('❌ No valid images found. Please upload at least one image.');
        return;
      }

      const packageData = {
        title: formData.title.trim(),
        destination: formData.destination.trim(),
        category_id: formData.category_id,
        duration_days: parseInt(formData.duration_days),
        base_price: parseFloat(formData.base_price),
        short_desc: formData.short_desc?.trim() || '',
        long_desc: formData.long_desc?.trim() || '',
        featured: Boolean(formData.featured),
        inclusions: (formData.inclusions || []).filter(item => item && item.trim()),
        exclusions: (formData.exclusions || []).filter(item => item && item.trim()),
        images: imagesForRequest,
        itineraries: formData.itineraries
          .filter(itin => itin.title && itin.title.trim())
          .map(itin => ({
            day_number: itin.day_number,
            title: itin.title.trim(),
            description: itin.description?.trim() || '',
            activities: itin.activities?.trim() || '',
            meals: itin.meals?.trim() || '',
            image_url: itin.image_url?.trim() || ''
          })),
        // English translations
        en_name: formData.en_name?.trim() || '',
        en_short_description: formData.en_short_description?.trim() || '',
        en_detailed_description: formData.en_detailed_description?.trim() || '',
        en_whats_included: formData.en_whats_included?.trim() || '',
        en_whats_excluded: formData.en_whats_excluded?.trim() || '',
        en_daily_itinerary: formData.en_daily_itinerary?.trim() || '',
        en_whats_included_items: (formData.en_whats_included_items || []).filter(item => item && item.trim()),
        en_whats_excluded_items: (formData.en_whats_excluded_items || []).filter(item => item && item.trim()),
        en_daily_itinerary_items: (formData.en_daily_itinerary_items || []).filter(item => item && item.trim()),
        en_daily_itinerary_days: formData.en_daily_itinerary_days || [],
        // Arabic translations
        ar_name: formData.ar_name?.trim() || '',
        ar_short_description: formData.ar_short_description?.trim() || '',
        ar_detailed_description: formData.ar_detailed_description?.trim() || '',
        ar_whats_included: formData.ar_whats_included?.trim() || '',
        ar_whats_excluded: formData.ar_whats_excluded?.trim() || '',
        ar_daily_itinerary: formData.ar_daily_itinerary?.trim() || '',
        ar_whats_included_items: (formData.ar_whats_included_items || []).filter(item => item && item.trim()),
        ar_whats_excluded_items: (formData.ar_whats_excluded_items || []).filter(item => item && item.trim()),
        ar_daily_itinerary_items: (formData.ar_daily_itinerary_items || []).filter(item => item && item.trim()),
        ar_daily_itinerary_days: formData.ar_daily_itinerary_days || [],
        // Spanish translations
        es_name: formData.es_name?.trim() || '',
        es_short_description: formData.es_short_description?.trim() || '',
        es_detailed_description: formData.es_detailed_description?.trim() || '',
        es_whats_included: formData.es_whats_included?.trim() || '',
        es_whats_excluded: formData.es_whats_excluded?.trim() || '',
        es_daily_itinerary: formData.es_daily_itinerary?.trim() || '',
        es_whats_included_items: (formData.es_whats_included_items || []).filter(item => item && item.trim()),
        es_whats_excluded_items: (formData.es_whats_excluded_items || []).filter(item => item && item.trim()),
        es_daily_itinerary_items: (formData.es_daily_itinerary_items || []).filter(item => item && item.trim()),
        es_daily_itinerary_days: formData.es_daily_itinerary_days || [],
        // German translations
        de_name: formData.de_name?.trim() || '',
        de_short_description: formData.de_short_description?.trim() || '',
        de_detailed_description: formData.de_detailed_description?.trim() || '',
        de_whats_included: formData.de_whats_included?.trim() || '',
        de_whats_excluded: formData.de_whats_excluded?.trim() || '',
        de_daily_itinerary: formData.de_daily_itinerary?.trim() || '',
        de_whats_included_items: (formData.de_whats_included_items || []).filter(item => item && item.trim()),
        de_whats_excluded_items: (formData.de_whats_excluded_items || []).filter(item => item && item.trim()),
        de_daily_itinerary_items: (formData.de_daily_itinerary_items || []).filter(item => item && item.trim()),
        de_daily_itinerary_days: formData.de_daily_itinerary_days || [],
        // Russian translations
        ru_name: formData.ru_name?.trim() || '',
        ru_short_description: formData.ru_short_description?.trim() || '',
        ru_detailed_description: formData.ru_detailed_description?.trim() || '',
        ru_whats_included: formData.ru_whats_included?.trim() || '',
        ru_whats_excluded: formData.ru_whats_excluded?.trim() || '',
        ru_daily_itinerary: formData.ru_daily_itinerary?.trim() || '',
        ru_whats_included_items: (formData.ru_whats_included_items || []).filter(item => item && item.trim()),
        ru_whats_excluded_items: (formData.ru_whats_excluded_items || []).filter(item => item && item.trim()),
        ru_daily_itinerary_items: (formData.ru_daily_itinerary_items || []).filter(item => item && item.trim()),
      };

      console.log('📤 Sending package:', {
        title: packageData.title,
        destination: packageData.destination,
        duration: packageData.duration_days,
        price: packageData.base_price,
        inclusions: packageData.inclusions,
        exclusions: packageData.exclusions,
        imageCount: packageData.images.length,
        itineraryCount: packageData.itineraries.length,
        payloadSize: `${(JSON.stringify(packageData).length / 1024 / 1024).toFixed(2)} MB`
      });

      if (modalMode === 'create') {
        const response = await adminService.createPackage(packageData);
        if (response.success) {
          // ✅ Optimistic Update: Add to list immediately
          setPackages(prev => [response.data, ...prev]);
          
          toast.success('✅ Package created successfully!');
          
          setShowModal(false);
          
          // ✅ Sync with server after short delay
          setTimeout(() => {
            fetchPackages();
          }, 800);
        } else {
          toast.error(response.message || 'Failed to create package');
          return;
        }
      } else if (modalMode === 'edit') {
        const response = await adminService.updatePackage(selectedPackage.id, packageData);
        if (response.success) {
          console.log('✅ Response data received:', {
            title: response.data.title,
            inclusions: response.data.inclusions,
            exclusions: response.data.exclusions,
          });
          
          // ✅ Update the specific package in list
          setPackages(prev => 
            prev.map(p => p.id === selectedPackage.id ? response.data : p)
          );
          
          toast.success('✅ Package updated successfully!');
          
          setShowModal(false);
          
          // ✅ Sync with server after short delay
          setTimeout(() => {
            fetchPackages();
          }, 800);
        } else {
          toast.error(response.message || 'Failed to update package');
          return;
        }
      }
    } catch (error) {
      console.error('Error saving package:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save package';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePackage = async (pkgId) => {
    if (!window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }

    try {
      toast.loading('Deleting package...', { id: `delete-${pkgId}` });
      
      const response = await adminService.deletePackage(pkgId);
      
      if (response.success) {
        toast.success('✅ Package deleted successfully', { id: `delete-${pkgId}` });
        fetchPackages();
      } else {
        toast.error(response.message || 'Failed to delete package', { id: `delete-${pkgId}` });
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete package';
      toast.error(`❌ ${errorMessage}`, { id: `delete-${pkgId}` });
    }
  };

  const stats = {
    total: packages.length,
    featured: packages.filter(p => p.featured).length,
    avgPrice: packages.length > 0 
      ? (packages.reduce((sum, p) => sum + (parseFloat(p.base_price) || 0), 0) / packages.length).toFixed(0)
      : 0,
    avgRating: packages.length > 0 
      ? (packages.reduce((sum, p) => sum + (parseFloat(p.average_rating) || 0), 0) / packages.length).toFixed(1)
      : 0,
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <MdTour className="text-white" size={32} />
            </div>
            Manage Packages
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
            Manage all tour packages and their details
          </p>
        </div>
        <button
          onClick={handleCreatePackage}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold shadow-lg transform hover:scale-105 hover:from-teal-700 hover:to-teal-800"
        >
          <FiPlus size={22} />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-2xl p-6 border border-teal-200 dark:border-teal-700/50 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-teal-600 dark:text-teal-400 text-sm font-bold uppercase tracking-wide">Total Packages</p>
            <MdTour className="text-teal-600 dark:text-teal-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-teal-900 dark:text-teal-100">{stats.total}</p>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">All available packages</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-700/50 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-yellow-600 dark:text-yellow-400 text-sm font-bold uppercase tracking-wide">Featured Packages</p>
            <FiTag className="text-yellow-600 dark:text-yellow-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.featured}</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Featured packages</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-700/50 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-600 dark:text-green-400 text-sm font-bold uppercase tracking-wide">Average Price</p>
            <FiDollarSign className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">${stats.avgPrice}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">Average price</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-700/50 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-wide">Average Rating</p>
            <FiStar className="text-orange-600 dark:text-orange-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.avgRating} stars</p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Overall rating</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative md:col-span-2">
            <FiSearch className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search by package or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div className="relative">
            <FiChevronDown className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" size={20} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none font-medium"
            >
              <option value="recent">Most Recent</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="duration">Duration</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilterFeatured('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
              filterFeatured === 'all'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterFeatured('featured')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
              filterFeatured === 'featured'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500'
            }`}
          >
            <FiTag size={16} />
            Featured
          </button>
          <button
            onClick={() => setFilterFeatured('regular')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
              filterFeatured === 'regular'
                ? 'bg-slate-600 text-white shadow-lg'
                : 'bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500'
            }`}
          >
            Regular
          </button>
          <button
            onClick={fetchPackages}
            className="ml-auto px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500 transition-all flex items-center gap-2 font-semibold text-sm"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-300 dark:border-slate-600 border-t-teal-600 dark:border-t-teal-400 mb-4"></div>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Loading packages...</p>
            </div>
          </div>
        ) : filteredAndSortedPackages.length > 0 ? (
          filteredAndSortedPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="relative h-48 bg-gradient-to-br from-teal-400 to-teal-600 overflow-hidden">
                {pkg.images && pkg.images.length > 0 ? (
                  <img 
                    src={(() => {
                      const imageData = pkg.images[0]?.image_data;
                      if (!imageData) return pkg.images[0]?.url || '';
                      
                      if (typeof imageData === 'string') {
                        return `data:image/jpeg;base64,${imageData}`;
                      } else if (imageData.data && Array.isArray(imageData.data)) {
                        const binaryString = String.fromCharCode.apply(null, imageData.data);
                        const base64 = btoa(binaryString);
                        return `data:image/jpeg;base64,${base64}`;
                      }
                      return '';
                    })()} 
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiImage className="text-white/30" size={48} />
                  </div>
                )}
                
                {pkg.featured && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-100 rounded-full font-bold text-sm shadow-lg">
                    <FiTag size={16} />
                    Featured
                  </div>
                )}

                <div className="absolute bottom-4 left-4 flex items-center gap-1 px-3 py-2 bg-white/95 dark:bg-slate-800/95 rounded-full backdrop-blur-sm shadow-lg">
                  <FiStar className="text-yellow-500 fill-current" size={16} />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {(pkg.average_rating && typeof pkg.average_rating === 'number') ? pkg.average_rating.toFixed(1) : (pkg.average_rating ? parseFloat(pkg.average_rating).toFixed(1) : '0.0')} stars
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {pkg.title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <FiMapPin size={16} className="text-red-500 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{pkg.destination}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <FiClock className="text-teal-600 mx-auto mb-1" size={16} />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{pkg.duration_days}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Days</p>
                  </div>
                  <div className="text-center">
                    <FiDollarSign className="text-green-600 mx-auto mb-1" size={16} />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">${pkg.base_price}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Per Person</p>
                  </div>
                  <div className="text-center">
                    <FiStar className="text-yellow-500 mx-auto mb-1" size={16} />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{(pkg.average_rating && typeof pkg.average_rating === 'number') ? pkg.average_rating.toFixed(1) : (pkg.average_rating ? parseFloat(pkg.average_rating).toFixed(1) : '0.0')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Stars</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 h-10">
                  {pkg.short_desc || 'No description'}
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleViewPackage(pkg)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-all text-sm font-semibold hover:shadow-lg"
                  >
                    <FiEye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleEditPackage(pkg)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all text-sm font-semibold hover:shadow-lg"
                  >
                    <FiEdit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-sm font-semibold hover:shadow-lg"
                  >
                    <FiTrash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                <MdTour className="text-slate-400 dark:text-slate-500" size={48} />
              </div>
              <p className="text-xl text-slate-600 dark:text-slate-400 font-bold">No packages found</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 bg-gradient-to-r from-teal-600 to-orange-600 text-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <MdTour size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {modalMode === 'view' ? 'Package Details' : modalMode === 'edit' ? 'Edit Package' : 'Create New Package'}
                  </h2>
                  <p className="text-white/80 text-sm mt-0.5">
                    {modalMode === 'view' ? 'View package information' : 'Update package details'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Images Section */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiImage size={18} className="text-teal-600" />
                  Package Images
                </label>

                {/* Images Gallery */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {formData.images.map((img, idx) => {
                      // Generate preview URL - handle both base64 and URL formats
                      let previewUrl = img.url;
                      if (!previewUrl && img.image_data) {
                        let imageData = img.image_data;
                        if (typeof imageData === 'string') {
                          previewUrl = `data:image/jpeg;base64,${imageData}`;
                        } else if (imageData.data && Array.isArray(imageData.data)) {
                          const binaryString = String.fromCharCode.apply(null, imageData.data);
                          const base64 = btoa(binaryString);
                          previewUrl = `data:image/jpeg;base64,${base64}`;
                        }
                      }
                      
                      return (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={img.alt_text || `Package ${idx + 1}`}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="12" fill="%23999" text-anchor="middle" dy=".3em"%3EImage Error%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          ) : (
                            <div className="w-full h-32 flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                              <span className="text-sm text-slate-500">No preview</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            {modalMode !== 'view' && (
                              <>
                                {idx > 0 && (
                                  <button
                                    onClick={() => moveImageUp(idx)}
                                    className="p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-all text-white"
                                    title="Move up"
                                  >
                                    <FiChevronUp size={18} />
                                  </button>
                                )}
                                {idx < formData.images.length - 1 && (
                                  <button
                                    onClick={() => moveImageDown(idx)}
                                    className="p-2 bg-white/20 hover:bg-white/40 rounded-lg transition-all text-white"
                                    title="Move down"
                                  >
                                    <FiChevronDown size={18} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRemoveImage(idx)}
                                  className="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg transition-all text-white"
                                  title="Delete"
                                >
                                  <FiTrash size={18} />
                                </button>
                              </>
                            )}
                          </div>
                          <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                            {idx + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload Button */}
                {modalMode !== 'view' && (
                  <label className="block">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-all">
                      <FiUpload className="mx-auto mb-2 text-slate-400" size={24} />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        PNG, JPG, GIF up to 5MB each
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiTag size={18} className="text-teal-600" />
                  Package Name *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={modalMode === 'view'}
                  placeholder="e.g. Amazing Pyramids Tour"
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiTag size={18} className="text-orange-600" />
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  disabled={modalMode === 'view'}
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none font-medium"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination and Duration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiMapPin size={18} className="text-red-600" />
                    Destination *
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    disabled={modalMode === 'view'}
                    placeholder="e.g. Cairo, Giza"
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiClock size={18} className="text-teal-600" />
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 1 })}
                    disabled={modalMode === 'view'}
                    placeholder="Number of days"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Price and Featured Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiDollarSign size={18} className="text-green-600" />
                    Base Price *
                  </label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                    disabled={modalMode === 'view'}
                    placeholder="Price in USD"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded кожи-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all w-full" style={{opacity: modalMode === 'view' ? 0.5 : 1, pointerEvents: modalMode === 'view' ? 'none' : 'auto'}}>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      disabled={modalMode === 'view'}
                      className="w-5 h-5 rounded border-slate-300 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Mark as Featured</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Will appear in featured list</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiAlertCircle size={18} className="text-orange-600" />
                  Short Description
                </label>
                <textarea
                  value={formData.short_desc}
                  onChange={(e) => setFormData({ ...formData, short_desc: e.target.value })}
                  disabled={modalMode === 'view'}
                  placeholder="Brief description of the package..."
                  rows="2"
                  maxLength="200"
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formData.short_desc.length}/200</p>
              </div>

              {/* Long Description */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiAlertCircle size={18} className="text-orange-600" />
                  Detailed Description
                </label>
                <textarea
                  value={formData.long_desc}
                  onChange={(e) => setFormData({ ...formData, long_desc: e.target.value })}
                  disabled={modalMode === 'view'}
                  placeholder="Detailed description including itinerary, inclusions..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
                />
              </div>

              {/* Inclusions Section */}
              <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FiTag size={18} className="text-green-600" />
                      What's Included
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add items and translate them in the Translations section below</p>
                  </div>
                  {modalMode !== 'view' && (
                    <button
                      onClick={handleAddInclusion}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-semibold whitespace-nowrap ml-4"
                    >
                      <FiPlus size={16} />
                      Add Item
                    </button>
                  )}
                </div>

                {formData.inclusions && formData.inclusions.length > 0 ? (
                  <div className="space-y-2">
                    {formData.inclusions.map((inclusion, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={inclusion}
                          onChange={(e) => handleUpdateInclusion(idx, e.target.value)}
                          disabled={modalMode === 'view'}
                          placeholder={`Inclusion ${idx + 1}...`}
                          className="flex-1 px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:border-green-500 transition-all"
                        />
                        {modalMode !== 'view' && (
                          <button
                            onClick={() => handleRemoveInclusion(idx)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          >
                            <FiTrash size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 p-3 text-center bg-slate-100 dark:bg-slate-900/20 rounded-lg">
                    {modalMode === 'view' ? 'No inclusions added' : 'No inclusions added yet. Click "Add Item" to start'}
                  </p>
                )}
              </div>

              {/* Exclusions Section */}
              <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FiTag size={18} className="text-red-600" />
                      What's Excluded
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add items and translate them in the Translations section below</p>
                  </div>
                  {modalMode !== 'view' && (
                    <button
                      onClick={handleAddExclusion}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold whitespace-nowrap ml-4"
                    >
                      <FiPlus size={16} />
                      Add Item
                    </button>
                  )}
                </div>

                {formData.exclusions && formData.exclusions.length > 0 ? (
                  <div className="space-y-2">
                    {formData.exclusions.map((exclusion, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={exclusion}
                          onChange={(e) => handleUpdateExclusion(idx, e.target.value)}
                          disabled={modalMode === 'view'}
                          placeholder={`Exclusion ${idx + 1}...`}
                          className="flex-1 px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:border-red-500 transition-all"
                        />
                        {modalMode !== 'view' && (
                          <button
                            onClick={() => handleRemoveExclusion(idx)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          >
                            <FiTrash size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 p-3 text-center bg-slate-100 dark:bg-slate-900/20 rounded-lg">
                    {modalMode === 'view' ? 'No exclusions added' : 'No exclusions added yet. Click "Add Item" to start'}
                  </p>
                )}
              </div>

              {/* Itineraries Section */}
              <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FiCalendar size={18} className="text-teal-600" />
                      Daily Itinerary
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add days and translate them in the Translations section below</p>
                  </div>
                  {modalMode !== 'view' && (
                    <button
                      onClick={handleAddItinerary}
                      className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-sm font-semibold whitespace-nowrap ml-4"
                    >
                      <FiPlus size={16} />
                      Add Day
                    </button>
                  )}
                </div>

                {formData.itineraries.length > 0 ? (
                  <div className="space-y-4">
                    {formData.itineraries.map((itinerary, idx) => (
                      <div key={idx} className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg space-y-3 bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 dark:text-white">Day {itinerary.day_number}</h4>
                          {modalMode !== 'view' && (
                            <button
                              onClick={() => handleRemoveItinerary(idx)}
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                            >
                              <FiTrash size={16} />
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={itinerary.title}
                          onChange={(e) => handleUpdateItinerary(idx, 'title', e.target.value)}
                          disabled={modalMode === 'view'}
                          placeholder="Day title..."
                          className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:border-teal-500 transition-all"
                        />

                        <textarea
                          value={itinerary.description}
                          onChange={(e) => handleUpdateItinerary(idx, 'description', e.target.value)}
                          disabled={modalMode === 'view'}
                          placeholder="Description..."
                          rows="2"
                          className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:border-teal-500 transition-all resize-none"
                        />

                        <input
                          type="text"
                          value={itinerary.activities}
                          onChange={(e) => handleUpdateItinerary(idx, 'activities', e.target.value)}
                          disabled={modalMode === 'view'}
                          placeholder="Activities (comma separated)..."
                          className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:border-teal-500 transition-all"
                        />

                        <input
                          type="text"
                          value={itinerary.meals}
                          onChange={(e) => handleUpdateItinerary(idx, 'meals', e.target.value)}
                          disabled={modalMode === 'view'}
                          placeholder="Meals (B, L, D)..."
                          className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:border-teal-500 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 p-4 text-center bg-slate-100 dark:bg-slate-900/20 rounded-lg">
                    {modalMode === 'view' ? 'No itinerary added' : 'No days added yet. Click "Add Day" to start'}
                  </p>
                )}
              </div>

              {/* Translation Fields Section */}
              <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-8">
                <TranslationFields 
                  formData={formData} 
                  setFormData={setFormData}
                  disabled={modalMode === 'view'}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-200 dark:border-slate-700 flex gap-3 sticky bottom-0 bg-white dark:bg-slate-800">
              {modalMode !== 'view' && (
                <button
                  onClick={handleSavePackage}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <MdCheckCircle size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-all font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackagesPage;