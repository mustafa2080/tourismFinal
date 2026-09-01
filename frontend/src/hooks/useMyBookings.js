import { useState, useEffect } from 'react';
import { bookingsService } from '../services';
import toast from 'react-hot-toast';

/**
 * Custom hook for fetching and managing user's bookings
 */
export const useMyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    upcomingTrips: 0,
    completedTrips: 0
  });

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 [useMyBookings] Fetching bookings...');

        const response = await bookingsService.getUserBookings({ limit: 100 });

        console.log('📥 [useMyBookings] Raw response:', response);

        // Parse the response - API returns { success: true, data: [...], count: N }
        let bookingsData = [];

        if (response?.data) {
          if (Array.isArray(response.data)) {
            bookingsData = response.data;
            console.log('✅ [useMyBookings] Found direct array in response.data');
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            bookingsData = response.data.data;
            console.log('✅ [useMyBookings] Found nested array in response.data.data');
          }
        }

        console.log('✅ [useMyBookings] Parsed bookings count:', bookingsData.length);

        if (bookingsData.length > 0) {
          console.log('📦 [useMyBookings] First booking sample:', {
            id: bookingsData[0].id,
            booking_number: bookingsData[0].booking_number,
            destination: bookingsData[0].package?.destination,
            date_start: bookingsData[0].date_start,
            date_end: bookingsData[0].date_end,
            status: bookingsData[0].status,
            total_price: bookingsData[0].total_price,
            persons: bookingsData[0].persons,
          });
        }

        setBookings(bookingsData);

        // Calculate statistics
        const totalBookings = bookingsData.length;
        const totalSpent = bookingsData.reduce((sum, b) => {
          const price = Number(b.total_price) || 0;
          return sum + price;
        }, 0);

        const upcomingTrips = bookingsData.filter(b => {
          const tripDate = new Date(b.date_start || b.trip_start_date);
          return tripDate > new Date() && b.status !== 'cancelled';
        }).length;

        const completedTrips = bookingsData.filter(b => b.status === 'completed').length;

        console.log('📊 [useMyBookings] Stats:', { totalBookings, totalSpent, upcomingTrips, completedTrips });

        setStats({
          totalBookings,
          totalSpent,
          upcomingTrips,
          completedTrips
        });
      } catch (err) {
        console.error('❌ [useMyBookings] Error:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
        });
        setError(err.message || 'Failed to fetch bookings');
        toast.error('Failed to load bookings');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Refresh bookings
  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingsService.getUserBookings({ limit: 100 });

      let bookingsData = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          bookingsData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          bookingsData = response.data.data;
        }
      }

      setBookings(bookingsData);
      toast.success('Bookings refreshed');
    } catch (err) {
      console.error('Error refreshing bookings:', err);
      setError(err.message || 'Failed to refresh bookings');
      toast.error('Failed to refresh bookings');
    } finally {
      setLoading(false);
    }
  };

  // Cancel booking
  const cancelBooking = async (bookingId, reason = '') => {
    try {
      await bookingsService.cancelBooking(bookingId, { reason });
      
      // Update local state
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );
      
      toast.success('Booking cancelled successfully');
      return true;
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error(err.message || 'Failed to cancel booking');
      return false;
    }
  };

  // Download invoice
  const downloadInvoice = async (bookingId, bookingNumber) => {
    try {
      await bookingsService.downloadBookingInvoice(
        bookingId,
        `invoice-${bookingNumber}.pdf`
      );
      toast.success('Invoice downloaded');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      toast.error('Failed to download invoice');
    }
  };

  return {
    bookings,
    loading,
    error,
    stats,
    refresh,
    cancelBooking,
    downloadInvoice
  };
};
