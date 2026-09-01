import { useState, useEffect } from 'react';
import { FiFilter, FiEye, FiX, FiCheckCircle, FiXCircle, FiDollarSign, FiClock, FiTrendingUp, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { MdOutlineSettingsBackupRestore, MdOutlineAssignmentReturn } from 'react-icons/md';
import useRefund from '../../../hooks/useRefund';
import refundService from '../../../services/refundService';
import toast from 'react-hot-toast';

export function RefundsPage() {
  const {
    refunds,
    stats,
    loading,
    approveRefund,
    rejectRefund,
    fetchRefunds,
    fetchStats,
    calculatePolicy,
    checkSpecialCases
  } = useRefund();

  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  useEffect(() => {
    fetchRefunds(pagination.limit, pagination.offset);
    fetchStats();
  }, [pagination.offset, pagination.limit, filterStatus]);

  const handleViewRefund = (refund) => {
    setSelectedRefund(refund);
    setShowModal(true);
  };

  const handleApproveRefund = async () => {
    if (!selectedRefund) return;
    
    if (window.confirm('Are you sure you want to approve this refund?')) {
      try {
        await approveRefund(
          selectedRefund.id,
          selectedRefund.amount,
          selectedRefund.reason,
          approvalNotes
        );
        setShowModal(false);
        setApprovalNotes('');
      } catch (error) {
        console.error('Error approving refund:', error);
      }
    }
  };

  const handleRejectRefund = async () => {
    if (!selectedRefund) return;

    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    if (window.confirm('Are you sure you want to reject this refund?')) {
      try {
        await rejectRefund(selectedRefund.id, rejectReason);
        setShowModal(false);
        setRejectReason('');
      } catch (error) {
        console.error('Error rejecting refund:', error);
      }
    }
  };

  const filteredRefunds = refunds.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchSearch = !searchTerm || 
      r.booking?.booking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.booking?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.booking?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-300 dark:border-orange-700',
      'approved': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-300 dark:border-green-700',
      'rejected': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-300 dark:border-red-700',
      'processed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-300 dark:border-blue-700',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': '⏳ Pending',
      'approved': '✅ Approved',
      'rejected': '❌ Rejected',
      'processed': '🎉 Processed',
    };
    return texts[status] || status;
  };

  const getPaymentTypeIcon = (type) => {
    const icons = {
      'on_arrival': '💵 Pay on Arrival',
      'deposit': '📦 Deposit (30%)',
      'full_payment': '💳 Full Payment',
    };
    return icons[type] || type;
  };

  const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white border border-opacity-20 group hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium mb-2">{label}</p>
          <p className="text-4xl font-bold tracking-tight">{value}</p>
          {subtext && <p className="text-white/70 text-xs font-medium mt-2">{subtext}</p>}
        </div>
        <div className="text-white/20 group-hover:text-white/30 transition-all">
          <Icon size={40} />
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
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
              <MdOutlineSettingsBackupRestore className="text-white" size={32} />
            </div>
            Refunds Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
            Process and manage refund requests with intelligent policy calculations
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={MdOutlineAssignmentReturn}
            label="Total Requests"
            value={stats.totalRefunds || 0}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={FiClock}
            label="Pending"
            value={stats.pendingRefunds || 0}
            color="from-orange-500 to-orange-600"
          />
          <StatCard
            icon={FiDollarSign}
            label="Total Amount"
            value={`$${(stats.totalAmount || 0).toLocaleString()}`}
            color="from-green-500 to-emerald-600"
          />
          <StatCard
            icon={FiTrendingUp}
            label="Approval Rate"
            value={`${stats.approvalRate ? stats.approvalRate : 0}%`}
            color="from-purple-500 to-pink-600"
          />
        </div>
      )}

      {/* Search & Filter Section */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search by booking #, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(p => ({ ...p, offset: 0 }));
              }}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
            >
              <option value="all">All Requests</option>
              <option value="pending">⏳ Pending</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
              <option value="processed">🎉 Processed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Refunds List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-96 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400"></div>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium">Loading refunds...</p>
            </div>
          </div>
        ) : filteredRefunds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-b-2 border-slate-300 dark:border-slate-600">
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Booking #</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Payment Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Request Date</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900 dark:text-white">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredRefunds.map((refund) => (
                  <tr
                    key={refund.id}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold">
                        #{refund.booking?.booking_number || `BK-${refund.booking_id?.slice(0, 8)}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {refund.booking?.user?.name || '-'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {refund.booking?.user?.email || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${parseFloat(refund.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {getPaymentTypeIcon(refund.booking?.payment_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-4 py-2 rounded-lg text-xs font-bold border-2 ${getStatusColor(refund.status)}`}>
                        {getStatusText(refund.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(refund.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewRefund(refund)}
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <MdOutlineSettingsBackupRestore className="text-blue-600 dark:text-blue-400" size={40} />
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">No refund requests found</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Refund Details Modal */}
      {showModal && selectedRefund && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in scale-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 bg-gradient-to-r from-red-600 to-orange-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <MdOutlineSettingsBackupRestore size={24} />
                </div>
                <h2 className="text-2xl font-bold">Refund Details</h2>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectReason('');
                  setApprovalNotes('');
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6 max-h-96 overflow-y-auto">
              {/* Refund ID & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Booking #</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    #{selectedRefund.booking?.booking_number}
                  </p>
                </div>
                <div className={`rounded-xl p-6 border-2 ${getStatusColor(selectedRefund.status)} flex flex-col items-center justify-center`}>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2">Status</p>
                  <p className="text-2xl font-bold">{getStatusText(selectedRefund.status)}</p>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">User Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Full Name</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {selectedRefund.booking?.user?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {selectedRefund.booking?.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Refund Amount & Payment Type */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Refund Amount</h3>
                <div className="space-y-3">
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    ${parseFloat(selectedRefund.amount).toLocaleString()}
                  </p>
                  <div className="text-sm">
                    <p className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">Payment Type:</span> {getPaymentTypeIcon(selectedRefund.booking?.payment_type)}
                    </p>
                    {selectedRefund.booking?.payment_type === 'on_arrival' && (
                      <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/30 rounded border border-orange-300 dark:border-orange-700">
                        <p className="text-orange-800 dark:text-orange-300 text-sm">
                          ⚠️ Pay on Arrival - No payment received yet. Canceling will prevent payment collection.
                        </p>
                      </div>
                    )}
                    {selectedRefund.booking?.payment_type === 'deposit' && (
                      <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded border border-blue-300 dark:border-blue-700">
                        <p className="text-blue-800 dark:text-blue-300 text-sm">
                          ℹ️ Deposit payment (30%). Refund will return the deposit amount only after fees.
                        </p>
                      </div>
                    )}
                    {selectedRefund.booking?.payment_type === 'full_payment' && (
                      <div className="mt-3 p-3 bg-purple-100 dark:bg-purple-900/30 rounded border border-purple-300 dark:border-purple-700">
                        <p className="text-purple-800 dark:text-purple-300 text-sm">
                          ℹ️ Full payment received. Refund will be processed to original payment method after fees.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Refund Reason */}
              {selectedRefund.reason && (
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Refund Reason</h3>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-l-4 border-orange-600">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      "{selectedRefund.reason}"
                    </p>
                  </div>
                </div>
              )}

              {/* Action Fields for Pending Refunds */}
              {selectedRefund.status === 'pending' && (
                <>
                  {/* Approval Notes */}
                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-2">
                      Approval Notes (Optional)
                    </label>
                    <textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder="Add any notes about this refund..."
                      className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      rows="3"
                    />
                  </div>

                  {/* Rejection Reason */}
                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Provide reason for rejection..."
                      className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </>
              )}

              {/* Request Date */}
              <div className="text-sm text-slate-600 dark:text-slate-400 pt-2">
                Request submitted on <span className="font-bold text-slate-900 dark:text-white">{new Date(selectedRefund.created_at).toLocaleString('en-US')}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-4 p-8 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
              {selectedRefund.status === 'pending' ? (
                <>
                  <button
                    onClick={handleApproveRefund}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FiCheckCircle size={20} />
                    Approve Refund
                  </button>
                  <button
                    onClick={handleRejectRefund}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FiXCircle size={20} />
                    Reject Refund
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowModal(false);
                    setRejectReason('');
                    setApprovalNotes('');
                  }}
                  className="w-full px-6 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-bold"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RefundsPage;
