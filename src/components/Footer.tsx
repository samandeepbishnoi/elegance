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
              <span className="font-serif text-2xl font-bold">Parika Jewels</span>
            </div>
            <p className="text-gray-300 mb-4">
              Premium and exclusive imitation jewellery wholesaler. Serving retailers and bulk buyers with high-quality designs at competitive wholesale prices. Worldwide shipping available with online payment accepted.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gold-500" />
                <span className="text-gray-300">+91 9896076856</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gold-500" />
                <span className="text-gray-300">info@parikajewels.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gold-500" />
                <span className="text-gray-300">India | Worldwide Shipping</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <div className="space-y-2">
              <p className="text-gray-300 hover:text-gold-500 cursor-pointer">Wholesale Orders</p>
              <p className="text-gray-300 hover:text-gold-500 cursor-pointer">Bulk Purchasing</p>
              <p className="text-gray-300 hover:text-gold-500 cursor-pointer">Worldwide Shipping</p>
              <p className="text-gray-300 hover:text-gold-500 cursor-pointer">Online Payment</p>
              <p className="text-gray-300 hover:text-gold-500 cursor-pointer">Retailer Support</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © Parika Jewels. All rights reserved. | Premium Imitation Jewellery Wholesaler
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;