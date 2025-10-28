import Discount from '../models/Discount.js';

/**
 * Calculate the best applicable discount for a product
 * Priority: Product-specific > Category > Global
 * @param {Object} product - Product object with _id, category, price, discountType, discountValue
 * @param {Array} allDiscounts - Optional array of all active discounts (to avoid repeated DB queries)
 * @returns {Object} Discount calculation result
 */
export async function calculateProductDiscount(product, allDiscounts = null) {
  try {
    const now = new Date();
    
    // If discounts array not provided, fetch from database
    let activeDiscounts = allDiscounts;
    
    if (!activeDiscounts) {
      activeDiscounts = await Discount.find({
        isActive: true,
        $or: [
          { startDate: null },
          { startDate: { $lte: now } }
        ],
        $or: [
          { endDate: null },
          { endDate: { $gte: now } }
        ]
      }).sort({ priority: -1 });
    }
    
    // Filter valid discounts only
    activeDiscounts = activeDiscounts.filter(discount => {
      if (!discount.isActive) return false;
      if (discount.startDate && now < new Date(discount.startDate)) return false;
      if (discount.endDate && now > new Date(discount.endDate)) return false;
      return true;
    });
    
    let bestDiscount = null;
    let maxDiscountAmount = 0;
    
    // Check product-specific discount from product schema (highest priority)
    if (product.discountType && product.discountType !== 'none' && product.discountValue > 0) {
      let productDiscountAmount = 0;
      
      if (product.discountType === 'percentage') {
        productDiscountAmount = (product.price * product.discountValue) / 100;
      } else if (product.discountType === 'flat') {
        productDiscountAmount = Math.min(product.discountValue, product.price);
      }
      
      if (productDiscountAmount > maxDiscountAmount) {
        maxDiscountAmount = productDiscountAmount;
        bestDiscount = {
          type: 'product-inline',
          discountType: product.discountType,
          discountValue: product.discountValue,
          name: 'Product Discount',
          scope: 'product'
        };
      }
    }
    
    // Check product-specific discounts from Discount collection
    const productDiscounts = activeDiscounts.filter(
      d => d.scope === 'product' && 
      d.productId && 
      d.productId.toString() === product._id.toString()
    );
    
    for (const discount of productDiscounts) {
      const amount = calculateDiscountAmount(product.price, discount.discountType, discount.discountValue);
      if (amount > maxDiscountAmount) {
        maxDiscountAmount = amount;
        bestDiscount = discount;
      }
    }
    
    // Check category discounts
    const categoryDiscounts = activeDiscounts.filter(
      d => d.scope === 'category' && d.category === product.category
    );
    
    for (const discount of categoryDiscounts) {
      const amount = calculateDiscountAmount(product.price, discount.discountType, discount.discountValue);
      if (amount > maxDiscountAmount) {
        maxDiscountAmount = amount;
        bestDiscount = discount;
      }
    }
    
    // Check global discounts (lowest priority)
    const globalDiscounts = activeDiscounts.filter(d => d.scope === 'global');
    
    for (const discount of globalDiscounts) {
      const amount = calculateDiscountAmount(product.price, discount.discountType, discount.discountValue);
      if (amount > maxDiscountAmount) {
        maxDiscountAmount = amount;
        bestDiscount = discount;
      }
    }
    
    // Return the calculation result
    if (bestDiscount) {
      const discountAmount = Math.min(maxDiscountAmount, product.price);
      const finalPrice = Math.max(0, product.price - discountAmount);
      const discountPercentage = product.price > 0 
        ? ((discountAmount / product.price) * 100).toFixed(2)
        : 0;
      
      return {
        hasDiscount: true,
        discount: bestDiscount,
        originalPrice: product.price,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        discountPercentage: parseFloat(discountPercentage),
        discountLabel: getDiscountLabel(bestDiscount)
      };
    }
    
    // No discount applicable
    return {
      hasDiscount: false,
      discount: null,
      originalPrice: product.price,
      discountAmount: 0,
      finalPrice: product.price,
      discountPercentage: 0,
      discountLabel: null
    };
    
  } catch (error) {
    console.error('Error calculating product discount:', error);
    // Return product without discount on error
    return {
      hasDiscount: false,
      discount: null,
      originalPrice: product.price,
      discountAmount: 0,
      finalPrice: product.price,
      discountPercentage: 0,
      discountLabel: null,
      error: error.message
    };
  }
}

/**
 * Calculate discount amount based on type and value
 */
function calculateDiscountAmount(price, discountType, discountValue) {
  if (discountType === 'percentage') {
    return (price * discountValue) / 100;
  } else if (discountType === 'flat') {
    return Math.min(discountValue, price);
  }
  return 0;
}

/**
 * Get user-friendly discount label
 */
function getDiscountLabel(discount) {
  if (!discount) return null;
  
  if (discount.discountType === 'percentage') {
    return `${discount.discountValue}% OFF`;
  } else if (discount.discountType === 'flat') {
    return `₹${discount.discountValue} OFF`;
  }
  
  return 'DISCOUNT';
}

/**
 * Calculate discounts for multiple products
 * More efficient than calling calculateProductDiscount multiple times
 */
export async function calculateProductsDiscounts(products) {
  try {
    const now = new Date();
    
    // Fetch all active discounts once
    const activeDiscounts = await Discount.find({
      isActive: true,
      $or: [
        { startDate: null },
        { startDate: { $lte: now } }
      ],
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    }).sort({ priority: -1 });
    
    // Calculate discount for each product
    const productsWithDiscounts = await Promise.all(
      products.map(product => calculateProductDiscount(product, activeDiscounts))
    );
    
    return productsWithDiscounts;
    
  } catch (error) {
    console.error('Error calculating products discounts:', error);
    // Return products without discounts on error
    return products.map(product => ({
      hasDiscount: false,
      discount: null,
      originalPrice: product.price,
      discountAmount: 0,
      finalPrice: product.price,
      discountPercentage: 0,
      discountLabel: null
    }));
  }
}

/**
 * Calculate total cart discount
 */
export async function calculateCartDiscount(cartItems) {
  try {
    let totalOriginalPrice = 0;
    let totalFinalPrice = 0;
    let totalDiscountAmount = 0;
    
    const itemsWithDiscounts = [];
    
    for (const item of cartItems) {
      const discountInfo = await calculateProductDiscount(item.product || item);
      const quantity = item.quantity || 1;
      
      const itemTotal = {
        product: item.product || item,
        quantity,
        originalPricePerUnit: discountInfo.originalPrice,
        finalPricePerUnit: discountInfo.finalPrice,
        discountPerUnit: discountInfo.discountAmount,
        originalTotal: discountInfo.originalPrice * quantity,
        finalTotal: discountInfo.finalPrice * quantity,
        discountTotal: discountInfo.discountAmount * quantity,
        discountLabel: discountInfo.discountLabel,
        hasDiscount: discountInfo.hasDiscount
      };
      
      itemsWithDiscounts.push(itemTotal);
      
      totalOriginalPrice += itemTotal.originalTotal;
      totalFinalPrice += itemTotal.finalTotal;
      totalDiscountAmount += itemTotal.discountTotal;
    }
    
    return {
      items: itemsWithDiscounts,
      totalOriginalPrice: parseFloat(totalOriginalPrice.toFixed(2)),
      totalFinalPrice: parseFloat(totalFinalPrice.toFixed(2)),
      totalDiscountAmount: parseFloat(totalDiscountAmount.toFixed(2)),
      totalSavingsPercentage: totalOriginalPrice > 0 
        ? parseFloat(((totalDiscountAmount / totalOriginalPrice) * 100).toFixed(2))
        : 0
    };
    
  } catch (error) {
    console.error('Error calculating cart discount:', error);
    throw error;
  }
}

/**
 * Get all categories that have active discounts
 */
export async function getCategoriesWithDiscounts() {
  try {
    const now = new Date();
    
    const categoryDiscounts = await Discount.find({
      scope: 'category',
      isActive: true,
      $or: [
        { startDate: null },
        { startDate: { $lte: now } }
      ],
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    }).distinct('category');
    
    return categoryDiscounts;
    
  } catch (error) {
    console.error('Error getting categories with discounts:', error);
    return [];
  }
}
