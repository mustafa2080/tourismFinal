import { useState, useCallback, useEffect, useRef } from 'react';
import { wishlistService } from '../services';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing user's wishlist
 */
export const useWishlist = () => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const wishlistRef = useRef(wishlist);

  // Keep ref updated for external checks
  useEffect(() => {
    wishlistRef.current = wishlist;
  }, [wishlist]);

  /**
   * Fetch user's wishlist
   */
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await wishlistService.getWishlist();
      console.log('✅ [useWishlist] Raw API response:', response);
      
      const wishlistArray = Array.isArray(response) ? response : (response?.data || []);
      console.log('✅ [useWishlist] Wishlist after parsing:', JSON.stringify(wishlistArray, null, 2));
      
      // Ensure each item has an id field
      const normalizedWishlist = wishlistArray.map(item => ({
        ...item,
        id: item.id || item.package_id
      }));
      
      setWishlist(normalizedWishlist);
    } catch (err) {
      console.error('❌ [useWishlist] Failed to fetch wishlist:', err);
      setError(err.message || 'Failed to fetch wishlist');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Load wishlist on mount or when auth changes
   */
  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated, fetchWishlist]);

  /**
   * Add package to wishlist
   */
  const addToWishlist = useCallback(async (packageId) => {
    if (!isAuthenticated) {
      setError('Please log in to add to wishlist');
      return false;
    }

    setError(null);

    try {
      console.log('🚀 [useWishlist] Starting add to wishlist:', packageId);
      
      // Add optimistic update - add to local state immediately
      const optimisticItem = { id: packageId, package_id: packageId };
      setWishlist(prev => {
        // Don't add if already exists
        if (prev.some(item => String(item.id) === String(packageId) || String(item.package_id) === String(packageId))) {
          console.log('⚠️ [useWishlist] Item already in wishlist');
          return prev;
        }
        console.log('✅ [useWishlist] Added to local state optimistically');
        return [...prev, optimisticItem];
      });
      
      // Call the service
      const response = await wishlistService.addToWishlist(packageId);
      console.log('✅ [useWishlist] Service confirmed add:', response);
      
      // Fetch the full wishlist after adding to get complete data with images, etc
      const updatedWishlist = await wishlistService.getWishlist();
      console.log('📦 [useWishlist] Got full updated wishlist:', updatedWishlist.length, 'items');
      
      const wishlistArray = Array.isArray(updatedWishlist) ? updatedWishlist : (updatedWishlist?.data || []);
      const normalizedWishlist = wishlistArray.map(item => ({
        ...item,
        id: item.id || item.package_id
      }));
      setWishlist(normalizedWishlist);
      
      console.log('💾 [useWishlist] Wishlist state updated with complete data');
      return true;
    } catch (err) {
      console.error('❌ [useWishlist] Error adding to wishlist:', err);
      setError(err.message || 'Failed to add to wishlist');
      // Revert optimistic update on error
      setWishlist(prev => {
        const filtered = prev.filter(item => String(item.id) !== String(packageId) && String(item.package_id) !== String(packageId));
        console.log('🔙 [useWishlist] Reverted optimistic update, wishlist now has:', filtered.length, 'items');
        return filtered;
      });
      return false;
    }
  }, [isAuthenticated]);

  /**
   * Remove package from wishlist
   */
  const removeFromWishlist = useCallback(async (packageId) => {
    if (!isAuthenticated) {
      setError('Please log in to manage wishlist');
      return false;
    }

    setError(null);

    try {
      console.log('🚀 [useWishlist] Starting remove from wishlist:', packageId);
      
      // Optimistic update - remove immediately
      setWishlist(prev => {
        const filtered = prev.filter(item => String(item.id) !== String(packageId) && String(item.package_id) !== String(packageId));
        console.log('✅ [useWishlist] Removed from local state optimistically, remaining:', filtered.length);
        return filtered;
      });
      
      // Call the service which now includes verification
      const response = await wishlistService.removeFromWishlist(packageId);
      console.log('✅ [useWishlist] Service confirmed remove:', response);
      
      return true;
    } catch (err) {
      console.error('❌ [useWishlist] Error removing from wishlist:', err);
      setError(err.message || 'Failed to remove from wishlist');
      // Revert on error - refetch wishlist to get accurate state
      console.log('🔙 [useWishlist] Reverting and fetching full wishlist...');
      await fetchWishlist();
      return false;
    }
  }, [isAuthenticated, fetchWishlist]);

  /**
   * Toggle package in wishlist
   */
  const toggleWishlist = useCallback(async (packageId) => {
    if (!isAuthenticated) {
      setError('Please log in to manage wishlist');
      return null;
    }

    setError(null);

    try {
      const result = await wishlistService.toggleWishlist(packageId);
      
      if (result.action === 'added') {
        // Fetch updated wishlist to ensure consistency
        const updatedWishlist = await wishlistService.getWishlist();
        const wishlistArray = Array.isArray(updatedWishlist) ? updatedWishlist : (updatedWishlist?.data || []);
        setWishlist(wishlistArray);
      } else if (result.action === 'removed') {
        setWishlist(prev => 
          prev.filter(item => item.id !== packageId && item.package_id !== packageId)
        );
      }
      
      return result.action;
    } catch (err) {
      setError(err.message || 'Failed to toggle wishlist');
      return null;
    }
  }, [isAuthenticated]);

  /**
   * Check if package is in wishlist
   */
  const isWishlisted = useCallback((packageId) => {
    const result = wishlist.some(item => {
      // Handle both cases: item.id or item.package_id, with string comparison
      return String(item.id) === String(packageId) || String(item.package_id) === String(packageId);
    });
    console.log(`🔍 [useWishlist.isWishlisted] Checking ${packageId}: ${result}, wishlist:`, wishlist);
    return result;
  }, [wishlist]);

  /**
   * Get wishlist count
   */
  const getWishlistCount = useCallback(() => {
    return wishlist.length;
  }, [wishlist]);

  /**
   * Clear entire wishlist
   */
  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please log in to manage wishlist');
      return false;
    }

    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return false;
    }

    setError(null);

    try {
      await wishlistService.clearWishlist();
      setWishlist([]);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to clear wishlist');
      return false;
    }
  }, [isAuthenticated]);

  /**
   * Bulk add packages to wishlist
   */
  const bulkAddToWishlist = useCallback(async (packageIds) => {
    if (!isAuthenticated) {
      setError('Please log in to add to wishlist');
      return false;
    }

    if (!Array.isArray(packageIds) || packageIds.length === 0) {
      setError('No packages to add');
      return false;
    }

    setError(null);

    try {
      const response = await wishlistService.bulkAddToWishlist(packageIds);
      
      setWishlist(prev => {
        const newItems = response.filter(
          item => !prev.some(existing => existing.id === item.id)
        );
        return [...prev, ...newItems];
      });
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to add packages to wishlist');
      return false;
    }
  }, [isAuthenticated]);

  /**
   * Bulk remove packages from wishlist
   */
  const bulkRemoveFromWishlist = useCallback(async (packageIds) => {
    if (!isAuthenticated) {
      setError('Please log in to manage wishlist');
      return false;
    }

    if (!Array.isArray(packageIds) || packageIds.length === 0) {
      setError('No packages to remove');
      return false;
    }

    setError(null);

    try {
      await wishlistService.bulkRemoveFromWishlist(packageIds);
      
      setWishlist(prev => 
        prev.filter(item => !packageIds.includes(item.id))
      );
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to remove packages from wishlist');
      return false;
    }
  }, [isAuthenticated]);

  return {
    // State
    wishlist,
    loading,
    error,
    count: wishlist.length,

    // Methods
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isWishlisted,
    getWishlistCount,
    clearWishlist,
    bulkAddToWishlist,
    bulkRemoveFromWishlist,

    // Utility
    isEmpty: wishlist.length === 0,
    isAuthenticated
  };
};
