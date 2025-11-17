import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CreditCard as Edit2, Trash2, LogOut, Save, X, Power, Users, Ticket, Tag, Package, Settings, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import CouponManagement from '../components/CouponManagement';
import DiscountManagement from '../components/DiscountManagement';
import AdminOrderManagement from '../components/AdminOrderManagement';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  description: string;
  inStock: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'main' | 'pending' | 'approved';
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDiscount, setFilterDiscount] = useState<'all' | 'discounted' | 'no-discount'>('all');
  const [sortByDate, setSortByDate] = useState<'newest' | 'oldest'>('newest');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: '',
    tags: '',
    description: '',
    inStock: true,
    discountType: 'none',
    discountValue: '0',
  });
  const [pendingAdmins, setPendingAdmins] = useState<Admin[]>([]);
  const [allAdmins, setAllAdmins] = useState<Admin[]>([]);
  const [showAdminManagement, setShowAdminManagement] = useState(false);
  const [showCouponManagement, setShowCouponManagement] = useState(false);
  const [showDiscountManagement, setShowDiscountManagement] = useState(false);
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [showOrderManagement, setShowOrderManagement] = useState(false);
  const [showSettingsManagement, setShowSettingsManagement] = useState(false);
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const { isOnline, setStoreStatus } = useStore();
  const [showStoreStatusModal, setShowStoreStatusModal] = useState(false);

  // Settings state
  const [storeSettings, setStoreSettings] = useState({
    codEnabled: true,
    razorpayEnabled: true,
    storeOpen: true,
    codMinimumOrder: 0,
    codMaximumOrder: 100000,
    codExtraCharge: 0
  });
  const [updatingSettings, setUpdatingSettings] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    // Check for persisted token in localStorage
    const persistedToken = localStorage.getItem('adminToken');
    const persistedUser = localStorage.getItem('adminUser');

    if (!auth.isAuthenticated && !persistedToken) {
      navigate('/admin/login');
      return;
    }

    const user = auth.user || (persistedUser ? JSON.parse(persistedUser) : null);
    if (user && user.role === 'main') {
      setIsMainAdmin(true);
    }

    // Load products from backend
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/products`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token || persistedToken}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        const products = await res.json();
        setProducts(products);
        setFilteredProducts(products);
      } catch (error: any) {
        setProducts([]);
        setFilteredProducts([]);
        toast.error(error.message || 'Failed to load products', {
          duration: 4000,
          position: 'top-center',
        });
      }
    };

    const fetchAdmins = async () => {
      if (user && user.role === 'main') {
        try {
          const [pendingRes, allRes] = await Promise.all([
            fetch(`${backendUrl}/api/admin/pending`, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.token || persistedToken}`,
              },
            }),
            fetch(`${backendUrl}/api/admin/all`, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.token || persistedToken}`,
              },
            }),
          ]);

          if (pendingRes.ok) {
            const pending = await pendingRes.json();
            setPendingAdmins(pending);
          }

          if (allRes.ok) {
            const all = await allRes.json();
            setAllAdmins(all);
          }
        } catch (error: any) {
          console.error('Error fetching admins:', error);
        }
      }
    };

    fetchProducts();
    fetchAdmins();
  }, [auth.isAuthenticated, navigate]);

  // Fetch store settings
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/settings/admin`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token || localStorage.getItem('adminToken')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setStoreSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // Load settings on mount
  useEffect(() => {
    if (isMainAdmin) {
      fetchSettings();
    }
  }, [isMainAdmin]);

  // Handle COD settings update
  const handleUpdateCODSettings = async (updates: Partial<typeof storeSettings>) => {
    setUpdatingSettings(true);
    try {
      const res = await fetch(`${backendUrl}/api/settings/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token || localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (data.success) {
        setStoreSettings(prev => ({ ...prev, ...updates }));
        toast.success('Settings updated successfully!', {
          duration: 3000,
          position: 'top-center',
        });
      } else {
        toast.error(data.message || 'Failed to update settings', {
          duration: 4000,
          position: 'top-center',
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings', {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct = {
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image,
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()),
      description: formData.description,
      inStock: formData.inStock,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue) || 0,
    };

    if (editingProduct) {
      // Simulate API call for product update
      try {
        const res = await fetch(`${backendUrl}/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify(newProduct),
        });
        if (!res.ok) {
          throw new Error('Failed to update product');
        }
        const updatedProduct = await res.json();
        const updated = products.map(p => p._id === editingProduct._id ? updatedProduct : p);
        setProducts(updated);
        setFilteredProducts(updated);
        resetForm();
        toast.success('Product updated successfully!', {
          duration: 3000,
          position: 'top-center',
        });
      } catch (error: any) {
        toast.error(error.message || 'Failed to update product', {
          duration: 4000,
          position: 'top-center',
        });
      }
    } else {
      try {
        const res = await fetch(`${backendUrl}/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify(newProduct),
        });

        if (!res.ok) {
          throw new Error('Failed to create product');
        }

        const createdProduct = await res.json();
        const updated = [...products, createdProduct];
        setProducts(updated);
        setFilteredProducts(updated);
        resetForm();
        toast.success('Product created successfully!', {
          duration: 3000,
          position: 'top-center',
        });
      } catch (error: any) {
        toast.error(error.message || 'Failed to create product', {
          duration: 4000,
          position: 'top-center',
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image: '',
      category: '',
      tags: '',
      description: '',
      inStock: true,
      discountType: 'none',
      discountValue: '0',
    });
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      tags: product.tags.join(', '),
      description: product.description,
      inStock: product.inStock,
      discountType: (product as any).discountType || 'none',
      discountValue: ((product as any).discountValue || 0).toString(),
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Delete product from backend
      fetch(`${backendUrl}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete product');
          const updated = products.filter(p => p._id !== id);
          setProducts(updated);
          setFilteredProducts(updated);
          toast.success('Product deleted successfully!', {
            duration: 3000,
            position: 'top-center',
          });
        })
        .catch(error => {
          toast.error(error.message || 'Failed to delete product', {
            duration: 4000,
            position: 'top-center',
          });
        });
    }
  };

  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    // Filter by discount status
    if (filterDiscount === 'discounted') {
      filtered = filtered.filter((p) => {
        const productData = p as any;
        return productData.discountType && productData.discountType !== 'none' && productData.discountValue > 0;
      });
    } else if (filterDiscount === 'no-discount') {
      filtered = filtered.filter((p) => {
        const productData = p as any;
        return !productData.discountType || productData.discountType === 'none' || productData.discountValue === 0;
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return sortByDate === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, filterCategory, filterDiscount, sortByDate]);

  const allCategories = [...new Set(products.map((p) => p.category))];

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${adminName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/admin/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (res.ok) {
        setAllAdmins(prev => prev.filter(a => a._id !== adminId));
        setPendingAdmins(prev => prev.filter(a => a._id !== adminId));
        toast.success(`${adminName} has been deleted`, {
          duration: 3000,
          position: 'top-center',
        });
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to delete admin', {
          duration: 4000,
          position: 'top-center',
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete admin', {
        duration: 4000,
        position: 'top-center',
      });
    }
  };

  // Handle store status toggle
  const handleStoreStatusToggle = async () => {
    setShowStoreStatusModal(false);
    setUpdatingSettings(true);
    try {
      await setStoreStatus(isOnline ? 'offline' : 'online');
      // Update local state
      setStoreSettings(prev => ({ ...prev, storeOpen: !isOnline }));
      toast.success(`Store is now ${isOnline ? 'OFFLINE' : 'ONLINE'}`, {
        duration: 3000,
        position: 'top-center',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update store status', {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setUpdatingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-lg sm:text-2xl font-serif font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Manage your jewelry collection</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm sm:text-base"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 dark:text-white">Total Products</h3>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gold-600">{products.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 dark:text-white">In Stock</h3>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
              {products.filter(p => p.inStock).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 dark:text-white">Out of Stock</h3>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">
              {products.filter(p => !p.inStock).length}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {/* Manage Admins Card (moved to be the first option) */}
            {isMainAdmin && (
              <button
                onClick={() => {
                  setShowAdminManagement(!showAdminManagement);
                  setShowProductManagement(false);
                  setShowCouponManagement(false);
                  setShowDiscountManagement(false);
                  setShowOrderManagement(false);
                  setShowSettingsManagement(false);
                }}
                className="group relative bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10"></div>
                {pendingAdmins.length > 0 && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                    <span className="flex items-center justify-center bg-red-500 text-white w-5 h-5 sm:w-7 sm:h-7 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      {pendingAdmins.length}
                    </span>
                  </div>
                )}
                <div className="relative p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
                  <div className="bg-white/20 p-2 sm:p-3 md:p-4 rounded-full mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-lg font-semibold mb-0.5 sm:mb-1 text-center">
                    {showAdminManagement ? 'Hide Admins' : 'Manage Admins'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Control access</p>
                </div>
              </button>
            )}

            {/* Manage Products Card (changed from Add Product) */}
            <button
              onClick={() => {
                setShowProductManagement(!showProductManagement);
                setShowAdminManagement(false);
                setShowCouponManagement(false);
                setShowDiscountManagement(false);
                setShowOrderManagement(false);
                setShowSettingsManagement(false);
              }}
              className="group relative bg-gradient-to-br from-gold-500 to-gold-600 dark:from-gold-600 dark:to-gold-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10"></div>
              <div className="relative p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
                <div className="bg-white/20 p-2 sm:p-3 md:p-4 rounded-full mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold mb-0.5 sm:mb-1 text-center">
                  {showProductManagement ? 'Hide Products' : 'Manage Products'}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 hidden sm:block">View & edit listings</p>
              </div>
            </button>

            {/* Manage Coupons Card */}
            <button
              onClick={() => {
                setShowCouponManagement(!showCouponManagement);
                setShowAdminManagement(false);
                setShowProductManagement(false);
                setShowDiscountManagement(false);
                setShowOrderManagement(false);
                setShowSettingsManagement(false);
              }}
              className="group relative bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10"></div>
              <div className="relative p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
                <div className="bg-white/20 p-2 sm:p-3 md:p-4 rounded-full mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Ticket className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold mb-0.5 sm:mb-1 text-center">
                  {showCouponManagement ? 'Hide Coupons' : 'Manage Coupons'}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Promo codes</p>
              </div>
            </button>

            {/* Manage Discounts Card */}
            <button
              onClick={() => {
                setShowDiscountManagement(!showDiscountManagement);
                setShowAdminManagement(false);
                setShowProductManagement(false);
                setShowCouponManagement(false);
                setShowOrderManagement(false);
                setShowSettingsManagement(false);
              }}
              className="group relative bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10"></div>
              <div className="relative p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
                <div className="bg-white/20 p-2 sm:p-3 md:p-4 rounded-full mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Tag className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold mb-0.5 sm:mb-1 text-center">
                  {showDiscountManagement ? 'Hide Discounts' : 'Manage Discounts'}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Price reductions</p>
              </div>
            </button>

            {/* Manage Orders Card */}
            <button
              onClick={() => {
                setShowOrderManagement(!showOrderManagement);
                setShowAdminManagement(false);
                setShowProductManagement(false);
                setShowCouponManagement(false);
                setShowDiscountManagement(false);
                setShowSettingsManagement(false);
              }}
              className="group relative bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10"></div>
              <div className="relative p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
                <div className="bg-white/20 p-2 sm:p-3 md:p-4 rounded-full mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-xs sm:text-sm md:text-lg font-semibold mb-0.5 sm:mb-1 text-center">
                  {showOrderManagement ? 'Hide Orders' : 'Manage Orders'}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Track & update</p>
              </div>
            </button>

            {/* Settings Card (Main Admin Only) */}
            {isMainAdmin && (
              <button
                onClick={() => {
                  setShowSettingsManagement(!showSettingsManagement);
                  setShowOrderManagement(false);
                  setShowAdminManagement(false);
                  setShowProductManagement(false);
                  setShowCouponManagement(false);
                  setShowDiscountManagement(false);
                }}
                className="group relative bg-gradient-to-br from-gray-700 to-gray-800 dark:from-gray-600 dark:to-gray-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10"></div>
                <div className="relative p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
                  <div className="bg-white/20 p-2 sm:p-3 md:p-4 rounded-full mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Settings className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-lg font-semibold mb-0.5 sm:mb-1 text-center">
                    {showSettingsManagement ? 'Hide Settings' : 'Store Settings'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Payment options</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        name="price"
                        required
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Enter price"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      required
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="Enter image URL"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        <option value="rings">Rings</option>
                        <option value="necklaces">Necklaces</option>
                        <option value="earrings">Earrings</option>
                        <option value="bracelets">Bracelets</option>
                        <option value="sets">Jewelry Sets</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="diamond, gold, bridal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleInputChange}
                      className="mr-2 text-gold-500 focus:ring-gold-500"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      In Stock
                    </label>
                  </div>

                  {/* Product-Specific Discount Fields */}
                  <div className="border-t dark:border-gray-600 pt-4">
                    <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Product-Specific Discount (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Discount Type
                        </label>
                        <select
                          name="discountType"
                          value={formData.discountType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        >
                          <option value="none">No Discount</option>
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>
                      </div>

                      {formData.discountType !== 'none' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Discount Value
                          </label>
                          <input
                            type="number"
                            name="discountValue"
                            step="0.01"
                            min="0"
                            max={formData.discountType === 'percentage' ? '100' : undefined}
                            value={formData.discountValue}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            placeholder={formData.discountType === 'percentage' ? 'e.g., 10' : 'e.g., 500'}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingProduct ? 'Update' : 'Save'} Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Admin Management Section */}
        {isMainAdmin && showAdminManagement && (
          <div className="mb-8">
            <div className="space-y-6">
                {/* Pending Admins */}
                {pendingAdmins.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      Pending Admin Approvals
                      <span className="ml-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
                        {pendingAdmins.length}
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {pendingAdmins.map((admin) => (
                        <div
                          key={admin._id}
                          className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{admin.name}</p>
                            <p className="text-sm text-gray-600">{admin.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Registered: {new Date(admin.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`${backendUrl}/api/admin/approve/${admin._id}`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      Authorization: `Bearer ${auth.token}`,
                                    },
                                  });
                                  if (res.ok) {
                                    setPendingAdmins(prev => prev.filter(a => a._id !== admin._id));
                                    const updated = await res.json();
                                    setAllAdmins(prev => [...prev.filter(a => a._id !== admin._id), updated.admin]);
                                    toast.success(`${admin.name} has been approved`, {
                                      duration: 3000,
                                      position: 'top-center',
                                    });
                                  } else {
                                    const error = await res.json();
                                    toast.error(error.message || 'Failed to approve admin', {
                                      duration: 4000,
                                      position: 'top-center',
                                    });
                                  }
                                } catch (error: any) {
                                  toast.error(error.message || 'Failed to approve admin', {
                                    duration: 4000,
                                    position: 'top-center',
                                  });
                                }
                              }}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to reject ${admin.name}'s registration?`)) {
                                  try {
                                    const res = await fetch(`${backendUrl}/api/admin/reject/${admin._id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${auth.token}`,
                                      },
                                    });
                                    if (res.ok) {
                                      setPendingAdmins(prev => prev.filter(a => a._id !== admin._id));
                                      toast.success(`${admin.name}'s registration has been rejected`, {
                                        duration: 3000,
                                        position: 'top-center',
                                      });
                                    } else {
                                      const error = await res.json();
                                      toast.error(error.message || 'Failed to reject admin', {
                                        duration: 4000,
                                        position: 'top-center',
                                      });
                                    }
                                  } catch (error: any) {
                                    toast.error(error.message || 'Failed to reject admin', {
                                      duration: 4000,
                                      position: 'top-center',
                                    });
                                  }
                                }
                              }}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Admins List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">All Administrators</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Registered
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {allAdmins.map((admin) => {
                          const currentUserId = auth.user?.id || JSON.parse(localStorage.getItem('adminUser') || '{}').id;
                          const isCurrentUser = admin._id === currentUserId;

                          return (
                            <tr key={admin._id}>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {admin.name}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {admin.email}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  admin.role === 'main'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                    : admin.role === 'approved'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {admin.role === 'main' ? 'Main Admin' : admin.role === 'approved' ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {new Date(admin.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                                {admin.role !== 'main' && !isCurrentUser && (
                                  <button
                                    onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
          </div>
        )}

        {/* Coupon Management Section */}
        {showCouponManagement && (
          <div className="mb-8">
            <CouponManagement 
              token={auth.token || localStorage.getItem('adminToken') || ''}
              backendUrl={backendUrl}
            />
          </div>
        )}

        {/* Discount Management Section */}
        {showDiscountManagement && (
          <div className="mb-8">
            <DiscountManagement />
          </div>
        )}

        {/* Order Management Section */}
        {showOrderManagement && (
          <div className="mb-8">
            <AdminOrderManagement />
          </div>
        )}

        {/* Settings Management Section */}
        {showSettingsManagement && isMainAdmin && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Store Settings
              </h2>

              {/* Payment Methods Section */}
              <div className="space-y-6">
                {/* Store Status Section */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Store Status
                  </h3>
                  
                  {/* Store Open/Close Toggle */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                        <Power className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Store Operational Status
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isOnline 
                          ? 'Store is currently ONLINE - Customers can place orders' 
                          : 'Store is currently OFFLINE - New orders are paused'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowStoreStatusModal(true)}
                      disabled={updatingSettings}
                      className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md ${
                        isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                      } ${updatingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform flex items-center justify-center ${
                          isOnline ? 'translate-x-11' : 'translate-x-1'
                        }`}
                      >
                        <Power className={`h-4 w-4 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
                      </span>
                    </button>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                    isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    {isOnline ? 'Store is accepting orders' : 'Store is not accepting orders'}
                  </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Payment Methods
                  </h3>

                  {/* Cash on Delivery Toggle */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-800 dark:text-white mb-1">
                        Cash on Delivery (COD)
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow customers to pay with cash when the order is delivered
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpdateCODSettings({ codEnabled: !storeSettings.codEnabled })}
                      disabled={updatingSettings}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 ${
                        storeSettings.codEnabled ? 'bg-gold-600' : 'bg-gray-300 dark:bg-gray-600'
                      } ${updatingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          storeSettings.codEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* COD Settings - Show only when COD is enabled */}
                  {storeSettings.codEnabled && (
                    <div className="ml-4 pl-4 border-l-2 border-gold-500 space-y-4">
                      {/* Minimum Order Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Minimum Order Amount for COD (₹)
                        </label>
                        <input
                          type="number"
                          value={storeSettings.codMinimumOrder}
                          onChange={(e) => setStoreSettings(prev => ({ ...prev, codMinimumOrder: parseFloat(e.target.value) || 0 }))}
                          className="w-full sm:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="0"
                          min="0"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Set to 0 for no minimum
                        </p>
                      </div>

                      {/* Maximum Order Amount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Maximum Order Amount for COD (₹)
                        </label>
                        <input
                          type="number"
                          value={storeSettings.codMaximumOrder}
                          onChange={(e) => setStoreSettings(prev => ({ ...prev, codMaximumOrder: parseFloat(e.target.value) || 100000 }))}
                          className="w-full sm:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="100000"
                          min="0"
                        />
                      </div>

                      {/* COD Extra Charge */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          COD Extra Charge (₹)
                        </label>
                        <input
                          type="number"
                          value={storeSettings.codExtraCharge}
                          onChange={(e) => setStoreSettings(prev => ({ ...prev, codExtraCharge: parseFloat(e.target.value) || 0 }))}
                          className="w-full sm:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="0"
                          min="0"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Additional charge for COD orders (set to 0 for free)
                        </p>
                      </div>

                      {/* Save COD Settings Button */}
                      <button
                        onClick={() => handleUpdateCODSettings({
                          codMinimumOrder: storeSettings.codMinimumOrder,
                          codMaximumOrder: storeSettings.codMaximumOrder,
                          codExtraCharge: storeSettings.codExtraCharge
                        })}
                        disabled={updatingSettings}
                        className="mt-4 bg-gold-600 text-white px-6 py-2 rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {updatingSettings ? 'Saving...' : 'Save COD Settings'}
                      </button>
                    </div>
                  )}

                  {/* Online Payment Toggle */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mt-4">
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-800 dark:text-white mb-1">
                        Online Payment Gateway
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow customers to pay online using cards, UPI, wallets, etc.
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpdateCODSettings({ razorpayEnabled: !storeSettings.razorpayEnabled })}
                      disabled={updatingSettings}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 ${
                        storeSettings.razorpayEnabled ? 'bg-gold-600' : 'bg-gray-300 dark:bg-gray-600'
                      } ${updatingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          storeSettings.razorpayEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> At least one payment method must be enabled. If you disable both, customers won't be able to place orders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Management Section */}
        {showProductManagement && (
          <div className="mb-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Product Management
                </h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
                >
                  {showForm ? <X size={20} /> : <Plus size={20} />}
                  {showForm ? 'Cancel' : 'Add Product'}
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Products</h2>

              <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:max-w-2xl">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
                />

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm min-w-[140px]"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={filterDiscount}
                  onChange={(e) => setFilterDiscount(e.target.value as 'all' | 'discounted' | 'no-discount')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm min-w-[140px]"
                >
                  <option value="all">All Products</option>
                  <option value="discounted">Discounted</option>
                  <option value="no-discount">No Discount</option>
                </select>

                <select
                  value={sortByDate}
                  onChange={(e) => setSortByDate(e.target.value as 'newest' | 'oldest')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm min-w-[140px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <img
                          className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                          src={product.image}
                          alt={product.name}
                        />
                        <div className="ml-3 sm:ml-4 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {product.name}
                            </div>
                            {(() => {
                              const productData = product as any;
                              if (productData.discountType && productData.discountType !== 'none' && productData.discountValue > 0) {
                                return (
                                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-gradient-to-r from-orange-500 to-pink-500 text-white flex-shrink-0">
                                    {productData.discountType === 'percentage' ? `${productData.discountValue}% OFF` : `₹${productData.discountValue} OFF`}
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {product.tags.slice(0, 2).join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm text-gray-900 dark:text-white">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.inStock
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
            </div>
          </div>
        )}
      </div>

      {/* Store Status Confirmation Modal */}
      {showStoreStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
            {/* Header */}
            <div className={`p-6 ${isOnline ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isOnline ? 'bg-red-600' : 'bg-green-600'} bg-opacity-30`}>
                  <Power className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isOnline ? 'Set Store OFFLINE?' : 'Set Store ONLINE?'}
                  </h3>
                  <p className="text-white text-opacity-90 text-sm">
                    Confirm store status change
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className={`rounded-lg p-4 mb-4 ${isOnline ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'}`}>
                <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                  {isOnline ? '⚠️ Store will be set to OFFLINE' : '✅ Store will be set to ONLINE'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isOnline 
                    ? 'Customers will not be able to place new orders until you set the store back online.'
                    : 'Customers will be able to browse and place orders on your store.'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Note:</strong> This change takes effect immediately. You can toggle the status back anytime from this dashboard.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 flex gap-3">
              <button
                onClick={() => setShowStoreStatusModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStoreStatusToggle}
                disabled={updatingSettings}
                className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all ${
                  isOnline
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                } ${updatingSettings ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}`}
              >
                {updatingSettings ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  `Yes, Set ${isOnline ? 'OFFLINE' : 'ONLINE'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;