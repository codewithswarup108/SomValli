import React from 'react';
import { motion } from 'framer-motion';
import type { ProductVariant } from '../../constants/packSizes';

type VariantSelectorProps = {
  variants: ProductVariant[];
  selectedVariant?: string;
  onVariantChange: (size: string) => void;
  label?: string;
};

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantChange,
  label = 'Choose Pack Size',
}) => {
  const availableVariants = variants.filter(variant => variant.available);

  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-600">{label}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label={label}>
        {availableVariants.map(variant => {
          const isSelected = variant.size === selectedVariant;
          return (
            <motion.button
              key={variant.size}
              type="button"
              role="radio"
              aria-checked={isSelected}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onVariantChange(variant.size)}
              className={`min-h-12 rounded-2xl border px-3 py-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-accent bg-gradient-to-br from-accent to-[#f4c56a] text-white shadow-[0_8px_22px_rgba(210,145,35,0.3)] scale-[1.03]'
                  : 'border-accent/60 bg-white text-primary hover:border-accent hover:shadow-[0_6px_16px_rgba(210,145,35,0.18)]'
              }`}
            >
              <span className="block text-sm font-black">{variant.size}</span>
              <span className={`block text-[11px] font-bold ${isSelected ? 'text-white/90' : 'text-accent'}`}>
                ₹{variant.price.toFixed(2)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(VariantSelector);
