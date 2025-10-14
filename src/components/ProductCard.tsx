import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { dispatch: cartDispatch } = useCart();
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();

  const isInWishlist = wishlistState.items.some(item => item._id === product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.inStock) {
      cartDispatch({ type: 'ADD_ITEM', payload: product });
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist) {
      wishlistDispatch({ type: 'REMOVE_ITEM', payload: product._id });
    } else {
      wishlistDispatch({ type: 'ADD_ITEM', payload: product });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Out of Stock
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full shadow-md transition-colors duration-200 ${
                isInWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gold-100 text-gold-700 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-2 capitalize">{product.category}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gold-600">
              ₹{product.price.toLocaleString()}
            </span>
            
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`p-2 rounded-full transition-colors duration-200 ${
                product.inStock
                  ? 'bg-gold-500 text-white hover:bg-gold-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;