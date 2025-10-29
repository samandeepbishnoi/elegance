import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Category {
  name: string;
  image: string;
  count: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const CategoryHighlights: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  // Category image mapping (fallback images from Unsplash)
  const categoryImages: { [key: string]: string } = {
    'necklaces': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop',
    'earrings': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
    'rings': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop',
    'bracelets': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop',
    'pendants': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
    'anklets': 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&h=500&fit=crop',
    'bangles': 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500&h=500&fit=crop',
    'chains': 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=500&h=500&fit=crop',
    'sets': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop',
  };

  useEffect(() => {
    const fetchCategoriesFromProducts = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/products`);
        if (response.ok) {
          const products: Product[] = await response.json();
          
          // Group products by category and count them
          const categoryMap = new Map<string, { count: number; image: string }>();
          
          products.forEach((product) => {
            const categoryLower = product.category.toLowerCase();
            if (categoryMap.has(categoryLower)) {
              const existing = categoryMap.get(categoryLower)!;
              categoryMap.set(categoryLower, {
                count: existing.count + 1,
                image: existing.image || product.image,
              });
            } else {
              categoryMap.set(categoryLower, {
                count: 1,
                image: product.image,
              });
            }
          });

          // Convert to category array
          const categoriesArray: Category[] = Array.from(categoryMap.entries()).map(
            ([name, data]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              image: data.image || categoryImages[name] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
              count: data.count,
            })
          );

          // Sort by count (most products first)
          categoriesArray.sort((a, b) => b.count - a.count);

          setCategories(categoriesArray);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories if fetch fails
        setCategories([
          {
            name: 'Necklaces',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop',
            count: 0
          },
          {
            name: 'Earrings',
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
            count: 0
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesFromProducts();
  }, [backendUrl]);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/catalog?category=${categoryName.toLowerCase()}`);
  };

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
              Shop by Category
            </h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 dark:border-gray-700 border-t-amber-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
            Shop by Category
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
            Find the perfect piece for every occasion
          </p>
        </motion.div>

        {/* Grid Layout */}
        <div className="flex flex-wrap justify-center gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick(category.name)}
              className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 w-full md:w-[calc(33.333%-1rem)]"
            >
              <div className="relative h-64 overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              </div>
            
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold">{category.name}</h3>
                </div>
                <p className="text-sm text-gray-200">
                  {category.count} {category.count === 1 ? 'Product' : 'Products'}
                </p>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '60px' }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  className="h-1 bg-gradient-to-r from-amber-400 to-yellow-400 mt-3 rounded-full group-hover:w-full transition-all duration-300"
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryHighlights;
