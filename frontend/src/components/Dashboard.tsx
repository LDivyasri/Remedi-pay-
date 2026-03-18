import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiGet } from '../utils/api';
import { 
  Plus, 
  ShoppingBag, 
  IndianRupee, 
  TrendingUp, 
  Package, 
  Activity,
  AlertTriangle,
  Calendar,
  Users
} from 'lucide-react';

export function Dashboard() {
  const { userProfile, accessToken } = useAuth();
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalPurchases: 0,
    totalSpent: 0,
    walletBalance: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentMedicines, setRecentMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      fetchDashboardData();
    }
  }, [accessToken]);

  const fetchDashboardData = async () => {
    if (!accessToken || !userProfile) return;
    try {
      const txData = await apiGet<{ transactions: any[] }>(`/transactions`, accessToken);
      const transactions = txData.transactions || [];

      let calculatedStats: any = {};

      if (userProfile?.role === 'seller') {
        const medsRes = await apiGet<{ medicines: any[] }>(`/medicines`, accessToken);
        const medicines = (medsRes.medicines || []).filter(m => m.sellerId === userProfile.id);
        const sales = transactions.filter((t: any) => t.seller_id === userProfile?.id);
        calculatedStats = {
          ...calculatedStats,
          totalMedicines: medicines.length,
          totalSales: sales.length,
          totalRevenue: sales.reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0)
        };
        setRecentMedicines(medicines.slice(0, 5));
      } else {
        const purchases = transactions.filter((t: any) => t.buyer_id === userProfile?.id);
        calculatedStats = {
          ...calculatedStats,
          totalPurchases: purchases.length,
          totalSpent: purchases.reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0)
        };
      }
      setStats(calculatedStats);
      setRecentTransactions(transactions.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isSeller = userProfile?.role === 'seller';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {userProfile?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Welcome back, {userProfile?.name}!
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${isSeller ? 'bg-medical-blue' : 'bg-medical-green'}`}></div>
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {userProfile?.role} Account
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xl text-gray-600 leading-relaxed">
                {isSeller 
                  ? 'Manage your medicine listings and track your sales performance.'
                  : 'Browse available medicines and manage your purchases.'
                }
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="glass-card p-6 rounded-2xl text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-sm text-gray-600">Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          

          {isSeller ? (
            <>
              <div className="group glass-card p-8 rounded-3xl hover-lift hover:shadow-medical">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Medicines</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalMedicines || 0}</p>
                    <div className="flex items-center mt-2">
                      <Package className="w-4 h-4 text-medical-blue mr-1" />
                      <span className="text-sm text-medical-blue font-medium">Listed</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="group glass-card p-8 rounded-3xl hover-lift hover:shadow-medical">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Sales</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalSales || 0}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-medical-purple mr-1" />
                      <span className="text-sm text-medical-purple font-medium">Completed</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="group glass-card p-8 rounded-3xl hover-lift hover:shadow-medical">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <IndianRupee className="w-4 h-4 text-medical-green mr-1" />
                      <span className="text-sm text-medical-green font-medium">Earned</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <IndianRupee className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="group glass-card p-8 rounded-3xl hover-lift hover:shadow-medical">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Purchases</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalPurchases || 0}</p>
                    <div className="flex items-center mt-2">
                      <ShoppingBag className="w-4 h-4 text-medical-blue mr-1" />
                      <span className="text-sm text-medical-blue font-medium">Orders</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="group glass-card p-8 rounded-3xl hover-lift hover:shadow-medical">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Spent</p>
                    <p className="text-3xl font-bold text-gray-900">₹{(stats.totalSpent || 0).toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <IndianRupee className="w-4 h-4 text-medical-purple mr-1" />
                      <span className="text-sm text-medical-purple font-medium">Invested</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <IndianRupee className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="group glass-card p-8 rounded-3xl hover-lift hover:shadow-medical">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Savings</p>
                    <p className="text-3xl font-bold text-gray-900">₹{((stats.totalSpent || 0) * 0.5).toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-medical-green mr-1" />
                      <span className="text-sm text-medical-green font-medium">~50% saved</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </>
          )}
      </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-3xl shadow-soft mb-12 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isSeller ? (
              <>
                <Link
                  to="/add-medicine"
                  className="group relative glass-card p-6 rounded-2xl hover-lift hover:shadow-medical transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-medical-blue/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block">Add Medicine</span>
                      <span className="text-sm text-gray-600">List new product</span>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/medicines"
                  className="group relative glass-card p-6 rounded-2xl hover-lift hover:shadow-medical transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-medical-green/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block">My Medicines</span>
                      <span className="text-sm text-gray-600">Manage inventory</span>
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/medicines"
                  className="group relative glass-card p-6 rounded-2xl hover-lift hover:shadow-medical transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-medical-blue/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block">Browse Medicines</span>
                      <span className="text-sm text-gray-600">Find products</span>
                    </div>
                  </div>
                </Link>
                
              </>
            )}
            
            <Link
              to="/transactions"
              className="group relative glass-card p-6 rounded-2xl hover-lift hover:shadow-medical transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-medical-purple/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block">Transactions</span>
                  <span className="text-sm text-gray-600">View history</span>
                </div>
              </div>
            </Link>
            
            <Link
              to="/profile"
              className="group relative glass-card p-6 rounded-2xl hover-lift hover:shadow-medical transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-medical-orange/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block">Update Profile</span>
                  <span className="text-sm text-gray-600">Edit details</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <div className="glass-card rounded-3xl shadow-soft overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
                </div>
                <Link
                  to="/transactions"
                  className="text-medical-blue hover:text-blue-700 font-semibold flex items-center space-x-1 hover-lift"
                >
                  <span>View All</span>
                  <TrendingUp className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="p-8">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium text-lg mb-2">No transactions yet</p>
                  <p className="text-sm text-gray-400 max-w-xs mx-auto">
                    {isSeller ? 'Start selling medicines to see transactions here' : 'Start buying medicines to see transactions here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentTransactions.map((transaction: any) => (
                    <div key={transaction.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          transaction.seller_id === userProfile?.id ? 'bg-medical-green-light' : 'bg-medical-blue-light'
                        }`}>
                          {transaction.seller_id === userProfile?.id ? (
                            <TrendingUp className="w-6 h-6 text-medical-green" />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-medical-blue" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.medicine_name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {transaction.quantity} • {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          transaction.seller_id === userProfile?.id ? 'text-medical-green' : 'text-medical-red'
                        }`}>
                          {transaction.seller_id === userProfile?.id ? '+' : '-'}₹{transaction.total_amount.toLocaleString()}
                        </p>
                        <p className={`text-xs font-medium capitalize px-2 py-1 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>

          {/* Recent Medicines (for sellers) or Featured Medicines (for buyers) */}
          <div className="glass-card rounded-3xl shadow-soft overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isSeller ? 'My Recent Medicines' : 'Recommended for You'}
                  </h2>
                </div>
                <Link
                  to="/medicines"
                  className="text-medical-blue hover:text-blue-700 font-semibold flex items-center space-x-1 hover-lift"
                >
                  <span>View All</span>
                  <Package className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="p-8">
              {isSeller && recentMedicines.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium text-lg mb-2">No medicines listed yet</p>
                  <Link
                    to="/add-medicine"
                    className="inline-flex items-center space-x-2 text-medical-blue hover:text-blue-700 font-semibold hover-lift"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add your first medicine</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {(isSeller ? recentMedicines : []).map((medicine: any) => (
                    <div key={medicine.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-medical-blue-light rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-medical-blue" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{medicine.name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {medicine.quantity} • Expires: {new Date(medicine.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">₹{medicine.price.toLocaleString()}</p>
                        <p className={`text-xs font-medium capitalize px-2 py-1 rounded-full ${
                          medicine.status === 'active' ? 'bg-green-100 text-green-700' : 
                          medicine.status === 'sold_out' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {medicine.status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {!isSeller && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium text-lg mb-2">Browse our medicine catalog</p>
                      <Link
                        to="/medicines"
                        className="inline-flex items-center space-x-2 text-medical-blue hover:text-blue-700 font-semibold hover-lift"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Start shopping</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Notice for Sellers */}
        {isSeller && userProfile?.verification_status !== 'verified' && (
          <div className="mt-12 glass-card border-l-4 border-medical-orange rounded-3xl p-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Account Verification Required</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Complete your KYC verification to start selling medicines and gain buyer trust. This helps ensure platform security and builds confidence with potential buyers.
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-primary text-white rounded-2xl font-semibold hover:shadow-medical transition-all duration-300 hover-lift"
                  style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}
                >
                  <span>Complete Verification</span>
                  <Users className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}