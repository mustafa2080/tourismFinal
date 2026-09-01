/**
 * Analytics and Reports Helper Functions
 */

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value) => {
  return `${Math.round(value)}%`;
};

export const calculateGrowthRate = (current, previous) => {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const getDateRange = (days = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

export const formatRevenueData = (dailyData = {}) => {
  return Object.entries(dailyData).map(([date, revenue]) => ({
    date: new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    revenue: Math.round(revenue),
  }));
};

export const getStatusColor = (status) => {
  const colors = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    completed: '#10B981',
    cancelled: '#EF4444',
  };
  return colors[status?.toLowerCase()] || '#6B7280';
};

export const getMetricTrend = (current, previous) => {
  if (!previous) return null;
  const change = ((current - previous) / previous) * 100;
  return {
    value: change,
    direction: change >= 0 ? 'up' : 'down',
    formatted: `${Math.abs(Math.round(change))}%`,
  };
};

export const aggregateBookingsByStatus = (bookingStats) => {
  if (!bookingStats) return [];

  return [
    { name: 'Pending', value: bookingStats.pending || 0, color: '#F59E0B' },
    { name: 'Confirmed', value: bookingStats.confirmed || 0, color: '#3B82F6' },
    { name: 'Completed', value: bookingStats.completed || 0, color: '#10B981' },
    { name: 'Cancelled', value: bookingStats.cancelled || 0, color: '#EF4444' },
  ].filter(item => item.value > 0);
};

export const generateMonthlyReport = (revenueData) => {
  const months = {};

  Object.entries(revenueData || {}).forEach(([date, revenue]) => {
    const monthKey = date.substring(0, 7); // YYYY-MM

    if (!months[monthKey]) {
      months[monthKey] = 0;
    }
    months[monthKey] += revenue;
  });

  return Object.entries(months)
    .map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const calculateKPIs = (revenueData, bookingStats, customerStats) => {
  const totalRevenue = revenueData?.totalRevenue || 0;
  const totalBookings = revenueData?.totalBookings || 0;
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const completionRate = bookingStats?.completionRate || 0;
  const totalCustomers = customerStats?.totalCustomers || 0;

  return {
    totalRevenue,
    totalBookings,
    avgBookingValue,
    completionRate,
    totalCustomers,
    revenuePerCustomer: totalCustomers > 0 ? totalRevenue / totalCustomers : 0,
  };
};

export const exportReportAsJSON = (reportData, fileName = 'report.json') => {
  const dataStr = JSON.stringify(reportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportReportAsCSV = (data, fileName = 'report.csv') => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

const convertToCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map(row => headers.map(field => row[field]).join(','))];

  return csv.join('\n');
};

export const getDateRangeLabel = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return `${start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} - ${end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
};
