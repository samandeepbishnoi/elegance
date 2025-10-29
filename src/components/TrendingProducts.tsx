import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, Star } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  views?: number;
}

const TrendingProducts: React.FC = () => {
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/products`);
        if (res.ok) {
          const data = await res.json();
          // Sort by views and get top 4
          const sorted = [...data]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 4);
          setTrendingProducts(sorted);
        }
      } catch (error) {
        console.error('Error fetching trending products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, [backendUrl]);

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 dark:border-gray-700 border-t-amber-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (trendingProducts.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 px-6 py-3 rounded-full mb-6">
            <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-amber-900 dark:text-amber-200">Trending Now</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
            Most Popular Pieces
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
            See what everyone is loving right now
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => navigate(`/product/${product._id}`)}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              {/* Trending Badge */}
              <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                <Star className="h-3 w-3 fill-current" />
                #{index + 1}
              </div>

              {/* Product Image */}
              <div className="relative h-64 sm:h-72 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <motion.img
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Views Badge */}
                {product.views && product.views > 0 && (
                  <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {product.views}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    ₹{product.price.toLocaleString()}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {product.category}
                  </span>
                </div>
                
                {/* Quick View Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-2.5 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/product/${product._id}`);
                  }}
                >
                  Quick View
                </motion.button>
              </div>

              {/* Shimmer Effect on Hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/catalog')}
            className="inline-flex items-center gap-2 bg-transparent border-2 border-amber-500 dark:border-amber-400 text-amber-600 dark:text-amber-400 px-8 py-3 rounded-full text-lg font-semibold hover:bg-amber-500 hover:text-white dark:hover:bg-amber-400 dark:hover:text-gray-900 transition-all"
          >
            View All Products
            <TrendingUp className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingProducts;
