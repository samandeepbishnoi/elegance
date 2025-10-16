export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB);
}

export function getProductText(product) {
  const tags = Array.isArray(product.tags) ? product.tags.join(' ') : '';
  return `${product.name || ''} ${product.category || ''} ${product.material || ''} ${tags} ${product.description || ''}`.toLowerCase();
}

/**
 * Calculate weighted similarity between two products
 * Prioritizes: 1) Material match, 2) Tags match, 3) Other attributes
 */
export function calculateWeightedSimilarity(targetProduct, comparisonProduct, tfidf, targetIndex, comparisonIndex) {
  // Calculate category match (exact match bonus)
  const categoryMatch = targetProduct.category === comparisonProduct.category ? 1 : 0;
  
  // Calculate material match (highest priority)
  const materialMatch = (targetProduct.material && comparisonProduct.material && 
                         targetProduct.material.toLowerCase() === comparisonProduct.material.toLowerCase()) ? 1 : 0;
  
  // Calculate tags overlap (second priority)
  const targetTags = Array.isArray(targetProduct.tags) ? targetProduct.tags.map(t => t.toLowerCase()) : [];
  const comparisonTags = Array.isArray(comparisonProduct.tags) ? comparisonProduct.tags.map(t => t.toLowerCase()) : [];
  
  const commonTags = targetTags.filter(tag => comparisonTags.includes(tag));
  const tagsScore = targetTags.length > 0 ? commonTags.length / targetTags.length : 0;
  
  // Calculate TF-IDF cosine similarity for text content
  const targetTerms = tfidf.listTerms(targetIndex);
  const targetVector = targetTerms.map(t => t.tfidf);
  
  const productTerms = tfidf.listTerms(comparisonIndex);
  const productVector = productTerms.map(t => t.tfidf);
  
  const maxLength = Math.max(targetVector.length, productVector.length);
  const paddedTargetVector = [...targetVector, ...Array(maxLength - targetVector.length).fill(0)];
  const paddedProductVector = [...productVector, ...Array(maxLength - productVector.length).fill(0)];
  
  const textSimilarity = cosineSimilarity(paddedTargetVector, paddedProductVector);
  
  // Weighted combination with emphasis on material and tags
  // Material: 40%, Tags: 30%, Category: 15%, Text similarity: 15%
  const weightedScore = (materialMatch * 0.40) + 
                        (tagsScore * 0.30) + 
                        (categoryMatch * 0.15) + 
                        (textSimilarity * 0.15);
  
  return weightedScore;
}
