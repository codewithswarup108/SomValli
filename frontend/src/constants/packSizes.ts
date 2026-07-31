export const AVAILABLE_PACK_SIZES = ['20g', '50g', '100g', '150g', '250g', '500g', '1kg'] as const;

export type PackSize = typeof AVAILABLE_PACK_SIZES[number];

export type ProductVariant = {
  size: string;
  price: number;
  available: boolean;
  label?: string;
};

export const getProductVariants = (product: any): ProductVariant[] => {
  if (Array.isArray(product?.variants) && product.variants.length > 0) {
    return product.variants.map((variant: any) => ({
      ...variant,
      size: variant.size || variant.label,
      available: variant.available !== false,
      price: Number(variant.price) || 0,
    }));
  }

  return [{ size: '250g', price: Number(product?.price) || 0, available: true }];
};

export const getAvailableProductVariants = (product: any): ProductVariant[] =>
  getProductVariants(product).filter(variant => variant.available);