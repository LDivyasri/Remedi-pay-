import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiGet } from '../utils/api';
import { 
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  IndianRupee,
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

export function Transactions() {
  const { userProfile, accessToken } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, sales, purchases
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    salesCount: 0,
    salesAmount: 0,
    purchasesCount: 0,
    purchasesAmount: 0
  });

  useEffect(() => {
    if (accessToken) {
      fetchTransactions();
    }
  }, [accessToken]);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [transactions, searchTerm, filterType, dateRange]);

  const fetchTransactions = async () => {
    try {
      const data = await apiGet<{ transactions: any[] }>(`/transactions`, accessToken);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.medicine_name.toLowerCase().includes(searchLower) ||
        transaction.id.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filterType === 'sales') {
      filtered = filtered.filter(transaction => transaction.seller_id === userProfile?.id);
    } else if (filterType === 'purchases') {
      filtered = filtered.filter(transaction => transaction.buyer_id === userProfile?.id);
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.created_at) >= new Date(dateRange.from)
      );
    }
    if (dateRange.to) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.created_at) <= new Date(dateRange.to)
      );
    }

    setFilteredTransactions(filtered);
  };

  const calculateStats = () => {
    const sales = transactions.filter(t => t.seller_id === userProfile?.id);
    const purchases = transactions.filter(t => t.buyer_id === userProfile?.id);

    setStats({
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + t.total_amount, 0),
      salesCount: sales.length,
      salesAmount: sales.reduce((sum, t) => sum + t.total_amount, 0),
      purchasesCount: purchases.length,
      purchasesAmount: purchases.reduce((sum, t) => sum + t.total_amount, 0)
    });
  };

  const getTransactionType = (transaction: any) => {
    if (transaction.seller_id === userProfile?.id) return 'sale';
    if (transaction.buyer_id === userProfile?.id) return 'purchase';
    return 'unknown';
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Medicine', 'Quantity', 'Unit Price', 'Total Amount', 'Status'].join(','),
      ...filteredTransactions.map(transaction => [
        new Date(transaction.created_at).toLocaleDateString(),
        getTransactionType(transaction),
        transaction.medicine_name,
        transaction.quantity,
        transaction.unit_price,
        transaction.total_amount,
        transaction.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remedi-pay-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-2">
              Track all your sales and purchases on Remedi Pay
            </p>
          </div>
          <button
            onClick={fetchTransactions}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              <p className="text-sm text-gray-500">₹{stats.totalAmount.toLocaleString()} total value</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {userProfile?.role === 'seller' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sales</p>
                <p className="text-2xl font-bold text-green-600">{stats.salesCount}</p>
                <p className="text-sm text-gray-500">₹{stats.salesAmount.toLocaleString()} earned</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {userProfile?.role === 'seller' ? 'Purchases' : 'Total Purchases'}
              </p>
              <p className="text-2xl font-bold text-purple-600">{stats.purchasesCount}</p>
              <p className="text-sm text-gray-500">₹{stats.purchasesAmount.toLocaleString()} spent</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              {userProfile?.role === 'seller' ? (
                <TrendingDown className="w-6 h-6 text-purple-600" />
              ) : (
                <IndianRupee className="w-6 h-6 text-purple-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by medicine or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Transactions</option>
            {userProfile?.role === 'seller' && <option value="sales">Sales Only</option>}
            <option value="purchases">Purchases Only</option>
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({...prev, from: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="From date"
          />

          {/* Date To */}
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({...prev, to: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="To date"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {filteredTransactions.length} transactions found
            </span>
            {(searchTerm || filterType !== 'all' || dateRange.from || dateRange.to) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setDateRange({from: '', to: ''});
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
          
          {filteredTransactions.length > 0 && (
            <button
              onClick={exportTransactions}
              className="flex items-center space-x-2 text-sm bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">
              {transactions.length === 0 
                ? 'You haven\'t made any transactions yet.'
                : 'Try adjusting your filters to find transactions.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction: any) => {
                  const transactionType = getTransactionType(transaction);
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {transaction.id.slice(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.medicine_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{transaction.unit_price}/unit
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transactionType === 'sale' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transactionType === 'sale' ? (
                            <>
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Sale
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Purchase
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.quantity} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          transactionType === 'sale' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {transactionType === 'sale' ? '+' : '-'}₹{transaction.total_amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination could be added here if needed */}
    </div>
  );
}