import React from 'react';
import { Crown, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="h-8 w-8 text-gold-500" />
              <span className="font-serif text-2xl font-bold">Elegance</span>
            </div>
            <p className="text-gray-300 mb-4">
              Discover exquisite jewelry crafted with precision and passion. From timeless classics to contemporary designs, we bring you the finest collection of jewelry for every occasion.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gold-500" />
                <span className="text-gray-300">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gold-500" />
                <span className="text-gray-300">info@elegancejewelry.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gold-500" />
                <span className="text-gray-300">123 Jewelry Street, Mumbai</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              <p className="text-gray-300 hover:text-gold-500 cursor-pointer">Rings</p>
              <p className="text-gray-300 hover:text-gold-500 cursor-pointer">Necklaces</p>
              <p className="text-gray-300 hover:text-gold-500 cursor-pointer">Earrings</p>
              <p className="text-gray-300 hover:text-gold-500 cursor-pointer">Bracelets</p>
              <p className="text-gray-300 hover:text-gold-500 cursor-pointer">Bridal Collection</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 Elegance Jewelry. All rights reserved. | Crafted with ❤️ for jewelry lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;