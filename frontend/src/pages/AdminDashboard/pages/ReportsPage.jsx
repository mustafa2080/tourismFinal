import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { FiCalendar, FiTrendingUp, FiDownload, FiRefreshCw, FiUsers, FiShoppingCart, FiDollarSign, FiTrendingDown } from 'react-icons/fi';
import { MdOutlineAssessment, MdOutlineShowChart } from 'react-icons/md';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

export function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const [revenueData, setRevenueData] = useState(null);
  const [topPackages, setTopPackages] = useState([]);
  const [customerStats, setCustomerStats] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);

  // Define fetchReportsData with useCallback to memoize it
  const fetchReportsData = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      console.log('🔄 [ReportsPage] Fetching reports data for period:', { startDate, endDate });

      const [revenueRes, packagesRes, customersRes, bookingsRes] = await Promise.all([
        adminService.getRevenueReport(startDate, endDate).catch(e => {
          console.error('❌ Revenue error:', e);
          toast.error('Failed to load revenue report');
          return { success: false, data: null };
        }),
        adminService.getTopPackages(10).catch(e => {
          console.error('❌ Packages error:', e);
          return { success: false, data: [] };
        }),
        adminService.getCustomerStats().catch(e => {
          console.error('❌ Customers error:', e);
          toast.error('Failed to load customer stats');
          return { success: false, data: null };
        }),
        adminService.getBookingStats().catch(e => {
          console.error('❌ Bookings error:', e);
          return { success: false, data: null };
        }),
      ]);

      console.log('📊 [ReportsPage] All responses received:', {
        revenue: { success: revenueRes?.success, hasData: !!revenueRes?.data },
        packages: { success: packagesRes?.success, count: packagesRes?.data?.length },
        customers: { success: customersRes?.success, hasData: !!customersRes?.data },
        bookings: { success: bookingsRes?.success, hasData: !!bookingsRes?.data },
      });

      // Handle revenue data
      if (revenueRes?.success && revenueRes?.data) {
        console.log('💰 Revenue data set:', revenueRes.data);
        setRevenueData(revenueRes.data);
        if (revenueRes.data?.dailyRevenue) {
          const series = Object.entries(revenueRes.data.dailyRevenue || {}).map(([date, value]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: Math.round(value),
          }));
          setTimeSeriesData(series.slice(-14));
        }
      } else {
        console.warn('⚠️ Revenue data failed');
      }

      // Handle packages data
      if (packagesRes?.success && Array.isArray(packagesRes?.data)) {
        console.log('📦 Packages data set:', packagesRes.data?.length, 'items');
        const formattedPackages = packagesRes.data.map(pkg => ({
          name: pkg.packageName?.substring(0, 18) || `Tour ${pkg.packageId?.slice(0, 8)}`,
          value: parseInt(pkg.bookingCount),
          revenue: Math.round(parseFloat(pkg.revenue) || 0),
        }));
        setTopPackages(formattedPackages);
      }

      // Handle customer stats
      if (customersRes?.success && customersRes?.data) {
        console.log('👥 Customer stats set:', customersRes.data);
        setCustomerStats(customersRes.data);
      } else {
        console.warn('⚠️ Customer stats failed');
      }

      // Handle booking stats
      if (bookingsRes?.success && bookingsRes?.data) {
        console.log('📋 Booking stats set:', bookingsRes.data);
        setBookingStats(bookingsRes.data);
      } else {
        console.warn('⚠️ Booking stats failed');
      }
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate]);

  // useEffect now calls the memoized function
  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData, startDate, endDate]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#6366F1'];
  const STATUS_COLORS = {
    'pending': '#F59E0B',
    'confirmed': '#3B82F6',
    'completed': '#10B981',
    'cancelled': '#EF4444'
  };

  const bookingDistribution = bookingStats ? [
    { name: 'Pending', value: bookingStats.pending || 0, color: STATUS_COLORS.pending },
    { name: 'Confirmed', value: bookingStats.confirmed || 0, color: STATUS_COLORS.confirmed },
    { name: 'Completed', value: bookingStats.completed || 0, color: STATUS_COLORS.completed },
    { name: 'Cancelled', value: bookingStats.cancelled || 0, color: STATUS_COLORS.cancelled },
  ].filter(item => item.value > 0) : [];

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchReportsData();
  };

  const handleExport = () => {
    try {
      const reportData = {
        period: { startDate, endDate },
        revenue: revenueData,
        topPackages,
        customers: customerStats,
        bookings: bookingStats,
        generated: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const MetricCard = ({ icon: Icon, label, value, change, color, bgGradient }) => (
    <div className={`${bgGradient} rounded-xl shadow-lg p-6 text-white border border-opacity-20 group hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium mb-2">{label}</p>
          <p className="text-4xl font-bold tracking-tight">{value}</p>
          {change !== undefined && change !== null && (
            <p className={`text-white/70 text-xs font-medium mt-3 flex items-center gap-1`}>
              {change >= 0 ? (
                <FiTrendingUp className="text-green-300" size={14} />
              ) : (
                <FiTrendingDown className="text-red-300" size={14} />
              )}
              {Math.abs(change)}% {change >= 0 ? 'increase' : 'decrease'}
            </p>
          )}
        </div>
        <div className="text-white/20 group-hover:text-white/30 transition-all">
          <Icon size={48} className="drop-shadow-lg" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <MdOutlineAssessment className="text-white" size={32} />
            </div>
            Reports & Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
            Real-time insights into your tour business performance
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
          >
            <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={18} />
            {refreshing ? 'Refreshing' : 'Refresh'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-900 dark:text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            <FiDownload size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-6 items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FiCalendar className="text-blue-600 dark:text-blue-400" size={18} />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FiCalendar className="text-blue-600 dark:text-blue-400" size={18} />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {revenueData ? (
            <>
              <MetricCard
                icon={FiDollarSign}
                label="Total Revenue"
                value={`$${(revenueData.totalRevenue / 1000).toFixed(1)}K`}
                change={revenueData.growthRate}
                bgGradient="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600"
              />
              <MetricCard
                icon={FiShoppingCart}
                label="Total Bookings"
                value={revenueData.totalBookings || 0}
                bgGradient="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600"
              />
              <MetricCard
                icon={FiTrendingUp}
                label="Avg Booking Value"
                value={`$${revenueData.averageBookingValue?.toFixed(0) || 0}`}
                bgGradient="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600"
              />
            </>
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                ❌ Revenue data not available
              </p>
            </div>
          )}
          <MetricCard
            icon={FiUsers}
            label="Total Customers"
            value={customerStats?.totalCustomers || 0}
            change={customerStats?.totalCustomers > 0 ? Math.round((customerStats?.newCustomersThisMonth || 0) / customerStats.totalCustomers * 100) : 0}
            bgGradient="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600"
          />
        </div>
      )}

      {/* Debug Info - Remove in production */}
      {loading && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⏳ Loading reports data... Please wait.
          </p>
        </div>
      )}

      {/* Charts Grid */}
      {!loading ? (
        <>
          {/* Primary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trend - Larger */}
            {timeSeriesData.length > 0 && (
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <MdOutlineShowChart className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    Revenue Trend
                  </h2>
                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                    Last {timeSeriesData.length} days
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '2px solid #3B82F6', 
                          borderRadius: '8px', 
                          color: '#fff',
                          padding: '12px'
                        }} 
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Booking Status Distribution */}
            {bookingDistribution.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <FiShoppingCart className="text-orange-600 dark:text-orange-400" size={24} />
                  </div>
                  Booking Status
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} (${value})`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bookingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '2px solid #3B82F6', 
                          borderRadius: '8px', 
                          color: '#fff'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Top Packages Chart */}
          {topPackages.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FiTrendingUp className="text-green-600 dark:text-green-400" size={24} />
                </div>
                Top Tours by Revenue
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={topPackages}
                    margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={120}
                      style={{ fontSize: '11px' }}
                      stroke="#94a3b8"
                    />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '2px solid #3B82F6', 
                        borderRadius: '8px', 
                        color: '#fff',
                        padding: '12px'
                      }} 
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10B981" name="Revenue ($)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Customer Insights & Stats */}
          {customerStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Total Customers</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{customerStats.totalCustomers || 0}</p>
                  </div>
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <FiUsers className="text-blue-600 dark:text-blue-400" size={32} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Active Customers</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{customerStats.customersWithBookings || 0}</p>
                  </div>
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <FiShoppingCart className="text-green-600 dark:text-green-400" size={32} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">New This Month</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{customerStats.newCustomersThisMonth || 0}</p>
                  </div>
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <FiUsers className="text-purple-600 dark:text-purple-400" size={32} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Return Rate</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{customerStats.returnRate || 0}%</p>
                  </div>
                  <div className="p-4 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
                    <FiTrendingUp className="text-cyan-600 dark:text-cyan-400" size={32} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Performance Stats */}
          {bookingStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Completion Rate</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{bookingStats.completionRate || 0}%</p>
                  </div>
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <FiTrendingUp className="text-green-600 dark:text-green-400" size={32} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Cancellation Rate</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{bookingStats.cancellationRate || 0}%</p>
                  </div>
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <FiTrendingDown className="text-red-600 dark:text-red-400" size={32} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Total Bookings</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{bookingStats.total || 0}</p>
                  </div>
                  <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <FiShoppingCart className="text-indigo-600 dark:text-indigo-400" size={32} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400"></div>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">Loading reports...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
