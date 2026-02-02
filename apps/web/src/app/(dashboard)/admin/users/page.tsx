'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  MoreVertical,
  Mail,
  Ban,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  Shield,
  GraduationCap,
  Users as UsersIcon,
  School,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';

// Mock data
const mockUsers = [
  { id: '1', name: 'Alex Kim', email: 'alex@example.com', role: 'student', status: 'active', plan: 'Free', joinedAt: '2024-01-15', lastActive: '2 hours ago' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'student', status: 'active', plan: 'Student Pro', joinedAt: '2024-01-20', lastActive: '30 minutes ago' },
  { id: '3', name: 'Michael Chen', email: 'michael@example.com', role: 'parent', status: 'active', plan: 'Family', joinedAt: '2024-02-01', lastActive: '1 hour ago' },
  { id: '4', name: 'Emma Williams', email: 'emma@example.com', role: 'teacher', status: 'active', plan: 'Educator', joinedAt: '2024-01-25', lastActive: '4 hours ago' },
  { id: '5', name: 'James Brown', email: 'james@example.com', role: 'student', status: 'suspended', plan: 'Free', joinedAt: '2024-02-10', lastActive: '1 week ago' },
  { id: '6', name: 'Lisa Park', email: 'lisa@example.com', role: 'student', status: 'active', plan: 'Student Pro', joinedAt: '2024-02-15', lastActive: '5 minutes ago' },
  { id: '7', name: 'David Lee', email: 'david@example.com', role: 'admin', status: 'active', plan: 'Admin', joinedAt: '2023-12-01', lastActive: 'Now' },
  { id: '8', name: 'Sophie Taylor', email: 'sophie@example.com', role: 'student', status: 'inactive', plan: 'Free', joinedAt: '2024-01-10', lastActive: '2 weeks ago' },
  { id: '9', name: 'Tom Wilson', email: 'tom@example.com', role: 'parent', status: 'active', plan: 'Family', joinedAt: '2024-02-20', lastActive: '3 hours ago' },
  { id: '10', name: 'Anna Davis', email: 'anna@example.com', role: 'teacher', status: 'pending', plan: 'Educator', joinedAt: '2024-03-01', lastActive: 'Never' },
];

type Role = 'all' | 'student' | 'parent' | 'teacher' | 'admin';
type Status = 'all' | 'active' | 'inactive' | 'suspended' | 'pending';
type SortField = 'name' | 'email' | 'role' | 'joinedAt';
type SortOrder = 'asc' | 'desc';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role>('all');
  const [statusFilter, setStatusFilter] = useState<Status>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredUsers = mockUsers
    .filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'joinedAt':
          comparison = a.joinedAt.localeCompare(b.joinedAt);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'parent': return <UsersIcon className="w-4 h-4" />;
      case 'teacher': return <School className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      default: return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-indigo-100 text-indigo-700';
      case 'parent': return 'bg-purple-100 text-purple-700';
      case 'teacher': return 'bg-emerald-100 text-emerald-700';
      case 'admin': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Stats
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.status === 'active').length;
  const suspendedUsers = mockUsers.filter(u => u.status === 'suspended').length;
  const pendingUsers = mockUsers.filter(u => u.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all platform users and their accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-red-600">{suspendedUsers}</p>
          <p className="text-sm text-gray-600">Suspended</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-amber-600">{pendingUsers}</p>
          <p className="text-sm text-gray-600">Pending Approval</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="parent">Parents</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-red-800 font-medium">
            {selectedUsers.length} user(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              Send Email
            </button>
            <button className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              Suspend
            </button>
            <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded text-red-500 focus:ring-red-500"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    User <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-1">
                    Role <SortIcon field="role" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Plan
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('joinedAt')}
                >
                  <div className="flex items-center gap-1">
                    Joined <SortIcon field="joinedAt" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Last Active
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                      className="rounded text-red-500 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize flex items-center gap-1 w-fit ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{user.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{user.joinedAt}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">{user.lastActive}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      {activeMenu === user.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Send Email
                          </button>
                          {user.status === 'pending' && (
                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600">
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                          )}
                          {user.status !== 'suspended' ? (
                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-amber-600">
                              <Ban className="w-4 h-4" />
                              Suspend
                            </button>
                          ) : (
                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600">
                              <Check className="w-4 h-4" />
                              Unsuspend
                            </button>
                          )}
                          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center">
            <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found matching your filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredUsers.length} of {mockUsers.length} users
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="free">Free</option>
                  <option value="student-pro">Student Pro</option>
                  <option value="family">Family</option>
                  <option value="educator">Educator</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="sendInvite" className="rounded text-red-500" defaultChecked />
                <label htmlFor="sendInvite" className="text-sm text-gray-600">
                  Send invitation email
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
