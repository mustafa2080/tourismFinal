import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiUsers, FiDollarSign, FiShoppingCart, FiCheck, FiClock, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [revenueChart, setRevenueChart] = useState([]);
  const [bookingChart, setBookingChart] = useState([]);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching dashboard stats for timeRange:', timeRange);

      // استدعاء الـ dashboard stats API الصحيح - من StatsController
      const dashboardStatsRes = await adminService.getDashboardStats(timeRange);
      const revenueTrendRes = await adminService.getRevenueTrend(timeRange);
      const bookingDistributionRes = await adminService.getBookingDistribution();

      console.log('✅ Dashboard stats response:', dashboardStatsRes);
      console.log('✅ Revenue trend response:', revenueTrendRes);
      console.log('✅ Booking distribution response:', bookingDistributionRes);

      if (dashboardStatsRes.success && dashboardStatsRes.data) {
        const stats = dashboardStatsRes.data;
        
        setStatsData({
          totalRevenue: stats.totalRevenue || 0,
          totalBookings: stats.totalBookings || 0,
          activeUsers: stats.activeUsers || 0,
          newUsersThisMonth: stats.newUsersThisMonth || 0,
          conversionRate: stats.conversionRate || 0,
          avgOrderValue: stats.avgOrderValue || 0,
          revenueGrowth: stats.revenueGrowth || 0,
          bookingGrowth: stats.bookingGrowth || 0,
          userGrowth: stats.userGrowth || 0,
          bookingsByStatus: stats.bookingsByStatus || [],
        });

        // استخدام بيانات الـ trend من الـ API بدلاً من البيانات العشوائية
        if (revenueTrendRes.success && revenueTrendRes.data) {
          setRevenueChart(revenueTrendRes.data);
        }

        // استخدام بيانات توزيع الحالات من الـ API
        if (bookingDistributionRes.success && bookingDistributionRes.data) {
          setBookingChart(bookingDistributionRes.data);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, growth, trend = 'up' }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          {growth !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <FiArrowUp className={growth > 0 ? 'text-green-500' : 'text-red-500'} size={16} />
              ) : (
                <FiArrowDown className={growth > 0 ? 'text-red-500' : 'text-green-500'} size={16} />
              )}
              <span className={growth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {Math.abs(growth)}% from last period
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-4 rounded-xl bg-gradient-to-br ${
            title.includes('Revenue') ? 'from-green-500 to-green-600' :
            title.includes('Bookings') ? 'from-blue-500 to-blue-600' :
            title.includes('Users') ? 'from-purple-500 to-purple-600' :
            'from-orange-500 to-orange-600'
          } text-white group-hover:scale-110 transition-transform`}
        >
          <Icon size={28} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Welcome back! Here's your performance summary</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mt-4 md:mt-0">
          {['7days', '30days', '90days'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={FiDollarSign}
            title="Total Revenue"
            value={`$${statsData.totalRevenue?.toLocaleString() || 0}`}
            growth={statsData.revenueGrowth}
            trend="up"
          />
          <StatCard
            icon={FiShoppingCart}
            title="Total Bookings"
            value={statsData.totalBookings?.toLocaleString() || 0}
            growth={Math.abs(statsData.bookingGrowth || 0)}
            trend={statsData.bookingGrowth < 0 ? 'down' : 'up'}
          />
          <StatCard
            icon={FiUsers}
            title="Active Users"
            value={statsData.activeUsers?.toLocaleString() || 0}
            growth={statsData.userGrowth}
            trend="up"
          />
          <StatCard
            icon={FiTrendingUp}
            title="Conversion Rate"
            value={`${statsData.conversionRate?.toFixed(2) || 0}%`}
            subtitle={`Avg: $${statsData.avgOrderValue?.toFixed(2) || 0}`}
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Bookings Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Revenue & Bookings Trend</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">{timeRange}</span>
          </div>
          {revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500">No data available</div>
          )}
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Booking Status</h2>
          {bookingChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, value }) => `${status}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bookingChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500">No data available</div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking Status Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Status Breakdown</h2>
          <div className="space-y-3">
            {bookingChart.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-700 dark:text-slate-300">{item.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({statsData?.totalBookings ? ((item.value / statsData.totalBookings) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Metrics */}
        {statsData && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Key Metrics</h2>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Avg Order Value</span>
                  <span className="font-bold text-slate-900 dark:text-white">${statsData.avgOrderValue?.toFixed(2)}</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Conversion Rate</span>
                  <span className="font-bold text-slate-900 dark:text-white">{statsData.conversionRate?.toFixed(2)}%</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Revenue Growth</span>
                  <span className={`font-bold ${statsData.revenueGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {statsData.revenueGrowth >= 0 ? '+' : ''}{statsData.revenueGrowth?.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">User Growth</span>
                  <span className={`font-bold ${statsData.userGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {statsData.userGrowth >= 0 ? '+' : ''}{statsData.userGrowth?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-2 mb-2">
              <FiCheck className="text-green-600 dark:text-green-400" size={20} />
              <span className="font-semibold text-green-900 dark:text-green-200">Server Status</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">All systems operational</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <FiClock className="text-blue-600 dark:text-blue-400" size={20} />
              <span className="font-semibold text-blue-900 dark:text-blue-200">Response Time</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">~142ms average</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-2 mb-2">
              <FiTrendingUp className="text-purple-600 dark:text-purple-400" size={20} />
              <span className="font-semibold text-purple-900 dark:text-purple-200">Uptime</span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">99.98% this month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
