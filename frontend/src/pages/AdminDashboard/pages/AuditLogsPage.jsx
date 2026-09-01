import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiEye, FiX, FiCalendar, FiActivity, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import { MdOutlineHistory, MdOutlineLogout } from 'react-icons/md';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ limit: 50, offset: 0, total: 0 });

  const actionTypes = [
    'BAN_USER',
    'APPROVE_REVIEW',
    'REJECT_REVIEW',
    'UPDATE_BOOKING',
    'CANCEL_BOOKING',
    'PROCESS_REFUND',
    'APPROVE_REFUND',
    'REJECT_REFUND',
    'DELETE_REVIEW',
    'UPDATE_PACKAGE',
  ];

  useEffect(() => {
    fetchLogs();
  }, [pagination.offset, filterAction]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAuditLogs(pagination.limit, pagination.offset);
      
      if (response.success) {
        let filteredData = response.data || [];
        
        if (filterAction !== 'all') {
          filteredData = filteredData.filter(log => log.action === filterAction);
        }

        if (searchTerm) {
          filteredData = filteredData.filter(log =>
            log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.target?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.actor_id?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setLogs(filteredData);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const getActionColor = (action) => {
    if (action?.includes('BAN') || action?.includes('REJECT') || action?.includes('DELETE')) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-300 dark:border-red-700';
    } else if (action?.includes('APPROVE')) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-300 dark:border-green-700';
    } else if (action?.includes('PROCESS') || action?.includes('UPDATE')) {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-300 dark:border-blue-700';
    } else if (action?.includes('CANCEL')) {
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-300 dark:border-orange-700';
    }
    return 'bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700';
  };

  const getActionDisplayName = (action) => {
    const actionMap = {
      'BAN_USER': 'Ban User',
      'APPROVE_REVIEW': 'Approve Review',
      'REJECT_REVIEW': 'Reject Review',
      'UPDATE_BOOKING': 'Update Booking',
      'CANCEL_BOOKING': 'Cancel Booking',
      'PROCESS_REFUND': 'Process Refund',
      'APPROVE_REFUND': 'Approve Refund',
      'REJECT_REFUND': 'Reject Refund',
      'DELETE_REVIEW': 'Delete Review',
      'UPDATE_PACKAGE': 'Update Tour',
    };
    return actionMap[action] || action;
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white border border-opacity-20 group hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-2">{label}</p>
          <p className="text-4xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="text-white/20 group-hover:text-white/30 transition-all">
          <Icon size={40} />
        </div>
      </div>
    </div>
  );

  const totalActions = logs.length;
  const approvalActions = logs.filter(l => l.action?.includes('APPROVE')).length;
  const rejectionActions = logs.filter(l => l.action?.includes('REJECT') || l.action?.includes('DELETE')).length;
  const updateActions = logs.filter(l => l.action?.includes('UPDATE') || l.action?.includes('PROCESS')).length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg">
              <MdOutlineHistory className="text-white" size={32} />
            </div>
            Audit Logs
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
            Monitor all administrative actions and system changes
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiActivity}
          label="Total Actions"
          value={totalActions}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Approvals"
          value={approvalActions}
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          icon={FiBarChart2}
          label="Rejections"
          value={rejectionActions}
          color="from-red-500 to-red-600"
        />
        <StatCard
          icon={FiCalendar}
          label="Updates"
          value={updateActions}
          color="from-purple-500 to-pink-600"
        />
      </div>

      {/* Search and Filter Section */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search action, target, or admin ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <FiFilter className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setPagination(p => ({ ...p, offset: 0 }));
              }}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
            >
              <option value="all">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>
                  {getActionDisplayName(action)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400"></div>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">Loading audit logs...</p>
            </div>
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-b-2 border-slate-300 dark:border-slate-600">
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Target</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Admin</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Date & Time</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900 dark:text-white">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {logs.map((log, index) => (
                  <tr
                    key={log.id}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-block px-4 py-2 rounded-lg text-xs font-bold border-2 ${getActionColor(log.action)}`}>
                        {getActionDisplayName(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {log.target}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold">
                        {log.actor_id?.slice(0, 12)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <div>
                        <p className="font-medium">{new Date(log.created_at).toLocaleDateString('en-US')}</p>
                        <p className="text-xs text-slate-500">{new Date(log.created_at).toLocaleTimeString('en-US')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewLog(log)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-110"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <MdOutlineHistory className="text-blue-600 dark:text-blue-400" size={40} />
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">No audit logs found</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && logs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Showing <span className="text-slate-900 dark:text-white font-bold">{pagination.offset + 1}</span> to <span className="text-slate-900 dark:text-white font-bold">{Math.min(pagination.offset + pagination.limit, pagination.total)}</span> of <span className="text-slate-900 dark:text-white font-bold">{pagination.total}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPagination(p => ({ ...p, offset: Math.max(0, p.offset - p.limit) }))}
              disabled={pagination.offset === 0}
              className="px-6 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(p => ({ ...p, offset: p.offset + p.limit }))}
              disabled={pagination.offset + pagination.limit >= pagination.total}
              className="px-6 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in scale-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <MdOutlineHistory size={24} />
                </div>
                <h2 className="text-2xl font-bold">Action Log Details</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6 max-h-96 overflow-y-auto">
              {/* Action & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Action Type</p>
                  <span className={`inline-block px-3 py-2 rounded-lg text-sm font-bold border-2 ${getActionColor(selectedLog.action)}`}>
                    {getActionDisplayName(selectedLog.action)}
                  </span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Target</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedLog.target}</p>
                </div>
              </div>

              {/* Admin Information */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-3">Admin Information</p>
                <div className="space-y-2">
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">Admin ID:</span>
                  </p>
                  <p className="font-mono text-sm bg-white dark:bg-slate-800 rounded-lg p-3 text-slate-900 dark:text-white break-all">
                    {selectedLog.actor_id}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide mb-3">Timestamp</p>
                <div className="space-y-2">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {new Date(selectedLog.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    {new Date(selectedLog.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Additional Data */}
              {selectedLog.payload && Object.keys(selectedLog.payload).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Additional Data</p>
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-6 border border-slate-700 dark:border-slate-800">
                    <pre className="text-slate-200 text-xs font-mono overflow-auto max-h-48">
                      {JSON.stringify(selectedLog.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogsPage;