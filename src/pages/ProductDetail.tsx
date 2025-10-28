import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowLeft, Star, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import RecommendedProducts from '../components/RecommendedProducts';
import { addToRecentlyViewed } from '../utils/recentlyViewed';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  description: string;
  inStock: boolean;
  details?: {
    material: string;
    weight: string;
    dimensions: string;
    certification?: string;
  };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [categoryCoupons, setCategoryCoupons] = useState<any[]>([]);

  const { dispatch: cartDispatch } = useCart();
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data);

        addToRecentlyViewed({
          _id: data._id,
          name: data.name,
          price: data.price,
          image: data.image,
          category: data.category,
        });

        fetch(`${backendUrl}/api/products/${id}/view`, {
          method: 'POST',
        }).catch(err => console.error('Error tracking view:', err));
      } catch (error: any) {
        setProduct(null);
        alert('Error fetching product: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, backendUrl]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/products/${id}/recommendations`);
        if (res.ok) {
          const data = await res.json();
          setRecommended(data);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };
    if (id) {
      fetchRecommendations();
    }
  }, [id, backendUrl]);

  // Fetch coupons for this product's category
  useEffect(() => {
    const fetchCategoryCoupons = async () => {
      if (!product) return;
      
      try {
        const res = await fetch(`${backendUrl}/api/coupons/category/${product.category}`);
        if (res.ok) {
          const data = await res.json();
          setCategoryCoupons(data.coupons || []);
        }
      } catch (error) {
        console.error('Error fetching category coupons:', error);
      }
    };
    
    fetchCategoryCoupons();
  }, [product, backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-gold-500 text-white px-6 py-2 rounded-lg hover:bg-gold-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isInWishlist = wishlistState.items.some(item => item._id === product._id);

  const handleAddToCart = () => {
    if (product.inStock) {
      cartDispatch({ type: 'ADD_ITEM', payload: product });
      // Show success message or redirect
    }
  };

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      wishlistDispatch({ type: 'REMOVE_ITEM', payload: product._id });
    } else {
      wishlistDispatch({ type: 'ADD_ITEM', payload: product });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/catalog')}
          className="flex items-center text-gray-600 hover:text-gold-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Collection
        </button>

        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Product Images */}
          <div className="mb-8 lg:mb-0">
            <div className="aspect-square rounded-lg overflow-hidden bg-white mb-4 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
          </div>

          {/* Product Details */}
          <div className="lg:pt-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center mb-4">
              <div className="flex text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <span className="ml-2 text-gray-600">(4.8) • 24 reviews</span>
            </div>

            <div className="text-4xl font-bold text-gold-600 mb-6">
              ₹{product.price.toLocaleString()}
            </div>

            {/* Available Coupons */}
            {categoryCoupons.length > 0 && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Available Offers
                </h3>
                <div className="space-y-2">
                  {categoryCoupons.map((coupon, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-green-700 dark:text-green-300 mr-2">•</span>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Use code <span className="font-mono font-bold bg-white dark:bg-gray-700 px-2 py-0.5 rounded">{coupon.code}</span> to get{' '}
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discountValue}% off` 
                          : `₹${coupon.discountValue} off`}
                        {coupon.minPurchase > 0 && ` on orders above ₹${coupon.minPurchase.toLocaleString()}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Product Details */}
            {product.details && (
              <div className="bg-white rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium">{product.details.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">{product.details.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="font-medium">{product.details.dimensions}</span>
                  </div>
                  {product.details.certification && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certification:</span>
                      <span className="font-medium">{product.details.certification}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 flex items-center justify-center px-8 py-4 rounded-lg font-medium transition-colors ${
                  product.inStock
                    ? 'bg-gold-500 text-white hover:bg-gold-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              
              <button
                onClick={handleToggleWishlist}
                className={`px-8 py-4 rounded-lg font-medium border-2 transition-colors ${
                  isInWishlist
                    ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gold-500 hover:text-gold-600'
                }`}
              >
                <Heart className="h-5 w-5 mx-auto" />
              </button>
            </div>

            {/* Stock Status */}
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                product.inStock ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`font-medium ${
                product.inStock ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>

        <RecommendedProducts products={recommended} />
      </div>
    </div>
  );
};

export default ProductDetail;