import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import { Search, Sparkles } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  description: string;
  inStock: boolean;
}

const Homepage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([1, 500000]);
  const [showFilters, setShowFilters] = useState(false);


  useEffect(() => {
    // Fetch products from backend
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error: any) {
        setProducts([]);
        setFilteredProducts([]);
        alert('Error fetching products: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => product.tags.includes(tag));
      
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesTags && matchesPrice;
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, selectedTags, priceRange]);

  const categories = [...new Set(products.map(p => p.category))];
  const tags = [...new Set(products.flatMap(p => p.tags))];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedTags([]);
    setPriceRange([1, 500000]);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gold-50 to-gold-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
            Exquisite Jewelry Collection
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Discover timeless elegance with our carefully curated selection of premium jewelry pieces
          </p>
          <div className="flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-gold-500 mr-2" />
            <span className="text-gold-700 font-medium">Handcrafted with Love</span>
            <Sparkles className="h-6 w-6 text-gold-500 ml-2" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  

        {/* Mobile Filter Toggle */}
        <div className="mt-6 lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-gold-500 text-white py-3 rounded-lg font-medium"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24">
              <ProductFilters
                categories={categories}
                tags={tags}
                selectedCategory={selectedCategory}
                selectedTags={selectedTags}
                priceRange={priceRange}
                onCategoryChange={handleCategoryChange}
                onTagChange={handleTagChange}
                onPriceRangeChange={handlePriceRangeChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Our Collection
              </h2>
              <span className="text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 bg-gold-500 text-white px-6 py-2 rounded-lg hover:bg-gold-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;