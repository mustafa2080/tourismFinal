import { useState, useEffect } from 'react';
import { 
  FiMail, FiClock, FiUser, FiPhone, FiCheckCircle, FiAlertCircle, 
  FiMessageSquare, FiTrash2, FiRefreshCw, FiX, FiArrowRight,
  FiSearch, FiFilter, FiDownload
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../../../services/apiClient';
import '../../../styles/pages/contact-admin.css';
import '../../../styles/pages/contact-admin-advanced.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0
  });

  // جلب الرسائل
  const fetchMessages = async (status = 'pending', limit = 20, offset = 0) => {
    setLoading(true);
    try {
      const endpoint = status === 'all' 
        ? `/admin/contact?limit=${limit}&offset=${offset}`
        : `/admin/contact/status/${status}?limit=${limit}&offset=${offset}`;

      const response = await apiClient.get(endpoint);

      setMessages(response.data || []);
      setPagination(response.pagination || {
        limit,
        offset,
        total: (response.data || []).length
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(filterStatus);
  }, [filterStatus]);

  // تحديث حالة الرسالة
  const updateMessageStatus = async (id, newStatus) => {
    try {
      await apiClient.put(
        `/admin/contact/${id}/status`,
        { 
          status: newStatus,
          adminNotes: adminNotes || undefined
        }
      );

      toast.success(`Message marked as ${newStatus}`);
      setAdminNotes('');
      setSelectedMessage(null);
      fetchMessages(filterStatus);
    } catch (error) {
      console.error('Error updating message status:', error);
      toast.error('Failed to update message status');
    }
  };

  // حذف الرسالة
  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await apiClient.delete(`/admin/contact/${id}`);

      toast.success('Message deleted');
      fetchMessages(filterStatus);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-700 dark:from-amber-900/30 dark:to-amber-900/20 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30';
      case 'read':
        return 'bg-gradient-to-br from-teal-50 to-teal-100/50 text-teal-700 dark:from-teal-900/30 dark:to-teal-900/20 dark:text-teal-300 border border-teal-200 dark:border-teal-800/30';
      case 'responded':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-700 dark:from-emerald-900/30 dark:to-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiAlertCircle className="w-4 h-4" />;
      case 'read':
        return <FiMail className="w-4 h-4" />;
      case 'responded':
        return <FiCheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStats = () => {
    return {
      pending: messages.filter(m => m.status === 'pending').length,
      read: messages.filter(m => m.status === 'read').length,
      responded: messages.filter(m => m.status === 'responded').length,
      total: messages.length
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-600 dark:from-teal-400 dark:to-teal-400 bg-clip-text text-transparent">
              Contact Messages
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Manage and respond to customer inquiries</p>
          </div>
          <button
            onClick={() => fetchMessages(filterStatus)}
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <FiRefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: 'Total', value: stats.total, icon: FiMessageSquare, color: 'from-teal-500 to-teal-600' },
            { label: 'Pending', value: stats.pending, icon: FiAlertCircle, color: 'from-amber-500 to-amber-600' },
            { label: 'Read', value: stats.read, icon: FiMail, color: 'from-orange-500 to-orange-600' },
            { label: 'Responded', value: stats.responded, icon: FiCheckCircle, color: 'from-emerald-500 to-emerald-600' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-slate-700/50 p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300/50 dark:hover:border-slate-600/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl transform group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-slate-700/50 p-4 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <FiFilter className="w-5 h-5 text-gray-600 dark:text-gray-400 self-center hidden sm:block" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Messages', icon: FiMessageSquare },
            { id: 'pending', label: 'Pending', icon: FiAlertCircle },
            { id: 'read', label: 'Read', icon: FiMail },
            { id: 'responded', label: 'Responded', icon: FiCheckCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.id}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-600 rounded-full animate-spin" style={{maskImage: 'radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))'}}></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-slate-700/50">
                <div className="bg-gradient-to-br from-teal-100 to-teal-100 dark:from-teal-900/30 dark:to-teal-900/30 p-6 rounded-full mb-4">
                  <FiMessageSquare size={48} className="text-teal-600 dark:text-teal-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-1">No messages found</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  {searchQuery ? 'Try adjusting your search filters' : 'New contact messages will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {filteredMessages.map((message, index) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      setAdminNotes(message.admin_notes || '');
                    }}
                    className={`group relative p-4 md:p-5 rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-102 ${
                      selectedMessage?.id === message.id
                        ? 'bg-gradient-to-r from-teal-50 to-teal-50 dark:from-teal-900/30 dark:to-teal-900/30 border-teal-300 dark:border-teal-700/50 shadow-lg'
                        : 'bg-white dark:bg-slate-800/50 backdrop-blur-xl border-gray-200/50 dark:border-slate-700/50 hover:border-gray-300 dark:hover:border-slate-600/50 hover:shadow-md'
                    }`}
                    style={{animationDelay: `${index * 50}ms`}}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {message.name.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm md:text-base">
                              {message.name}
                            </h3>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap ${getStatusBadgeColor(message.status)}`}>
                            {getStatusIcon(message.status)}
                            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {message.subject}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-700/30 px-2 py-1 rounded">
                            <FiMail size={13} className="flex-shrink-0" />
                            <span className="truncate">{message.email}</span>
                          </div>
                          {message.phone && (
                            <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-700/30 px-2 py-1 rounded">
                              <FiPhone size={13} className="flex-shrink-0" />
                              {message.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-700/30 px-2 py-1 rounded">
                            <FiClock size={13} className="flex-shrink-0" />
                            {formatDate(message.created_at)}
                          </div>
                        </div>
                      </div>
                      {message.status === 'pending' && (
                        <div className="flex-shrink-0 animate-pulse">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Detail Panel */}
          <div className="lg:col-span-1">
            {selectedMessage ? (
              <div className="sticky top-6 bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto">
                {/* Close Button */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700/50">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Message Details</h2>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <FiX size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Message Details */}
                <div className="space-y-4 p-6 border-b border-gray-200 dark:border-slate-700/50">
                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">From</label>
                    <p className="text-gray-900 dark:text-white font-semibold mt-2">{selectedMessage.name}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Email</label>
                    <a 
                      href={`mailto:${selectedMessage.email}`}
                      className="text-teal-600 dark:text-teal-400 hover:underline break-all mt-2 inline-block font-medium"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>

                  {selectedMessage.phone && (
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Phone</label>
                      <a 
                        href={`tel:${selectedMessage.phone}`}
                        className="text-teal-600 dark:text-teal-400 hover:underline mt-2 inline-block font-medium"
                      >
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Date</label>
                    <p className="text-gray-900 dark:text-white mt-2 font-medium">{formatDate(selectedMessage.created_at)}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Status</label>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${getStatusBadgeColor(selectedMessage.status)}`}>
                        {getStatusIcon(selectedMessage.status)}
                        {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="p-6 border-b border-gray-200 dark:border-slate-700/50">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Subject</label>
                  <p className="text-gray-900 dark:text-white mt-2 font-semibold">{selectedMessage.subject}</p>
                </div>

                {/* Message Content */}
                <div className="p-6 border-b border-gray-200 dark:border-slate-700/50">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Message</label>
                  <div className="mt-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg p-4 border border-gray-200 dark:border-slate-600/30">
                    <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {/* Admin Notes Display */}
                {selectedMessage.admin_notes && (
                  <div className="p-6 border-b border-gray-200 dark:border-slate-700/50">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Previous Admin Notes</label>
                    <div className="mt-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800/30">
                      <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.admin_notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Add Notes */}
                <div className="p-6 border-b border-gray-200 dark:border-slate-700/50">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-3">
                    Add Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add your notes, response details, or follow-up information here..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 placeholder-gray-500 dark:placeholder-gray-400 text-sm resize-none transition-all"
                  />
                </div>

                {/* Actions */}
                <div className="p-6 space-y-2 bg-gray-50 dark:bg-slate-700/20">
                  {selectedMessage.status !== 'read' && (
                    <button
                      onClick={() => updateMessageStatus(selectedMessage.id, 'read')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    >
                      <FiCheckCircle size={18} />
                      Mark as Read
                    </button>
                  )}

                  {selectedMessage.status !== 'responded' && (
                    <button
                      onClick={() => updateMessageStatus(selectedMessage.id, 'responded')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    >
                      <FiCheckCircle size={18} />
                      Mark as Responded
                    </button>
                  )}

                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                  >
                    <FiTrash2 size={18} />
                    Delete Message
                  </button>
                </div>
              </div>
            ) : (
              <div className="sticky top-6 h-96 bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-slate-700/50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-gradient-to-br from-teal-100 to-teal-100 dark:from-teal-900/30 dark:to-teal-900/30 p-6 rounded-full mb-4">
                  <FiMessageSquare size={48} className="text-teal-600 dark:text-teal-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium text-lg mb-1">No message selected</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  Click on a message from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactMessagesPage;