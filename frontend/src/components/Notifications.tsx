import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Bell,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Settings,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  Package,
  Info,
  User,
  Phone
} from 'lucide-react';

export function Notifications() {
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read_status;
    if (filter === 'read') return notification.read_status;
    return true;
  });

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    const unreadNotifications = notifications.filter(n => !n.read_status);
    
    // Mark all unread notifications as read
    await Promise.all(
      unreadNotifications.map(notification => markAsRead(notification.id))
    );
    
    setLoading(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'purchase_success':
        return <ShoppingBag className="w-5 h-5 text-blue-600" />;
      case 'sale_success':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'medicine_expiring':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'verification_approved':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'verification_rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'medicine_sold_out':
        return <Package className="w-5 h-5 text-gray-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'purchase_success':
        return 'bg-blue-50 border-blue-200';
      case 'sale_success':
        return 'bg-green-50 border-green-200';
      case 'medicine_expiring':
        return 'bg-orange-50 border-orange-200';
      case 'verification_approved':
        return 'bg-green-50 border-green-200';
      case 'verification_rejected':
        return 'bg-red-50 border-red-200';
      case 'medicine_sold_out':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              Stay updated with your Remedi Pay activities
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchNotifications}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats and Actions */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex items-center space-x-6 mb-4 sm:mb-0">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                {notifications.length} Total
              </span>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium text-red-600">
                  {unreadCount} Unread
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{loading ? 'Marking...' : 'Mark All Read'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 border-t pt-4">
          <div className="flex space-x-4">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.length - unreadCount }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filter === key
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' 
                ? 'No notifications yet'
                : filter === 'unread'
                  ? 'No unread notifications'
                  : 'No read notifications'
              }
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'You\'ll see important updates and activities here.'
                : filter === 'unread'
                  ? 'All caught up! New notifications will appear here.'
                  : 'You haven\'t read any notifications yet.'
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification: any) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                notification.read_status ? 'opacity-75' : ''
              } ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {notification.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </h3>
                      {!notification.read_status && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">
                      {notification.message}
                    </p>
                    
                    {/* Seller/Buyer Information for Transaction Notifications */}
                    {notification.type === 'transaction' && notification.data && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="text-sm text-gray-600 mb-2 font-medium">Contact Information:</div>
                        <div className="space-y-2">
                          {notification.data.sellerName && (
                            <div className="flex items-center space-x-2 text-sm">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">
                                <span className="font-medium">Seller:</span> {notification.data.sellerName}
                                {notification.data.sellerPhone && notification.data.sellerPhone !== 'N/A' && (
                                  <span className="ml-2 text-gray-600">
                                    <Phone className="w-3 h-3 inline mr-1" />
                                    {notification.data.sellerPhone}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {notification.data.buyerName && (
                            <div className="flex items-center space-x-2 text-sm">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">
                                <span className="font-medium">Buyer:</span> {notification.data.buyerName}
                                {notification.data.buyerPhone && notification.data.buyerPhone !== 'N/A' && (
                                  <span className="ml-2 text-gray-600">
                                    <Phone className="w-3 h-3 inline mr-1" />
                                    {notification.data.buyerPhone}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                      <div className="flex items-center space-x-2">
                        {!notification.read_status && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Check className="w-4 h-4" />
                            <span>Mark as read</span>
                          </button>
                        )}
                        <button className="text-sm text-gray-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More (if needed) */}
      {filteredNotifications.length >= 20 && (
        <div className="mt-8 text-center">
          <button
            onClick={fetchNotifications}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
          >
            Load More Notifications
          </button>
        </div>
      )}

      {/* Notification Settings */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Sale Notifications</div>
              <div className="text-sm text-gray-500">Get notified when your medicines are sold</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Purchase Confirmations</div>
              <div className="text-sm text-gray-500">Get notified when you purchase medicines</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Expiry Reminders</div>
              <div className="text-sm text-gray-500">Get notified when medicines are expiring soon</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Account Verification</div>
              <div className="text-sm text-gray-500">Get notified about verification status updates</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}