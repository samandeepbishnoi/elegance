import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, Home, Briefcase, MapPinned, X, Loader, AlertCircle } from 'lucide-react';

interface Address {
  _id: string;
  addressType: 'home' | 'work' | 'other';
  fullName: string;
  phone: string;
  flatNumber?: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface AddressFormData {
  addressType: 'home' | 'work' | 'other';
  flatNumber: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

interface AddressSelectorProps {
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
  onAddressAdded?: () => void;
  customerName: string;
  customerPhone: string;
  userId?: string; // Clerk user ID
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ 
  selectedAddress, 
  onSelectAddress,
  onAddressAdded,
  customerName,
  customerPhone,
  userId
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lookingUpPincode, setLookingUpPincode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [formData, setFormData] = useState<AddressFormData>({
    addressType: 'home',
    flatNumber: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  // Fetch addresses
  const fetchAddresses = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${backendUrl}/api/addresses/user/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setAddresses(data.addresses);
        // Auto-select default address if no address is selected
        if (!selectedAddress && data.addresses.length > 0) {
          const defaultAddr = data.addresses.find((addr: Address) => addr.isDefault) || data.addresses[0];
          onSelectAddress(defaultAddr);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  // Pincode lookup
  const handlePincodeLookup = async (pincode: string) => {
    if (pincode.length === 6) {
      setLookingUpPincode(true);
      try {
        const response = await fetch(`${backendUrl}/api/addresses/pincode/${pincode}`);
        const data = await response.json();
        
        if (data.success) {
          setFormData(prev => ({
            ...prev,
            city: data.data.city,
            state: data.data.state
          }));
        }
      } catch (error) {
        console.error('Error looking up pincode:', error);
      } finally {
        setLookingUpPincode(false);
      }
    }
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-lookup pincode
    if (name === 'pincode') {
      handlePincodeLookup(value);
    }
  };

  // Save address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to parent form
    
    // Clear any previous error
    setErrorMessage('');
    
    // Check if user is authenticated
    if (!userId) {
      setErrorMessage('Please sign in to save addresses.');
      return;
    }
    
    // Validate customer name and phone are provided
    if (!customerName || !customerPhone) {
      setErrorMessage('Please fill in your name and phone number above before adding an address.');
      return;
    }

    // Validate required address fields
    if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
      setErrorMessage('Please fill in all required address fields (Street, City, State, Pincode).');
      return;
    }
    
    try {
      const url = editingId 
        ? `${backendUrl}/api/addresses/user/${userId}/${editingId}`
        : `${backendUrl}/api/addresses/user/${userId}`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          fullName: customerName,
          phone: customerPhone
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchAddresses();
        setShowAddForm(false);
        setEditingId(null);
        resetForm();
        setErrorMessage('');
        if (onAddressAdded) onAddressAdded();
      } else {
        setErrorMessage(data.message || 'Failed to save address. Please try again.');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      setErrorMessage('Error saving address. Please check your internet connection and try again.');
    }
  };

  // Delete address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    if (!userId) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/addresses/user/${userId}/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  // Edit address
  const handleEditAddress = (address: Address) => {
    setFormData({
      addressType: address.addressType,
      flatNumber: address.flatNumber || '',
      street: address.street,
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode
    });
    setEditingId(address._id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      addressType: 'home',
      flatNumber: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      pincode: ''
    });
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="h-5 w-5" />;
      case 'work': return <Briefcase className="h-5 w-5" />;
      default: return <MapPinned className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-6 w-6 animate-spin text-gold-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2"
        >
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
        </motion.div>
      )}

      {/* Saved Addresses */}
      {addresses.length > 0 && !showAddForm && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Select Delivery Address
          </h3>
          {addresses.map((address) => (
            <motion.div
              key={address._id}
              whileHover={{ scale: 1.01 }}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedAddress?._id === address._id
                  ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gold-300'
              }`}
              onClick={() => onSelectAddress(address)}
            >
              {selectedAddress?._id === address._id && (
                <div className="absolute top-3 right-3">
                  <div className="h-6 w-6 rounded-full bg-gold-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gold-100 dark:bg-gold-900/40 rounded-lg text-gold-600 dark:text-gold-400">
                  {getAddressIcon(address.addressType)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase text-gold-600 dark:text-gold-400">
                      {address.addressType}
                    </span>
                    {address.isDefault && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {address.fullName}
                  </p>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {address.flatNumber && `${address.flatNumber}, `}
                    {address.street}
                    {address.landmark && `, ${address.landmark}`}
                  </p>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    📞 {address.phone}
                  </p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditAddress(address);
                  }}
                  className="flex items-center gap-1 text-xs text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAddress(address._id);
                  }}
                  className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add New Address Button */}
      {!showAddForm && (
        <button
          onClick={() => {
            if (!customerName || !customerPhone) {
              setErrorMessage('Please fill in your name and phone number above first, then you can add an address.');
              return;
            }
            setErrorMessage('');
            setShowAddForm(true);
          }}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-400 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="h-5 w-5" />
          Add New Address
        </button>
      )}

      {/* Add/Edit Address Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div 
              className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4"
              onKeyDown={(e) => {
                // Prevent Enter key from submitting parent form
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  // Trigger save when Enter is pressed
                  handleSaveAddress(e as any);
                }
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {editingId ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Address Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Address Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['home', 'work', 'other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, addressType: type }))}
                      className={`py-2 px-4 rounded-lg border-2 capitalize transition-all ${
                        formData.addressType === type
                          ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-300'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flat/House No */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Flat / House No / Building
                </label>
                <input
                  type="text"
                  name="flatNumber"
                  value={formData.flatNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Street */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Street / Area / Colony *
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Pincode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Pincode *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      maxLength={6}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    {lookingUpPincode && (
                      <Loader className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-gold-600" />
                    )}
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveAddress(e as React.FormEvent);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg font-semibold hover:from-gold-600 hover:to-gold-700 transition-all"
                >
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddressSelector;
