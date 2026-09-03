import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { wishlistService } from '../services';
import { useAuth } from '../hooks/useAuth';
import { socketService } from '../services/socketService';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [synced, setSynced] = useState(false);
  const syncWishlistDataRef = useRef(null);

  /**
   * Sync wishlist with full data
   */
  const syncWishlistData = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    try {
      console.log('🔄 [WishlistContext.syncWishlistData] Starting sync...');
      const response = await wishlistService.getWishlist();
      const wishlistArray = Array.isArray(response) ? response : (response?.data || []);
      
      // Normalize wishlist data - ensure every item has an id field
      const normalizedWishlist = wishlistArray.map(item => ({
        ...item,
        id: item.id || item.package_id,
      }));
      
      console.log('✅ [WishlistContext.syncWishlistData] Synced successfully, items:', normalizedWishlist.length);
      console.log('📦 [WishlistContext.syncWishlistData] Items:', normalizedWishlist.map(w => ({
        id: w.id,
        title: w.title,
        images: w.images?.length || 0
      })));
      
      setWishlist(normalizedWishlist);
    } catch (err) {
      console.error('❌ [WishlistContext.syncWishlistData] Failed to sync wishlist:', err);
      setError(err.message || 'Failed to sync wishlist');
    }
  }, [isAuthenticated]);

  // Keep a stable ref to the latest syncWishlistData so the socket listener
  // (set up once per connection) always calls the current version.
  useEffect(() => {
    syncWishlistDataRef.current = syncWishlistData;
  }, [syncWishlistData]);

  // 🔔 Realtime sync: listen for wishlist:updated events from the server so
  // that other open tabs/devices for the same user stay in sync (e.g. an
  // item removed on the phone disappears from the desktop tab too).
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return undefined;

    const socket = socketService?.getSocket?.();
    if (!socket) return undefined;

    let mounted = true;

    const subscribe = () => {
      socket.emit('subscribe:user', user.id);
    };

    const handleWishlistUpdate = (payload) => {
      if (!mounted) return;
      console.log('🔄 [WishlistContext] Realtime wishlist:updated received:', payload);
      syncWishlistDataRef.current?.();
    };

    // Subscribe immediately if already connected, and re-subscribe on every
    // (re)connect since the server-side room membership doesn't survive a
    // reconnect.
    if (socket.connected) subscribe();
    socket.on('connect', subscribe);
    socket.on('wishlist:updated', handleWishlistUpdate);

    return () => {
      mounted = false;
      socket.off('connect', subscribe);
      socket.off('wishlist:updated', handleWishlistUpdate);
    };
  }, [isAuthenticated, user?.id]);

  // Auto-fetch wishlist when auth status changes
  useEffect(() => {
    // Prevent duplicate sync
    if (!isAuthenticated && synced) {
      setSynced(false);
      setWishlist([]);
      return;
    }

    if (isAuthenticated && !synced) {
      syncWishlistData();
      setSynced(true);
    }
  }, [isAuthenticated, synced, syncWishlistData]);

  /**
   * Add package to wishlist
   */
  const addToWishlist = useCallback(async (packageId) => {
    try {
      console.log('❤️ [WishlistContext] Adding package to wishlist:', packageId);
      
      const response = await wishlistService.addToWishlist(packageId);
      console.log('✅ [WishlistContext] Response from service:', response);
      
      // Sync full wishlist to get complete data with images
      console.log('🔄 [WishlistContext] Syncing full wishlist...');
      await syncWishlistData();
      
      return true;
    } catch (err) {
      console.error('❌ [WishlistContext] Error adding to wishlist:', err);
      setError(err.message || 'Failed to add to wishlist');
      return false;
    }
  }, [syncWishlistData]);

  /**
   * Remove package from wishlist
   */
  const removeFromWishlist = useCallback(async (packageId) => {
    // Keep a snapshot so we can roll back if the server delete actually fails
    let previousWishlist = [];

    try {
      console.log('🗑️ [WishlistContext] Removing package from wishlist:', packageId);

      // Optimistic update - remove immediately for better UX
      setWishlist(prev => {
        previousWishlist = prev;
        const filtered = prev.filter(item => item.id !== packageId && item.package_id !== packageId);
        console.log('✅ [WishlistContext] Local state updated, remaining items:', filtered.length);
        return filtered;
      });

      // Call service - this now correctly throws on 404/failure instead of
      // silently resolving, so the catch block below can roll back the UI.
      await wishlistService.removeFromWishlist(packageId);

      console.log('✅ [WishlistContext] Successfully removed from database');
      return true;
    } catch (err) {
      console.error('❌ [WishlistContext] Error removing from wishlist:', err);
      setError(err.message || 'Failed to remove from wishlist');
      // Roll back optimistic update, then re-sync with the server to be sure
      setWishlist(previousWishlist);
      await syncWishlistData();
      return false;
    }
  }, [syncWishlistData]);

  /**
   * Toggle package in wishlist
   */
  const toggleWishlist = useCallback(async (packageId) => {
    try {
      const result = await wishlistService.toggleWishlist(packageId);
      
      // Fetch full wishlist to get complete data
      await syncWishlistData();
      
      return result.action;
    } catch (err) {
      console.error('❌ [WishlistContext] Error toggling wishlist:', err);
      setError(err.message || 'Failed to toggle wishlist');
      return null;
    }
  }, [syncWishlistData]);

  /**
   * Check if package is in wishlist
   */
  const isWishlisted = useCallback((packageId) => {
    // Handle both string and number IDs, and both id and package_id fields
    return wishlist.some(item => {
      return String(item.id) === String(packageId) || String(item.package_id) === String(packageId);
    });
  }, [wishlist]);

  /**
   * Clear entire wishlist
   */
  const clearWishlist = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return false;
    }

    try {
      await wishlistService.clearWishlist();
      setWishlist([]);
      return true;
    } catch (err) {
      console.error('❌ [WishlistContext] Error clearing wishlist:', err);
      setError(err.message || 'Failed to clear wishlist');
      return false;
    }
  }, []);

  const value = {
    // State
    wishlist,
    loading,
    error,
    count: wishlist.length,

    // Methods
    syncWishlistData,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isWishlisted,
    clearWishlist,

    // Utility
    isEmpty: wishlist.length === 0,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
