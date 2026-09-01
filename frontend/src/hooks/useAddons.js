import { useState, useEffect, useCallback } from 'react';
import { addonsService } from '../services';

/**
 * useAddons Hook
 * Manages package add-ons state and operations
 */
export const useAddons = (packageId) => {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load addons
  const loadAddons = useCallback(async () => {
    if (!packageId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await addonsService.getPackageAddons(packageId);
      setAddons(response.data || []);
    } catch (err) {
      console.error('Error loading addons:', err);
      setError(err.message || 'Failed to load add-ons');
      setAddons([]);
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  // Initial load
  useEffect(() => {
    loadAddons();
  }, [loadAddons]);

  return {
    addons,
    loading,
    error,
    refreshAddons: loadAddons,
  };
};

export default useAddons;
