import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiPost, apiGet, apiPostForm } from '../utils/api';
import { 
  ArrowLeft,
  Upload,
  Package,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Shield,
  CheckCircle
} from 'lucide-react';

export function AddMedicine() {
  const navigate = useNavigate();
  const { userProfile, accessToken } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    expiry_date: '',
    price: '',
    original_price: '',
    description: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [kycLoading, setKycLoading] = useState(true);

  useEffect(() => {
    checkKycStatus();
  }, [accessToken]);

  const checkKycStatus = async () => {
    try {
      const data = await apiGet('/kyc/status', accessToken);
      setKycStatus(data);
    } catch (error) {
      console.error('Error checking KYC status:', error);
    } finally {
      setKycLoading(false);
    }
  };

  // Redirect if not a seller
  if (userProfile?.role !== 'seller') {
    navigate('/dashboard');
    return null;
  }

  // Show KYC requirement if not verified
  if (!kycLoading && kycStatus?.kycStatus !== 'verified') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">KYC Verification Required</h1>
            <p className="text-gray-600 mb-6">
              You need to complete KYC verification before you can list medicines for sale.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Current Status: {kycStatus?.kycStatus === 'pending' ? 'Pending Review' : 'Not Started'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Why KYC is Required</h3>
              <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Ensure seller authenticity</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Comply with pharmaceutical regulations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Build buyer trust and confidence</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Access to premium features</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => navigate('/profile')}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Complete KYC Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!image || !accessToken) return '';
    const form = new FormData();
    form.append('image', image);
    const res = await apiPostForm<{ url: string; path?: string }>(`/medicines/upload-image`, form, accessToken);
    return res.url || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.name || !formData.quantity || !formData.expiry_date || !formData.price) {
        throw new Error('Please fill in all required fields');
      }

      if (parseInt(formData.quantity) <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      if (parseFloat(formData.price) <= 0) {
        throw new Error('Price must be greater than 0');
      }

      if (new Date(formData.expiry_date) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }

      // Upload image if provided
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImage();
      }

      // Calculate original price if not provided
      const originalPrice = formData.original_price 
        ? parseFloat(formData.original_price)
        : parseFloat(formData.price) * 2; // Default to 2x the sale price

      // Create medicine
      await apiPost(`/medicines`, {
        name: formData.name,
        quantity: parseInt(formData.quantity),
        expiryDate: formData.expiry_date,
        price: parseFloat(formData.price),
        originalPrice: originalPrice,
        description: formData.description,
        imageUrl: imageUrl
      }, accessToken);

      navigate('/medicines', { 
        state: { message: 'Medicine added successfully!' }
      });

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">Add New Medicine</h1>
        <p className="text-gray-600 mt-2">
          List your unused medicines on the marketplace and earn money while helping others.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Medicine Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicine Image (Optional)
            </label>
            <div className="flex items-center space-x-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Medicine preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview('');
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <label className="cursor-pointer">
                <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors">
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Upload Image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Upload a clear photo of the medicine packaging. JPG, PNG up to 5MB.
            </p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Paracetamol 500mg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="Number of units"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Dates and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="expiry_date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  required
                  min={getMinDate()}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (₹) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Price per unit"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="original_price"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="MRP/Original price"
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to auto-calculate as 2x selling price
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="relative">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the medicine, its condition, storage method, etc."
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Price Summary */}
          {formData.price && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Price Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Selling Price per unit:</span>
                  <span className="font-medium text-blue-900">₹{parseFloat(formData.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Original Price per unit:</span>
                  <span className="font-medium text-blue-900">
                    ₹{(formData.original_price 
                      ? parseFloat(formData.original_price) 
                      : parseFloat(formData.price) * 2
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-1">
                  <span className="text-blue-700">Discount offered:</span>
                  <span className="font-medium text-green-600">
                    {Math.round(((
                      (formData.original_price ? parseFloat(formData.original_price) : parseFloat(formData.price) * 2) - 
                      parseFloat(formData.price)
                    ) / (formData.original_price ? parseFloat(formData.original_price) : parseFloat(formData.price) * 2)) * 100)}%
                  </span>
                </div>
                {formData.quantity && (
                  <div className="flex justify-between border-t border-blue-200 pt-1">
                    <span className="text-blue-700">Total Revenue:</span>
                    <span className="font-bold text-blue-900">
                      ₹{(parseFloat(formData.price) * parseInt(formData.quantity)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Important Guidelines</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Only list medicines that are unused and in original packaging</li>
                  <li>• Ensure the expiry date is clearly visible and at least 3 months away</li>
                  <li>• Store medicines in proper conditions (cool, dry place)</li>
                  <li>• Be honest about the medicine's condition and history</li>
                  <li>• Your account will be verified before medicines go live</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Package className="w-5 h-5" />
              <span>{loading ? 'Adding Medicine...' : 'Add Medicine'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/medicines')}
              className="flex-1 sm:flex-none bg-gray-100 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Pricing Tips</h4>
            <p>Price your medicines competitively at 40-60% of retail price to attract buyers while maximizing your earnings.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Quality Standards</h4>
            <p>Ensure medicines are stored properly, have clear expiry dates, and are in original packaging for buyer confidence.</p>
          </div>
        </div>
      </div>
    </div>
  );
}