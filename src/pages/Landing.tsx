import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Shield, Star, MessageCircle, ArrowRight } from 'lucide-react';
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

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Bride',
      content: 'The jewelry collection is absolutely stunning. Found the perfect pieces for my wedding day!',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Fashion Designer',
      content: 'Exceptional craftsmanship and elegant designs. These pieces elevate any outfit.',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Jewelry Enthusiast',
      content: 'The attention to detail is remarkable. Each piece tells its own story.',
      rating: 5,
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Certified Authenticity',
      description: 'Every piece comes with certification guaranteeing quality and authenticity',
    },
    {
      icon: Heart,
      title: 'Handcrafted Excellence',
      description: 'Meticulously crafted by skilled artisans with decades of experience',
    },
    {
      icon: Sparkles,
      title: 'Premium Materials',
      description: 'Only the finest gold, diamonds, and precious stones',
    },
  ];

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/1234567890?text=Hello! I am interested in your jewelry collection.', '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-1/2 -left-1/2 w-full h-full opacity-10 dark:opacity-5"
          >
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full blur-3xl"></div>
          </motion.div>
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full opacity-10 dark:opacity-5"
          >
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full blur-3xl"></div>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
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
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Elegance in Every
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400">
              Precious Moment
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed px-4"
          >
            Discover timeless beauty with our exquisite collection of handcrafted jewelry.
            Each piece tells a story of artistry, passion, and uncompromising quality.
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
              className="w-full sm:w-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-900 dark:border-gray-300 px-8 sm:px-10 py-4 rounded-full text-base sm:text-lg font-semibold shadow-xl hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all flex items-center justify-center"
            >
              Contact Us
              <MessageCircle className="ml-2 h-5 w-5" />
            </motion.button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-12 sm:mt-16 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-4"
          >
            <div className="flex items-center">
              <Star className="h-4 sm:h-5 w-4 sm:w-5 text-amber-500 mr-1" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
            <div>10,000+ Happy Customers</div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block"></div>
            <div>Certified Authenticity</div>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:flex"
        >
          <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
            <span className="text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-500 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-3 bg-gray-400 dark:bg-gray-500 rounded-full mt-2"
              ></motion.div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Category Highlights Section */}
      <CategoryHighlights />

      {/* Why Choose Elegance Section */}
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
              Why Choose Elegance
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We combine traditional craftsmanship with modern design to create jewelry that lasts forever
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
              Handpicked pieces that define elegance
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

      {/* Testimonials Section */}
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
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Stories from those who chose elegance
            </p>
          </motion.div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl shadow-lg"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    
    </div>
  );
};

export default Landing;
