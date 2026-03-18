import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiDelete } from '../utils/api';
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Package, 
  MapPin,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function MedicineList() {
  const { userProfile, accessToken } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    expiryAfter: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, [accessToken]);

  useEffect(() => {
    applyFilters();
  }, [medicines, searchTerm, filters]);

  const fetchMedicines = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filters.minPrice) queryParams.append('min_price', filters.minPrice);
      if (filters.maxPrice) queryParams.append('max_price', filters.maxPrice);
      if (filters.expiryAfter) queryParams.append('expiry_after', filters.expiryAfter);

      const data = await apiGet<{ medicines: any[] }>(`/medicines?${queryParams.toString()}`, accessToken);
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = medicines;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(medicine => 
        medicine.name.toLowerCase().includes(searchLower) ||
        medicine.description?.toLowerCase().includes(searchLower) ||
        medicine.seller_name?.toLowerCase().includes(searchLower)
      );
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter(medicine => medicine.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(medicine => medicine.price <= parseFloat(filters.maxPrice));
    }

    // Expiry filter
    if (filters.expiryAfter) {
      filtered = filtered.filter(medicine => 
        new Date(medicine.expiry_date) > new Date(filters.expiryAfter)
      );
    }

    setFilteredMedicines(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      minPrice: '',
      maxPrice: '',
      expiryAfter: ''
    });
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90; // Consider expiring soon if within 90 days
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-200 h-80 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {userProfile?.role === 'seller' ? 'My Medicines' : 'Browse Medicines'}
        </h1>
        <p className="text-gray-600 mt-2">
          {userProfile?.role === 'seller' 
            ? 'Manage your medicine listings and inventory'
            : 'Find quality medicines at great prices'
          }
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines, descriptions, or sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires After
                </label>
                <input
                  type="date"
                  value={filters.expiryAfter}
                  onChange={(e) => setFilters({...filters, expiryAfter: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear all filters
              </button>
              <span className="text-sm text-gray-500">
                {filteredMedicines.length} medicines found
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add Medicine Button (for sellers) */}
      {userProfile?.role === 'seller' && (
        <div className="mb-6">
          <Link
            to="/add-medicine"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span>Add New Medicine</span>
          </Link>
        </div>
      )}

      {/* Medicine Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No medicines found</h3>
          <p className="text-gray-600 mb-6">
            {userProfile?.role === 'seller' 
              ? 'Start by adding your first medicine to the marketplace.'
              : 'Try adjusting your search or filters to find medicines.'
            }
          </p>
          {userProfile?.role === 'seller' && (
            <Link
              to="/add-medicine"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Package className="w-5 h-5" />
              <span>Add Medicine</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((medicine: any) => (
            <div key={medicine.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              {/* Medicine Image */}
              <div className="aspect-w-16 aspect-h-12 rounded-t-lg overflow-hidden bg-gray-100">
                {medicine.image_url ? (
                  <ImageWithFallback
                    src={medicine.image_url}
                    alt={medicine.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-100">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Medicine Name and Status */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {medicine.name}
                  </h3>
                  {isExpiringSoon(medicine.expiry_date) && (
                    <AlertCircle className="w-5 h-5 text-orange-500 ml-2 flex-shrink-0" />
                  )}
                </div>

                {/* Description */}
                {medicine.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {medicine.description}
                  </p>
                )}

                {/* Medicine Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-medium">{medicine.quantity} units</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Expires:</span>
                    <span className={`font-medium ${isExpiringSoon(medicine.expiry_date) ? 'text-orange-600' : ''}`}>
                      {new Date(medicine.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Original Price:</span>
                    <span className="text-gray-400 line-through">₹{(
                      (medicine.original_price ?? medicine.originalPrice ?? (medicine.price ? medicine.price * 2 : 0))
                    ).toLocaleString()}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">₹{medicine.price.toLocaleString()}</span>
                    <span className="text-sm text-green-600 ml-2">
                      {(() => {
                        const baseOriginal = (medicine.original_price ?? medicine.originalPrice ?? (medicine.price ? medicine.price * 2 : 0));
                        const denom = baseOriginal || 1;
                        const pct = Math.round(((baseOriginal - medicine.price) / denom) * 100);
                        return isFinite(pct) ? pct : 0;
                      })()}% off
                    </span>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Seller: {medicine.seller_name}</span>
                  </div>
                  {medicine.seller_verified && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      console.log('View Details clicked for medicine:', medicine.id);
                      navigate(`/medicines/${medicine.id}`);
                    }}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  {userProfile?.role === 'seller' && medicine.seller_id === userProfile.id && (
                    <>
                      <Link
                        to={`/edit-medicine/${medicine.id}`}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={async () => {
                          if (!accessToken) return;
                          const ok = window.confirm('Delete this medicine? This action cannot be undone.');
                          if (!ok) return;
                          try {
                            await apiDelete(`/medicines/${medicine.id}`, accessToken);
                            setMedicines(prev => prev.filter((m: any) => m.id !== medicine.id));
                          } catch (e: any) {
                            console.error('Failed to delete medicine:', e);
                            alert(e.message || 'Failed to delete');
                          }
                        }}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    medicine.status === 'active' ? 'bg-green-100 text-green-800' :
                    medicine.status === 'sold_out' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {medicine.status === 'active' ? 'Available' : 
                     medicine.status === 'sold_out' ? 'Sold Out' : 
                     medicine.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {isExpiringSoon(medicine.expiry_date) && (
                    <span className="inline-block ml-2 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Expiring Soon
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button (if needed) */}
      {filteredMedicines.length > 0 && filteredMedicines.length % 12 === 0 && (
        <div className="text-center mt-8">
          <button
            onClick={fetchMedicines}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}