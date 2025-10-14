const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const MAX_RECENTLY_VIEWED = 10;

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export const addToRecentlyViewed = (product: Product): void => {
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter(p => p._id !== product._id);
    const updated = [product, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
  }
};

export const getRecentlyViewed = (): Product[] => {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
};

export const clearRecentlyViewed = (): void => {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
  }
};
