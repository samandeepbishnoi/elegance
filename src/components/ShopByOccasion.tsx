import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, Sparkles, Users, Star, Gift } from 'lucide-react';

interface Occasion {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  searchQuery: string;
  image: string;
}

const ShopByOccasion: React.FC = () => {
  const occasions: Occasion[] = [
    {
      name: 'Wedding',
      description: 'Bridal & special ceremony jewelry',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      gradient: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      searchQuery: 'Show me elegant wedding jewelry and bridal pieces perfect for ceremonies',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop'
    },
    {
      name: 'Festival',
      description: 'Traditional & festive collections',
      icon: Sparkles,
      color: 'from-amber-500 to-yellow-500',
      gradient: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
      searchQuery: 'I need traditional and festive jewelry for celebrations',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop'
    },
    {
      name: 'Party',
      description: 'Glamorous evening & party wear',
      icon: Star,
      color: 'from-purple-500 to-indigo-500',
      gradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
      searchQuery: 'Show me glamorous party wear jewelry for evening events',
      image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&h=400&fit=crop'
    },
    {
      name: 'Daily Wear',
      description: 'Elegant everyday essentials',
      icon: Calendar,
      color: 'from-teal-500 to-cyan-500',
      gradient: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
      searchQuery: 'I want elegant and minimal jewelry for daily wear',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=400&fit=crop'
    },
    {
      name: 'Gifts',
      description: 'Perfect presents for loved ones',
      icon: Gift,
      color: 'from-red-500 to-pink-500',
      gradient: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      searchQuery: 'Help me find the perfect jewelry gift for someone special',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop'
    },
    {
      name: 'Office',
      description: 'Professional & sophisticated pieces',
      icon: Users,
      color: 'from-gray-500 to-slate-600',
      gradient: 'from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800',
      searchQuery: 'Show me professional and sophisticated jewelry for office wear',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=400&fit=crop'
    },
  ];

  const handleOccasionClick = (occasion: Occasion) => {
    // Dispatch custom event to open chat with predefined message
    const event = new CustomEvent('openChatWithMessage', {
      detail: { message: occasion.searchQuery }
    });
    window.dispatchEvent(event);
  };

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
            Shop by Occasion
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
            Find the perfect jewelry for every moment
          </p>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {occasions.map((occasion, index) => {
            const IconComponent = occasion.icon;
            const isOddLast = occasions.length % 2 !== 0 && index === occasions.length - 1;
            return (
              <motion.div
                key={occasion.name}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOccasionClick(occasion)}
                className={`group relative cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  isOddLast ? 'col-span-2 md:col-span-1 justify-self-center w-[calc(50%-0.75rem)] md:w-full' : ''
                }`}
              >
                {/* Background Image */}
                <div className="relative h-64 sm:h-72 overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    src={occasion.image}
                    alt={occasion.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${occasion.color} opacity-70 group-hover:opacity-80 transition-opacity`}></div>
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="mb-4"
                  >
                    <div className="inline-block p-3 bg-white/20 backdrop-blur-sm rounded-full">
                      <IconComponent className="h-8 w-8" />
                    </div>
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                    {occasion.name}
                  </h3>
                  <p className="text-sm sm:text-base text-white/90 mb-4">
                    {occasion.description}
                  </p>

                  {/* Shop Now Button */}
                  <motion.button
                    whileHover={{ x: 5 }}
                    className="inline-flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Shop Now
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.button>

                  {/* Decorative Line */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '80px' }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                    className="h-1 bg-white mt-4 rounded-full group-hover:w-full transition-all duration-300"
                  ></motion.div>
                </div>

                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Can't find what you're looking for?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const event = new CustomEvent('openChatWithMessage', {
                detail: { message: 'Help me find the perfect jewelry piece' }
              });
              window.dispatchEvent(event);
            }}
            className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Ask Our AI Assistant
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ShopByOccasion;
