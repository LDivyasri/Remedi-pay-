import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPost, apiPostForm } from '../utils/api';
import { 
  User,
  Mail,
  Phone,
  Shield,
  AlertCircle,
  CheckCircle,
  Upload,
  FileText,
  Edit,
  Save,
  X,
  MapPin,
  CreditCard,
  Camera
} from 'lucide-react';

export function Profile() {
  const { userProfile, accessToken, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [kycData, setKycData] = useState({
    aadharNumber: '',
    panNumber: '',
    addressType: 'aadhar'
  });
  const [kycFiles, setKycFiles] = useState({
    aadharFront: null as File | null,
    aadharBack: null as File | null,
    panImage: null as File | null,
    addressDocument: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [uploadingKyc, setUploadingKyc] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        street: userProfile.address?.street || '',
        city: userProfile.address?.city || '',
        state: userProfile.address?.state || '',
        pincode: userProfile.address?.pincode || ''
      });
    }
    fetchKycStatus();
  }, [userProfile, accessToken]);

  const fetchKycStatus = async () => {
    try {
      const data = await apiGet('/kyc/status', accessToken);
      setKycStatus(data);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKycInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKycData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or image file (JPG, PNG)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setKycFiles(prev => ({ ...prev, [field]: file }));
      setError('');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiPost('/auth/profile', {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      }, accessToken);

      setSuccess('Profile updated successfully!');
      setEditing(false);
      await refreshProfile();
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleKycSubmit = async () => {
    if (!kycData.aadharNumber || !kycData.panNumber || !formData.street || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill in all required fields');
      return;
    }

    if (!kycFiles.aadharFront || !kycFiles.aadharBack || !kycFiles.panImage) {
      setError('Please upload all required documents');
      return;
    }

    setUploadingKyc(true);
    setError('');
    setSuccess('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('aadharNumber', kycData.aadharNumber);
      formDataUpload.append('panNumber', kycData.panNumber);
      formDataUpload.append('addressType', kycData.addressType);
      formDataUpload.append('street', formData.street);
      formDataUpload.append('city', formData.city);
      formDataUpload.append('state', formData.state);
      formDataUpload.append('pincode', formData.pincode);
      
      if (kycFiles.aadharFront) formDataUpload.append('aadharFront', kycFiles.aadharFront);
      if (kycFiles.aadharBack) formDataUpload.append('aadharBack', kycFiles.aadharBack);
      if (kycFiles.panImage) formDataUpload.append('panImage', kycFiles.panImage);
      if (kycFiles.addressDocument) formDataUpload.append('addressDocument', kycFiles.addressDocument);

      const data = await apiPostForm('/kyc/submit', formDataUpload, accessToken);

      if (data) {
        setSuccess('KYC documents submitted and verified successfully! You can now access all features.');
        setKycFiles({
          aadharFront: null,
          aadharBack: null,
          panImage: null,
          addressDocument: null
        });
        setKycData({
          aadharNumber: '',
          panNumber: '',
          addressType: 'aadhar'
        });
        await fetchKycStatus();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploadingKyc(false);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
      case 'pending':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertCircle };
      case 'rejected':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: X };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: AlertCircle };
    }
  };

  const kycStatusInfo = getKycStatusColor(kycStatus?.kycStatus || 'not_started');
  const StatusIcon = kycStatusInfo.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile & KYC</h1>
        <p className="text-gray-600 mt-2">
          Manage your account information and complete KYC verification
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-start space-x-2">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: userProfile?.name || '',
                        phone: userProfile?.phone || '',
                        street: userProfile?.address?.street || '',
                        city: userProfile?.address?.city || '',
                        state: userProfile?.address?.state || '',
                        pincode: userProfile?.address?.pincode || ''
                      });
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {editing ? (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={userProfile?.email || ''}
                        disabled
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="street"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{userProfile?.name || 'Not provided'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{userProfile?.phone || 'Not provided'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{userProfile?.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type
                      </label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 capitalize">{userProfile?.role}</span>
                      </div>
                    </div>
                  </div>

                  {userProfile?.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-gray-900">
                          {userProfile.address.street}, {userProfile.address.city}, {userProfile.address.state} - {userProfile.address.pincode}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* KYC Documents */}
          {kycStatus?.kycStatus !== 'verified' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">KYC Verification</h2>
                <p className="text-gray-600 mt-1">
                  Complete KYC verification to unlock all features
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* Document Numbers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Aadhaar Number *
                      </label>
                      <input
                        type="text"
                        id="aadharNumber"
                        name="aadharNumber"
                        value={kycData.aadharNumber}
                        onChange={handleKycInputChange}
                        placeholder="Enter 12-digit Aadhaar number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number *
                      </label>
                      <input
                        type="text"
                        id="panNumber"
                        name="panNumber"
                        value={kycData.panNumber}
                        onChange={handleKycInputChange}
                        placeholder="Enter PAN number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aadhaar Card Front *
                        </label>
                        <div className="flex items-center space-x-4">
                          <label className="cursor-pointer">
                            <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors">
                              <Camera className="w-5 h-5 text-gray-600" />
                              <span className="text-gray-700">Upload</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileChange('aadharFront')}
                              className="hidden"
                            />
                          </label>
                          {kycFiles.aadharFront && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FileText className="w-4 h-4" />
                              <span>{kycFiles.aadharFront.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aadhaar Card Back *
                        </label>
                        <div className="flex items-center space-x-4">
                          <label className="cursor-pointer">
                            <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors">
                              <Camera className="w-5 h-5 text-gray-600" />
                              <span className="text-gray-700">Upload</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileChange('aadharBack')}
                              className="hidden"
                            />
                          </label>
                          {kycFiles.aadharBack && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FileText className="w-4 h-4" />
                              <span>{kycFiles.aadharBack.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PAN Card *
                        </label>
                        <div className="flex items-center space-x-4">
                          <label className="cursor-pointer">
                            <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors">
                              <Camera className="w-5 h-5 text-gray-600" />
                              <span className="text-gray-700">Upload</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileChange('panImage')}
                              className="hidden"
                            />
                          </label>
                          {kycFiles.panImage && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FileText className="w-4 h-4" />
                              <span>{kycFiles.panImage.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Proof (Optional)
                        </label>
                        <div className="flex items-center space-x-4">
                          <label className="cursor-pointer">
                            <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors">
                              <Camera className="w-5 h-5 text-gray-600" />
                              <span className="text-gray-700">Upload</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileChange('addressDocument')}
                              className="hidden"
                            />
                          </label>
                          {kycFiles.addressDocument && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FileText className="w-4 h-4" />
                              <span>{kycFiles.addressDocument.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Document Requirements</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Clear, readable images or PDFs</li>
                        <li>• All 4 corners of documents visible</li>
                        <li>• File size under 5MB</li>
                        <li>• Supported formats: JPG, PNG, PDF</li>
                      </ul>
                    </div>

                    <button
                      onClick={handleKycSubmit}
                      disabled={uploadingKyc}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      <Upload className="w-5 h-5" />
                      <span>{uploadingKyc ? 'Submitting...' : 'Submit KYC Documents'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* KYC Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">KYC Status</h2>
            </div>
            <div className="p-6">
              <div className={`flex items-center space-x-3 p-4 rounded-lg ${kycStatusInfo.bgColor}`}>
                <StatusIcon className={`w-6 h-6 ${kycStatusInfo.color}`} />
                <div>
                  <div className={`font-medium ${kycStatusInfo.color}`}>
                    {kycStatus?.kycStatus === 'verified' ? 'Verified' :
                     kycStatus?.kycStatus === 'pending' ? 'Pending Review' :
                     kycStatus?.kycStatus === 'rejected' ? 'Rejected' : 'Not Started'}
                  </div>
                  {kycStatus?.kycStatus === 'pending' && (
                    <div className="text-sm text-gray-600 mt-1">
                      Your documents are being reviewed
                    </div>
                  )}
                  {kycStatus?.kycStatus === 'rejected' && kycStatus?.rejectedReason && (
                    <div className="text-sm text-gray-600 mt-1">
                      Reason: {kycStatus.rejectedReason}
                    </div>
                  )}
                </div>
              </div>

              {kycStatus?.kycStatus === 'verified' && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Verification Benefits</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• List medicines for sale</li>
                    <li>• Access to all features</li>
                    <li>• Higher buyer trust</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Account Security</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Password</div>
                  <div className="text-sm text-gray-500">Last changed: Unknown</div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Change
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Two-factor Authentication</div>
                  <div className="text-sm text-gray-500">Add extra security to your account</div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}