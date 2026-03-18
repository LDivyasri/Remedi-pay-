import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Menu, X, Bell, User, LogOut, Plus, ShoppingBag, CreditCard, Activity, Home as HomeIcon } from 'lucide-react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userProfile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = user ? [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/dashboard', label: 'Dashboard', icon: Activity },
    { path: '/medicines', label: 'Browse Medicines', icon: ShoppingBag },
    ...(userProfile?.role === 'seller' ? [
      { path: '/add-medicine', label: 'Add Medicine', icon: Plus }
    ] : []),
    { path: '/transactions', label: 'Transactions', icon: CreditCard },
  ] : [];

  return (
    <nav className="glass-card shadow-soft fixed top-0 left-0 right-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-medical-blue to-medical-green bg-clip-text text-transparent">
                Remedi Pay
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`group flex items-center space-x-2 px-4 py-3 rounded-2xl font-medium transition-all duration-300 hover-lift ${
                  isActive(path)
                    ? 'text-white bg-gradient-primary shadow-medical'
                    : 'text-gray-700 hover:text-medical-blue hover:bg-white/50'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${
                  isActive(path) ? '' : 'group-hover:scale-110'
                }`} />
                <span>{label}</span>
              </Link>
            ))}

            {user && (
              <div className="flex items-center space-x-4 ml-8">
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-3 text-gray-700 hover:text-medical-blue hover:bg-white/50 rounded-2xl transition-all duration-300 group"
                >
                  <Bell className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-3 p-3 text-gray-700 hover:text-medical-blue hover:bg-white/50 rounded-2xl transition-all duration-300">
                    <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-sm">
                        {userProfile?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden lg:block font-medium">{userProfile?.name}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-3 w-56 glass-card rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{userProfile?.name}</p>
                      <p className="text-xs text-gray-600 capitalize">{userProfile?.role} Account</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/50 hover:text-medical-blue transition-colors duration-200 rounded-xl mx-2 my-1"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Profile Settings</span>
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-xl mx-2 my-1 w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!user && (
              <div className="flex items-center space-x-4 ml-8">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-medical-blue font-medium px-4 py-3 rounded-2xl hover:bg-white/50 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-medical transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive(path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}

            {user && (
              <div className="mt-4 pt-4 border-t">
                <Link
                  to="/notifications"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {!user && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}