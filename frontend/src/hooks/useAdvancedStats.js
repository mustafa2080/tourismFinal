import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';

export const useAdvancedStats = () => {
  const [stats, setStats] = useState({
    stats: {
      totalBookings: 0,
      totalSpent: 0,
      upcomingTrips: 0,
      completedTrips: 0,
    },
    distribution: [],
    monthlyChart: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [useAdvancedStats] Fetching advanced stats...');

      const response = await apiClient.get('/dashboard/stats/advanced');

      console.log('📥 [useAdvancedStats] Full Response:', response);
      console.log('📥 [useAdvancedStats] Response type:', typeof response);
      console.log('📥 [useAdvancedStats] Response keys:', response ? Object.keys(response) : 'null');

      // apiClient returns response.data directly, so response should be { success, data: { stats, distribution, monthlyChart } }
      if (response?.success && response?.data) {
        console.log('✅ [useAdvancedStats] Setting stats to:', response.data);
        setStats(response.data);
        console.log('✅ [useAdvancedStats] Stats loaded successfully');
      } else if (response?.stats) {
        // In case response is already the data object
        console.log('✅ [useAdvancedStats] Setting stats directly (alternative format):', response);
        setStats(response);
      } else {
        console.error('❌ [useAdvancedStats] Invalid response format. Got:', response);
        throw new Error('Invalid response format: ' + JSON.stringify(response));
      }
    } catch (err) {
      console.error('❌ [useAdvancedStats] Error:', err);
      setError(err.message || 'Failed to fetch advanced stats');
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refresh = async () => {
    await fetchStats();
    toast.success('Statistics refreshed');
  };

  return {
    stats,
    loading,
    error,
    refresh,
  };
};
