import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Wishlist: React.FC = () => {
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
  const { dispatch: cartDispatch } = useCart();

  const removeFromWishlist = (id: string) => {
    wishlistDispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const addToCart = (item: any) => {
    cartDispatch({ type: 'ADD_ITEM', payload: item });
  };

  if (wishlistState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-600 mb-8">
            Save your favorite jewelry pieces to your wishlist and never lose track of them!
          </p>
          <Link
            to="/"
            className="bg-gold-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors inline-block"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            My Wishlist
          </h1>
          <span className="text-gray-600">
            {wishlistState.items.length} item{wishlistState.items.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistState.items.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden group">
              <Link to={`/product/${item._id}`}>
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromWishlist(item._id);
                      }}
                      className="p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                </div>
              </Link>
              
              <div className="p-4">
                <Link to={`/product/${item._id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 capitalize">{item.category}</p>
                  <p className="text-2xl font-bold text-gold-600 mb-4">
                    ₹{item.price.toLocaleString()}
                  </p>
                </Link>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => addToCart(item)}
                    className="flex-1 bg-gold-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gold-600 transition-colors flex items-center justify-center"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;