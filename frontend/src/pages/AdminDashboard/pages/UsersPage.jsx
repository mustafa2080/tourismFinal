import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiTrash2, FiEye, FiX, FiLoader, FiUser, FiMail, FiPhone, FiCalendar, FiCheck, FiAlertCircle } from 'react-icons/fi';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, [pagination.offset]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching users from backend...', { limit: pagination.limit, offset: pagination.offset });
      
      const response = await adminService.getAllUsers(pagination.limit, pagination.offset);
      
      console.log('✅ Full Response:', response);
      console.log('✅ Response keys:', Object.keys(response || {}));
      console.log('✅ Users Data:', response?.data);
      console.log('✅ Data Type:', typeof response?.data);
      console.log('✅ Is Array:', Array.isArray(response?.data));
      console.log('✅ Pagination:', response?.pagination);
      
      // Handle both response formats
      let usersData = [];
      let paginationData = pagination;
      
      if (response?.success && response?.data) {
        usersData = Array.isArray(response.data) ? response.data : [];
        paginationData = response.pagination || pagination;
        console.log('✅ Format 1: success + data');
      } else if (Array.isArray(response?.data)) {
        usersData = response.data;
        paginationData = response.pagination || pagination;
        console.log('✅ Format 2: array data');
      } else if (Array.isArray(response)) {
        usersData = response;
        console.log('✅ Format 3: direct array');
      } else {
        console.warn('⚠️ Unknown response format:', response);
      }
      
      console.log(`📊 Setting ${usersData.length} users to state`);
      if (usersData.length > 0) {
        console.log('📊 First user:', usersData[0]);
      }
      setUsers(usersData);
      
      if (paginationData?.total !== undefined) {
        console.log('🔢 Updating pagination:', paginationData);
        setPagination(prev => ({
          ...prev,
          total: paginationData.total || 0,
          limit: paginationData.limit || 20,
          offset: paginationData.offset || 0,
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Full error object:', error);
      toast.error('Failed to load users: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Search and filter
  const filteredUsers = users.filter(user => {
    // Ensure user has required properties
    if (!user) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower));
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    console.log(`🔍 Filtering user:`, { name: user.name, role: user.role, matches: matchesSearch && matchesRole });
    
    return matchesSearch && matchesRole;
  });
  
  console.log(`📋 Filtered Results:`, { total: users.length, filtered: filteredUsers.length, searchTerm, filterRole });

  // Ban user
  const handleBanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;

    try {
      setLoadingAction(true);
      console.log('🚫 Banning user:', userId);
      
      const response = await adminService.banUser(userId, 'Banned by admin');
      
      console.log('✅ Ban response:', response);
      
      if (response.success) {
        toast.success('User banned successfully');
        fetchUsers();
        setShowModal(false);
      } else {
        toast.error('Failed to ban user');
      }
    } catch (error) {
      console.error('❌ Error banning user:', error);
      toast.error('Error banning user');
    } finally {
      setLoadingAction(false);
    }
  };

  // View user details
  const handleViewUser = async (userId) => {
    try {
      console.log('👁 Viewing user details:', userId);
      setLoadingAction(true);
      
      const response = await adminService.getUserById(userId);
      
      console.log('✅ User details response:', response);
      
      if (response.success) {
        setSelectedUser(response.data);
        setShowModal(true);
      } else {
        toast.error('Failed to load user details');
      }
    } catch (error) {
      console.error('❌ Error fetching user details:', error);
      toast.error('Error loading user details');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination(p => ({ ...p, offset: p.offset + p.limit }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination(p => ({ ...p, offset: Math.max(0, p.offset - p.limit) }));
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400';
      case 'banned':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'admin':
        return 'Admin';
      case 'banned':
        return 'Banned';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Manage Users
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage all system users and control their permissions
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{pagination.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                  <FiUser size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Customers */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Customers</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {users.filter(u => u.role === 'customer').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center">
                  <FiCheck size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* Admins */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Administrators</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                  <span className="text-xl">👑</span>
                </div>
              </div>
            </div>

            {/* Banned Users */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Banned Users</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {users.filter(u => u.role === 'banned').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-200 dark:bg-red-800 rounded-lg flex items-center justify-center">
                  <FiAlertCircle size={24} className="text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 space-y-4">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <FiX size={18} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <FiFilter size={20} className="text-slate-600 dark:text-slate-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="banned">Banned</option>
          </select>
          <div className="ml-auto text-sm text-slate-600 dark:text-slate-400 font-medium">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Loading users...</p>
            </div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b-2 border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Joined</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700/30'
                      }`}
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name || '-'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <FiMail size={14} className="flex-shrink-0 text-slate-400" />
                          <span className="truncate">{user.email || '-'}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <FiPhone size={14} className="flex-shrink-0 text-slate-400" />
                          <span className="truncate">{user.phone || '-'}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeClass(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <FiCalendar size={14} className="flex-shrink-0 text-slate-400" />
                          <span>{user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewUser(user.id)}
                            disabled={loadingAction}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            title="View Details"
                          >
                            {loadingAction ? <FiLoader size={16} className="animate-spin" /> : <FiEye size={16} />}
                          </button>
                          {user.role !== 'banned' && (
                            <button
                              onClick={() => handleBanUser(user.id)}
                              disabled={loadingAction}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Ban User"
                            >
                              {loadingAction ? <FiLoader size={16} className="animate-spin" /> : <FiTrash2 size={16} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold">No users found in database</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Try adding some users first</p>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold">No users match your search</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-slate-200 dark:border-slate-700">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Showing <span className="font-bold text-slate-900 dark:text-white">{pagination.offset + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(pagination.offset + pagination.limit, pagination.total)}</span> of <span className="font-bold text-slate-900 dark:text-white">{pagination.total}</span> users
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrevPage}
              disabled={pagination.offset === 0}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={pagination.offset + pagination.limit >= pagination.total}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiUser size={24} className="text-blue-600 dark:text-blue-400" />
                User Details
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* User Avatar */}
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {selectedUser.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>

              {/* User ID */}
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">User ID</p>
                <p className="text-xs font-mono text-slate-900 dark:text-white break-all">{selectedUser.id}</p>
              </div>

              {/* Name */}
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Name</p>
                <div className="flex items-center gap-2">
                  <FiUser size={16} className="text-slate-400" />
                  <p className="text-sm text-slate-900 dark:text-white font-semibold">{selectedUser.name}</p>
                </div>
              </div>

              {/* Email */}
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Email</p>
                <div className="flex items-center gap-2">
                  <FiMail size={16} className="text-slate-400" />
                  <p className="text-sm text-slate-900 dark:text-white font-semibold break-all">{selectedUser.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Phone</p>
                <div className="flex items-center gap-2">
                  <FiPhone size={16} className="text-slate-400" />
                  <p className="text-sm text-slate-900 dark:text-white font-semibold">{selectedUser.phone || '-'}</p>
                </div>
              </div>

              {/* Role */}
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Role</p>
                <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${getRoleBadgeClass(selectedUser.role)}`}>
                  {getRoleLabel(selectedUser.role)}
                </span>
              </div>

              {/* Join Date */}
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Joined Date</p>
                <div className="flex items-center gap-2">
                  <FiCalendar size={16} className="text-slate-400" />
                  <p className="text-sm text-slate-900 dark:text-white font-semibold">
                    {new Date(selectedUser.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              {selectedUser.role !== 'banned' && (
                <button
                  onClick={() => handleBanUser(selectedUser.id)}
                  disabled={loadingAction}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingAction ? <FiLoader size={16} className="animate-spin" /> : <FiTrash2 size={16} />}
                  Ban User
                </button>
              )}
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-all font-semibold"
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

export default UsersPage;
