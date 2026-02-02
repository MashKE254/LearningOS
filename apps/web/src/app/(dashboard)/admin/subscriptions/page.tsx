'use client';

import { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

// Mock data
const mockPlans = [
  { id: 'free', name: 'Free', price: 0, subscribers: 8234, churn: 0 },
  { id: 'student-pro', name: 'Student Pro', price: 9.99, subscribers: 1456, churn: 3.2 },
  { id: 'family', name: 'Family', price: 19.99, subscribers: 534, churn: 2.1 },
  { id: 'educator', name: 'Educator', price: 14.99, subscribers: 323, churn: 1.8 },
];

const mockSubscriptions = [
  {
    id: '1',
    user: 'Sarah Johnson',
    email: 'sarah@example.com',
    plan: 'Student Pro',
    status: 'active',
    amount: 9.99,
    startDate: '2024-01-15',
    nextBilling: '2024-03-15',
    paymentMethod: 'Visa •••• 4242',
  },
  {
    id: '2',
    user: 'Michael Chen',
    email: 'michael@example.com',
    plan: 'Family',
    status: 'active',
    amount: 19.99,
    startDate: '2024-02-01',
    nextBilling: '2024-03-01',
    paymentMethod: 'Mastercard •••• 8888',
  },
  {
    id: '3',
    user: 'Emma Williams',
    email: 'emma@example.com',
    plan: 'Educator',
    status: 'active',
    amount: 14.99,
    startDate: '2024-01-25',
    nextBilling: '2024-02-25',
    paymentMethod: 'Visa •••• 1234',
  },
  {
    id: '4',
    user: 'James Brown',
    email: 'james@example.com',
    plan: 'Student Pro',
    status: 'past_due',
    amount: 9.99,
    startDate: '2024-01-10',
    nextBilling: '2024-02-10',
    paymentMethod: 'Visa •••• 5678',
  },
  {
    id: '5',
    user: 'Lisa Park',
    email: 'lisa@example.com',
    plan: 'Student Pro',
    status: 'cancelled',
    amount: 9.99,
    startDate: '2023-12-01',
    nextBilling: '-',
    paymentMethod: 'PayPal',
  },
  {
    id: '6',
    user: 'Tom Wilson',
    email: 'tom@example.com',
    plan: 'Family',
    status: 'trial',
    amount: 0,
    startDate: '2024-02-28',
    nextBilling: '2024-03-07',
    paymentMethod: 'Not set',
  },
];

const mockRevenueData = {
  mrr: 38500,
  mrrGrowth: 12.5,
  arr: 462000,
  ltv: 156,
  arpu: 12.45,
};

export default function AdminSubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredSubscriptions = mockSubscriptions.filter((sub) => {
    const matchesSearch = sub.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'all' || sub.plan.toLowerCase().replace(' ', '-') === planFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'trial': return 'bg-blue-100 text-blue-700';
      case 'past_due': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalPaidSubscribers = mockPlans.filter(p => p.price > 0).reduce((sum, p) => sum + p.subscribers, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600">Manage subscriptions and revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
          <DollarSign className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">${mockRevenueData.mrr.toLocaleString()}</p>
          <p className="text-sm opacity-80">MRR</p>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <TrendingUp className="w-3 h-3" />
            +{mockRevenueData.mrrGrowth}% vs last month
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">${mockRevenueData.arr.toLocaleString()}</p>
          <p className="text-sm text-gray-600">ARR</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{totalPaidSubscribers.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Paid Subscribers</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">${mockRevenueData.ltv}</p>
          <p className="text-sm text-gray-600">Avg LTV</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">${mockRevenueData.arpu}</p>
          <p className="text-sm text-gray-600">ARPU</p>
        </div>
      </div>

      {/* Plan Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Plan Overview</h2>
        </div>
        <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {mockPlans.map((plan) => (
            <div key={plan.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{plan.name}</h3>
                <span className="text-sm text-gray-500">
                  {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{plan.subscribers.toLocaleString()}</p>
              <p className="text-sm text-gray-500">subscribers</p>
              {plan.churn > 0 && (
                <p className="text-xs text-red-600 mt-2">
                  {plan.churn}% monthly churn
                </p>
              )}
            </div>
          ))}
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
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="student-pro">Student Pro</option>
              <option value="family">Family</option>
              <option value="educator">Educator</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="past_due">Past Due</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Plan</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Next Billing</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Payment Method</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{sub.user}</p>
                      <p className="text-xs text-gray-500">{sub.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{sub.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(sub.status)}`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">
                      {sub.amount === 0 ? 'Free' : `$${sub.amount}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{sub.nextBilling}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{sub.paymentMethod}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === sub.id ? null : sub.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      {activeMenu === sub.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                            View Details
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                            Change Plan
                          </button>
                          {sub.status === 'past_due' && (
                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                              <RefreshCw className="w-4 h-4" />
                              Retry Payment
                            </button>
                          )}
                          {sub.status === 'active' && (
                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600">
                              Cancel Subscription
                            </button>
                          )}
                          {sub.status === 'cancelled' && (
                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-green-600">
                              Reactivate
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No subscriptions found</p>
          </div>
        )}
      </div>

      {/* Failed Payments Alert */}
      {mockSubscriptions.some(s => s.status === 'past_due') && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Failed Payments Detected</h3>
            <p className="text-sm text-red-700 mt-1">
              {mockSubscriptions.filter(s => s.status === 'past_due').length} subscription(s) have failed payments. 
              Consider reaching out to these users or setting up automated retry attempts.
            </p>
            <button className="mt-2 text-sm font-medium text-red-700 hover:text-red-800">
              View Failed Payments →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
