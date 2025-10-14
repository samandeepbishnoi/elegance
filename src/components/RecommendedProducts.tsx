import { Product } from '../context/StoreContext';
import ProductCard from './ProductCard';

interface RecommendedProductsProps {
  products: Product[];
}

export default function RecommendedProducts({ products }: RecommendedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-12">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
