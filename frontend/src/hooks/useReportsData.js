import { useState, useCallback, useEffect } from 'react';
import adminService from '../services/adminService';

export const useReportsData = (startDate, endDate) => {
  const [data, setData] = useState({
    revenue: null,
    topPackages: [],
    customers: null,
    bookings: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const [revenueRes, packagesRes, customersRes, bookingsRes] = await Promise.all([
        adminService.getRevenueReport(startDate, endDate),
        adminService.getTopPackages(10),
        adminService.getCustomerStats(),
        adminService.getBookingStats(),
      ]);

      setData({
        revenue: revenueRes?.data || null,
        topPackages: packagesRes?.data || [],
        customers: customersRes?.data || null,
        bookings: bookingsRes?.data || null,
      });
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError(err.message || 'Failed to fetch reports data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, fetchData]);

  return {
    data,
    loading,
    error,
    refreshing,
    refresh: fetchData,
  };
};
