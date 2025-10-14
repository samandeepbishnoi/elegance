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
