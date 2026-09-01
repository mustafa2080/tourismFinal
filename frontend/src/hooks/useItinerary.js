import { useState, useEffect, useCallback } from 'react';
import { itineraryService } from '../services';
import toast from 'react-hot-toast';

/**
 * useItinerary Hook
 * Manages itinerary state and operations for a package
 */
export const useItinerary = (packageId) => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch itineraries
  const fetchItineraries = useCallback(async () => {
    if (!packageId) {
      console.warn('❌ [useItinerary] No packageId provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`📅 [useItinerary] Fetching for package: ${packageId}`);

      const response = await itineraryService.getPackageItineraries(packageId);
      
      console.log('📅 [useItinerary] Service Response:', {
        success: response?.success,
        dataExists: !!response?.data,
        responseType: typeof response,
        isArray: Array.isArray(response),
        dataLength: Array.isArray(response) ? response.length : response?.data?.length,
        fullResponse: response
      });
      
      // Handle different response formats
      let itineraryData = [];
      
      if (Array.isArray(response)) {
        // Direct array response
        itineraryData = response;
        console.log('📅 [useItinerary] Response is array:', itineraryData);
      } else if (response?.data && Array.isArray(response.data)) {
        // { data: [...] } format
        itineraryData = response.data;
        console.log('📅 [useItinerary] Response has data array:', itineraryData);
      } else if (response?.success && response?.data) {
        // { success: true, data: [...] } format
        itineraryData = response.data;
        console.log('📅 [useItinerary] Response is success format:', itineraryData);
      }
      
      setItineraries(itineraryData || []);
      console.log(`✅ [useItinerary] Loaded ${itineraryData?.length || 0} days`);
    } catch (err) {
      console.error('❌ [useItinerary] Error:', err);
      setError(err.message || 'Failed to load itineraries');
      setItineraries([]);
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  // Auto-fetch on mount or packageId change
  useEffect(() => {
    if (packageId) {
      // Force refresh with no cache
      const timer = setTimeout(() => {
        fetchItineraries();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [packageId, fetchItineraries]);

  // Create itinerary
  const createDay = useCallback(async (dayData) => {
    try {
      console.log('📅 [useItinerary] Creating day:', dayData);
      const response = await itineraryService.createItinerary(dayData);
      
      if (response?.success) {
        setItineraries(prev => [...prev, response.data].sort((a, b) => a.day_number - b.day_number));
        toast.success(`Day ${dayData.day_number} created`);
        return response.data;
      }
    } catch (err) {
      console.error('❌ [useItinerary] Create error:', err);
      toast.error(err.response?.data?.error || 'Failed to create day');
      throw err;
    }
  }, []);

  // Update itinerary
  const updateDay = useCallback(async (id, dayData) => {
    try {
      console.log('📅 [useItinerary] Updating day:', id);
      const response = await itineraryService.updateItinerary(id, dayData);
      
      if (response?.success) {
        setItineraries(prev =>
          prev.map(item => item.id === id ? response.data : item)
        );
        toast.success('Day updated');
        return response.data;
      }
    } catch (err) {
      console.error('❌ [useItinerary] Update error:', err);
      toast.error(err.response?.data?.error || 'Failed to update day');
      throw err;
    }
  }, []);

  // Delete itinerary
  const deleteDay = useCallback(async (id) => {
    try {
      console.log('📅 [useItinerary] Deleting day:', id);
      const response = await itineraryService.deleteItinerary(id);
      
      if (response?.success) {
        setItineraries(prev => prev.filter(item => item.id !== id));
        toast.success('Day deleted');
        return true;
      }
    } catch (err) {
      console.error('❌ [useItinerary] Delete error:', err);
      toast.error(err.response?.data?.error || 'Failed to delete day');
      throw err;
    }
  }, []);

  // Upsert itinerary (create or update)
  const upsertDay = useCallback(async (dayData) => {
    try {
      console.log('📅 [useItinerary] Upserting day:', dayData);
      const response = await itineraryService.upsertItinerary(dayData);
      
      if (response?.success) {
        // Check if exists
        const exists = itineraries.some(i => i.id === response.data.id);
        
        if (exists) {
          setItineraries(prev =>
            prev.map(item => item.id === response.data.id ? response.data : item)
          );
        } else {
          setItineraries(prev =>
            [...prev, response.data].sort((a, b) => a.day_number - b.day_number)
          );
        }
        
        toast.success('Day saved');
        return response.data;
      }
    } catch (err) {
      console.error('❌ [useItinerary] Upsert error:', err);
      toast.error(err.response?.data?.error || 'Failed to save day');
      throw err;
    }
  }, [itineraries]);

  // Get specific day
  const getDay = useCallback((dayNumber) => {
    return itineraries.find(i => i.day_number === dayNumber);
  }, [itineraries]);

  // Refresh
  const refresh = useCallback(() => {
    return fetchItineraries();
  }, [fetchItineraries]);

  return {
    itineraries,
    loading,
    error,
    createDay,
    updateDay,
    deleteDay,
    upsertDay,
    getDay,
    refresh,
  };
};

export default useItinerary;
