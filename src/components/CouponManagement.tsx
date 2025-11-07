import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Edit2, Trash2, X, Save, Tag, Calendar, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minPurchase: number;
  startDate?: string;
  expiryDate?: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  applicableCategories: string[];
  description: string;
  createdAt: string;
}

interface CouponManagementProps {
  token: string;
  backendUrl: string;
}

const CouponManagement: React.FC<CouponManagementProps> = ({ token, backendUrl }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: '',
    minPurchase: '',
    startDate: '',
    expiryDate: '',
    isActive: true,
    usageLimit: '',
    applicableCategories: [] as string[],
    description: '',
  });

  const categories = ['rings', 'necklaces', 'earrings', 'bracelets', 'pendants', 'sets'];

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/coupons`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      } else {
        console.error('Failed to fetch coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: '',
      startDate: '',
      expiryDate: '',
      isActive: true,
      usageLimit: '',
      applicableCategories: [],
      description: '',
    });
    setShowForm(false);
    setEditingCoupon(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(category)
        ? prev.applicableCategories.filter(c => c !== category)
        : [...prev.applicableCategories, category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const couponData = {
      code: formData.code.toUpperCase().trim(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : 0,
      startDate: formData.startDate || null,
      expiryDate: formData.expiryDate || null,
      isActive: formData.isActive,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      applicableCategories: formData.applicableCategories,
      description: formData.description,
    };

    try {
      const url = editingCoupon
        ? `${backendUrl}/api/coupons/${editingCoupon._id}`
        : `${backendUrl}/api/coupons`;
      
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponData),
      });

      if (res.ok) {
        alert(editingCoupon ? 'Coupon updated successfully!' : 'Coupon created successfully!');
        fetchCoupons();
        resetForm();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to save coupon');
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase?.toString() || '',
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit?.toString() || '',
      applicableCategories: coupon.applicableCategories || [],
      description: coupon.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        alert('Coupon deleted successfully!');
        fetchCoupons();
      } else {
        alert('Failed to delete coupon');
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isUsageLimitReached = (coupon: Coupon) => {
    if (!coupon.usageLimit) return false;
    return coupon.usedCount >= coupon.usageLimit;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Coupon Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Create and manage discount coupons</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gold-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors flex items-center justify-center w-full sm:w-auto"
        >
          {showForm ? <X className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
          {showForm ? 'Cancel' : 'New Coupon'}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
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
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Coupon Code
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., DIAMOND10"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  required
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  name="discountValue"
                  required
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  step="0.01"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder={formData.discountType === 'percentage' ? '10' : '500'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Minimum Purchase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Purchase (₹)
                </label>
                <input
                  type="number"
                  name="minPurchase"
                  min="0"
                  step="0.01"
                  value={formData.minPurchase}
                  onChange={handleInputChange}
                  placeholder="0 (no minimum)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Usage Limit
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  min="1"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  placeholder="Unlimited"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Applicable Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Applicable Categories (Leave empty for all categories)
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                      formData.applicableCategories.includes(category)
                        ? 'bg-gold-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description for internal use"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-5 w-5 text-gold-500 focus:ring-gold-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Active (Customers can use this coupon)
              </label>
            </div>

            {/* Submit Button */}
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
                disabled={loading}
                className="px-6 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors flex items-center disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : editingCoupon ? 'Update' : 'Save'} Coupon
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Coupons List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {loading && !showForm ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No coupons created yet. Click "New Coupon" to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Min Purchase</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Usage</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Expiry</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.expiryDate);
                  const limitReached = isUsageLimitReached(coupon);
                  const isValid = coupon.isActive && !expired && !limitReached;

                  return (
                    <tr key={coupon._id} className={!isValid ? 'opacity-60' : ''}>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-gold-500" />
                          <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">{coupon.code}</span>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[150px] truncate">{coupon.description}</p>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-gray-900 dark:text-white font-semibold text-sm">
                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 text-sm hidden md:table-cell">
                        {coupon.minPurchase ? `₹${coupon.minPurchase.toLocaleString()}` : 'None'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-gray-900 dark:text-white text-sm">
                            {coupon.usedCount}
                            {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {isValid ? (
                            <span className="flex items-center text-green-600 dark:text-green-400 text-xs sm:text-sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600 dark:text-red-400 text-xs sm:text-sm">
                              <XCircle className="h-4 w-4 mr-1" />
                              {!coupon.isActive ? 'Inactive' : expired ? 'Expired' : 'Limit Reached'}
                            </span>
                          )}
                        </div>
                        {coupon.applicableCategories.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[120px] truncate">
                            {coupon.applicableCategories.join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 text-sm hidden sm:table-cell">
                        {coupon.expiryDate ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(coupon.expiryDate).toLocaleDateString()}
                          </div>
                        ) : (
                          'No expiry'
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponManagement;
