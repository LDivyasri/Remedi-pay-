import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPost, generateOTP } from '../utils/api';
import { loadStripe } from '@stripe/stripe-js';
import { 
  ArrowLeft,
  Package,
  Calendar,
  IndianRupee,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Minus,
  Plus,
  ShoppingCart,
  Edit,
  Trash2,
  Phone,
  QrCode,
  Banknote,
  Shield,
  CheckCircle
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function MedicineDetail() {
  console.log('MedicineDetail component rendered');
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile, accessToken } = useAuth();
  
  // State for medicine data
  const [medicine, setMedicine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Purchase-related state
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [success, setSuccess] = useState('');
  
  // Payment input fields
  const [cardNumber, setCardNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  
  // KYC verification state
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [kycLoading, setKycLoading] = useState(true);
  
  console.log('MedicineDetail state:', { id, medicine, loading, error });

  useEffect(() => {
    console.log('MedicineDetail useEffect - ID:', id);
    if (id) {
      fetchMedicine();
    }
    if (accessToken) {
      fetchKycStatus();
    }
  }, [id, accessToken]);

  const fetchMedicine = async () => {
    console.log('fetchMedicine called with ID:', id);
    try {
      const data = await apiGet<any>(`/medicines/${id}`);
      console.log('Medicine data received:', data);
      setMedicine(data);
    } catch (error) {
      console.error('Error fetching medicine:', error);
      setError('Medicine not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchKycStatus = async () => {
    try {
      const data = await apiGet('/kyc/status', accessToken);
      setKycStatus(data);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    } finally {
      setKycLoading(false);
    }
  };

  const processRealPayment = async (): Promise<boolean> => {
    if (paymentMethod === 'cod') {
      return true; // COD doesn't need payment processing
    }

    if (paymentMethod === 'card') {
      if (!cardNumber.trim()) {
        setError('Please enter your card number');
        return false;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid 16-digit card number');
        return false;
      }
      console.log('Processing card payment for card ending in:', cardNumber.slice(-4));
      // Simulate card payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    }

    if (paymentMethod === 'upi') {
      if (!upiId.trim()) {
        setError('Please enter your UPI ID');
        return false;
      }
      if (!upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g., user@paytm)');
        return false;
      }
      console.log('Processing UPI payment for:', upiId);
      // Simulate UPI payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    }

    return false; // Fallback
  };

  const handlePurchase = async () => {
    if (!medicine || userProfile?.role !== 'buyer') return;

    // Check KYC verification status
    if (kycStatus?.kycStatus !== 'verified') {
      setError('KYC verification required. Please complete your KYC verification before making purchases.');
      return;
    }

    if (quantity > medicine.quantity) {
      setError('Requested quantity exceeds available stock.');
      return;
    }

    setPurchasing(true);
    setError('');
    setSuccess('');

    try {
      const paymentSuccess = await processRealPayment();
      
      if (!paymentSuccess) {
        setError('Payment failed. Please try again or use Cash on Delivery.');
        setPurchasing(false);
        return;
      }

      // Generate OTP for transaction verification
      const otp = generateOTP();
      console.log('Generated OTP for transaction:', otp);

      // Create transaction
      const transactionData: any = {
        medicineId: medicine.id,
        quantity,
        paymentMethod,
        otp: otp
      };

      // Add payment-specific details
      if (paymentMethod === 'card') {
        transactionData.cardNumber = cardNumber.slice(-4); // Only last 4 digits
        transactionData.paymentDetails = `Card ending in ${cardNumber.slice(-4)}`;
      } else if (paymentMethod === 'upi') {
        transactionData.upiId = upiId;
        transactionData.paymentDetails = `UPI: ${upiId}`;
      }

      await apiPost(`/transactions`, transactionData, accessToken);
      
      setSuccess(paymentMethod === 'cod' 
        ? `Order placed successfully! You will pay on delivery. Transaction OTP: ${otp}` 
        : paymentMethod === 'upi'
        ? `Payment successful! Transaction completed via UPI (${upiId}) - Demo Mode. Transaction OTP: ${otp}`
        : `Payment successful! Transaction completed via Card ending in ${cardNumber.slice(-4)} - Demo Mode. Transaction OTP: ${otp}`
      );

      setTimeout(() => {
        navigate('/transactions');
      }, 2000);

    } catch (error: any) {
      // Handle KYC verification error specifically
      if (error.message && error.message.includes('KYC verification required')) {
        setError('KYC verification required. Please complete your KYC verification before making purchases.');
      } else {
        setError(error.message || 'Purchase failed');
      }
    } finally {
      setPurchasing(false);
    }
  };

  console.log('MedicineDetail: About to render', { medicine, loading, error });
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !medicine) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Medicine Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/medicines')}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Medicines</span>
          </button>
        </div>
      </div>
    );
  }

  const canPurchase = userProfile?.role === 'buyer' && medicine?.status === 'active' && medicine?.quantity > 0;
  const isSoldOut = medicine?.quantity <= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Medicine Image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
          {medicine?.image_url ? (
            <ImageWithFallback
              src={medicine.image_url}
              alt={medicine.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Medicine Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{medicine?.name}</h1>
            
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                medicine?.status === 'active' ? 'bg-green-100 text-green-800' :
                medicine?.status === 'sold_out' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {medicine?.status === 'active' ? 'Available' : 
                 medicine?.status === 'sold_out' ? 'Sold Out' : 
                 medicine?.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {medicine?.description && (
              <p className="text-gray-600 mb-6">{medicine.description}</p>
            )}
          </div>

          {/* Medicine Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Quantity</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{medicine?.quantity} units</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Expiry Date</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {medicine?.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Price Info */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium text-gray-700">Original Price</span>
                <span className="text-lg text-gray-500 line-through">
                  ₹{(medicine?.original_price || medicine?.price * 2).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-gray-900">Our Price</span>
                <span className="text-3xl font-bold text-blue-600">
                  ₹{medicine?.price.toLocaleString()}
                </span>
              </div>
              <div className="text-center">
                <span className="text-green-600 font-semibold">
                  You save ₹{((medicine?.original_price || medicine?.price * 2) - medicine?.price).toLocaleString()} 
                  ({Math.round(((medicine?.original_price || medicine?.price * 2) - medicine?.price) / (medicine?.original_price || medicine?.price * 2) * 100)}% off)
                </span>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          {medicine?.seller_name && (
            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                <span>Seller Information</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Seller Name:</span>
                  <span className="text-sm text-gray-900 font-semibold">{medicine.seller_name}</span>
                </div>
                
                {medicine?.seller_phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Mobile Number:</span>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900 font-semibold">{medicine.seller_phone}</span>
                    </div>
                  </div>
                )}
                
                {medicine?.seller_verified && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Verification Status:</span>
                    <div className="flex items-center space-x-1 text-green-600">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-sm font-semibold">Verified Seller</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Purchase Section */}
          {canPurchase && (
            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Purchase Medicine</h3>
              
              {/* Quantity Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-semibold px-4">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(medicine.quantity, quantity + 1))}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={quantity >= medicine.quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Max available: {medicine.quantity} units</p>
              </div>

              {/* Payment Method */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-xl font-bold">₹{(medicine.price * quantity).toLocaleString()}</span>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('card');
                        setUpiId('');
                        setError('');
                      }}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-md border ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      <QrCode className="w-5 h-5" />
                      <span>Pay via Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('upi');
                        setCardNumber('');
                        setError('');
                      }}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-md border ${paymentMethod === 'upi' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      <Phone className="w-5 h-5" />
                      <span>Pay via UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('cod');
                        setCardNumber('');
                        setUpiId('');
                        setError('');
                      }}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-md border ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      <Banknote className="w-5 h-5" />
                      <span>Cash on Delivery</span>
                    </button>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="mt-4 space-y-4">
                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => {
                            // Format card number with spaces every 4 digits
                            const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                            if (value.replace(/\s/g, '').length <= 16) {
                              setCardNumber(value);
                            }
                          }}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter your 16-digit card number</p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="mt-4 space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <Phone className="w-5 h-5 text-blue-600" />
                          <h4 className="font-medium text-blue-900">UPI Payment</h4>
                        </div>
                        <p className="text-sm text-blue-800 mb-3">
                          <strong>Instant UPI Payment (Demo Mode).</strong> Simulated UPI transaction for testing.
                        </p>
                        <div className="text-xs text-blue-700 space-y-1">
                          <p>• Instant payment through UPI apps</p>
                          <p>• Supports PhonePe, Google Pay, Paytm, BHIM</p>
                          <p>• Secure and encrypted transactions</p>
                          <p>• No need to enter card details</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          UPI ID
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="user@paytm or 9876543210@upi"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter your UPI ID (e.g., user@paytm, 9876543210@upi)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* KYC Verification Status */}
              {!kycLoading && kycStatus?.kycStatus !== 'verified' && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">KYC Verification Required</h4>
                      <p className="text-sm text-yellow-800 mb-3">
                        You must complete KYC verification before making purchases. This ensures secure transactions and compliance with regulations.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate('/profile')}
                          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
                        >
                          Complete KYC
                        </button>
                        <span className="text-xs text-yellow-700 self-center">
                          Status: {kycStatus?.kycStatus === 'pending' ? 'Pending Review' : 
                                   kycStatus?.kycStatus === 'rejected' ? 'Rejected' : 'Not Started'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                  {success}
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={purchasing || (!kycLoading && kycStatus?.kycStatus !== 'verified')}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>
                  {purchasing 
                    ? (paymentMethod === 'cod' ? 'Placing Order...' : 'Processing Payment...')
                    : (!kycLoading && kycStatus?.kycStatus !== 'verified')
                    ? 'KYC Verification Required'
                    : (paymentMethod === 'cod' ? 'Place COD Order' : 
                       paymentMethod === 'upi' ? 'Pay with UPI' : 'Pay with Card')
                  }
                </span>
              </button>
            </div>
          )}

          {/* Not Available Message */}
          {userProfile?.role === 'buyer' && !canPurchase && (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                {isSoldOut ? 'Medicine Sold Out' : 'Medicine Not Available'}
              </h3>
              <p className="text-gray-600">
                {isSoldOut 
                  ? 'This medicine has been sold out and is no longer available for purchase.'
                  : 'This medicine is currently not available for purchase.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}