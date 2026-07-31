const AVAILABLE_PACK_SIZES = ['20g', '50g', '100g', '150g', '250g', '500g', '1kg'];

const normalizeVariants = (variants, legacyPrice = 0) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return [{ size: '250g', price: Number(legacyPrice), available: true }];
  }

  const seen = new Set();
  return variants.map((variant) => {
    const size = String(variant.size || variant.label || '').trim();
    if (!size) {
      throw new Error('Invalid pack size: empty');
    }
    if (!AVAILABLE_PACK_SIZES.includes(size) && !/^\d+(?:\.\d+)?g$/i.test(size)) {
      throw new Error(`Custom pack size must be specified in grams, for example 750g: ${size}`);
    }
    if (seen.has(size)) {
      throw new Error(`Duplicate pack size: ${size}`);
    }
    seen.add(size);

    const available = variant.available !== false;
    const price = Number(variant.price);
    if (available && (!Number.isFinite(price) || price < 0)) {
      throw new Error(`A non-negative price is required for ${size}`);
    }

    return { size, price: Number.isFinite(price) && price >= 0 ? price : 0, available };
  });
};

module.exports = { AVAILABLE_PACK_SIZES, normalizeVariants };