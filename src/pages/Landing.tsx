import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Shield, MessageCircle, ArrowRight } from 'lucide-react';
import CategoryHighlights from '../components/CategoryHighlights';
import TrendingProducts from '../components/TrendingProducts';
import SpecialOffersCarousel from '../components/SpecialOffersCarousel';
import ShopByOccasion from '../components/ShopByOccasion';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  description: string;
}

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/products`);
        if (res.ok) {
          const data = await res.json();
          setFeaturedProducts(data.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(1, Math.ceil(featuredProducts.length / 3)));
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const features = [
    {
      icon: Shield,
      title: 'Wholesale Pricing',
      description: 'Competitive wholesale rates for retailers and bulk buyers worldwide',
    },
    {
      icon: Heart,
      title: 'Premium Quality',
      description: 'High-quality imitation jewellery that looks and feels authentic',
    },
    {
      icon: Sparkles,
      title: 'Worldwide Shipping',
      description: 'Fast and reliable shipping to customers across the globe',
    },
  ];

  const handleWhatsAppClick = () => {
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919896076856';
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello! I am interested in your wholesale jewellery collection. Please share catalogue and pricing.')}`, '_blank');
  };

  // Background carousel images
  const backgroundImages = [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920&h=1080&fit=crop&q=80',
  ];

  const [currentBgImage, setCurrentBgImage] = useState(0);

  useEffect(() => {
    const bgTimer = setInterval(() => {
      setCurrentBgImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(bgTimer);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ paddingTop: '10vh' }}
      >
        {/* Background Image Carousel */}
        <div className="absolute inset-0 overflow-hidden">
          {backgroundImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{
                opacity: currentBgImage === index ? 1 : 0,
                scale: currentBgImage === index ? 1 : 1.1,
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
              {/* Overlay gradient - reduced opacity to show images better */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-black/40 dark:from-black/50 dark:via-black/40 dark:to-black/50"></div>
            </motion.div>
          ))}
          
          {/* Additional decorative gradient overlay - darker at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 dark:to-black/60"></div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-16 w-full"
        >
          <motion.div variants={itemVariants} className="mb-6 flex justify-center">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="h-16 w-16 text-amber-500 dark:text-amber-400" />
            </motion.div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight"
            style={{ textShadow: '0 4px 6px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6)' }}
          >
            Premium Imitation Jewellery
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400"
              style={{ textShadow: '0 4px 8px rgba(0, 0, 0, 0.5)' }}
            >
              At Wholesale Prices
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto leading-relaxed px-4"
            style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}
          >
            Your trusted wholesale partner for exclusive and premium imitation jewellery.
            Worldwide shipping available with online payment accepted.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(245, 158, 11, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/catalog')}
              className="w-full sm:w-auto group bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 sm:px-10 py-4 rounded-full text-base sm:text-lg font-semibold shadow-2xl hover:shadow-amber-500/50 transition-all flex items-center justify-center"
            >
              Explore Collection
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWhatsAppClick}
              className="w-full sm:w-auto bg-white/90 backdrop-blur-sm text-gray-900 border-2 border-white px-8 sm:px-10 py-4 rounded-full text-base sm:text-lg font-semibold shadow-xl hover:bg-white hover:border-amber-400 transition-all flex items-center justify-center"
            >
              Contact Us
              <MessageCircle className="ml-2 h-5 w-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Category Highlights Section */}
      <CategoryHighlights />

      {/* Why Choose Parika Jewels Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Parika Jewels
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your trusted wholesale partner for premium imitation jewellery with worldwide reach
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-block p-6 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-2xl mb-6"
                >
                  <feature.icon className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <TrendingProducts />

      {/* Special Offers Carousel */}
      <SpecialOffersCarousel />

      {/* Shop by Occasion Section */}
      <ShopByOccasion />

      {/* Featured Collection Section */}
      <section className="py-24 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
              Featured Collection
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Handpicked designs perfect for your retail store
            </p>
          </motion.div>

          <div className="relative overflow-hidden">
            {featuredProducts.length > 0 ? (
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {featuredProducts.slice(currentSlide * 3, currentSlide * 3 + 3).map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl cursor-pointer"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <div className="relative h-80 overflow-hidden">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">₹{product.price.toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading collection...</div>
            )}
          </div>

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
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
            >
              View Full Collection
            </motion.button>
          </motion.div>
        </div>
      </section>

    
    </div>
  );
};

export default Landing;
