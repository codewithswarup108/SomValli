import React, { createContext, useContext, useState, useEffect } from 'react';

export type CartItem = {
  id: string;
  _id?: string;
  productId?: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  countInStock?: number;
  description?: string;
  variant?: string;
  selectedSize?: string;
  productVariants?: { size?: string; label?: string; price: number; available: boolean }[];
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  updateVariant: (id: string, variant: { size: string; price: number }) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  const addToCart = (item: any) => {
    const baseId = String(item._id || item.id);
    const variantKey = item.variant ? `::${item.variant}` : '';
    const itemId = `${baseId}${variantKey}`;
    const newPrice = Number(item.price);

    setCartItems(prev => {
      const existingIndex = prev.findIndex(i => String(i._id || i.id) === itemId || `${String(i._id || i.id)}${i.variant ? `::${i.variant}` : ''}` === itemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const addQty = item.qty || 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          _id: itemId,
          id: itemId,
          productId: item.productId || baseId,
          name: item.name || updated[existingIndex].name,
          price: newPrice,
          qty: updated[existingIndex].qty + addQty,
          image: item.image || updated[existingIndex].image,
          countInStock: item.countInStock ?? updated[existingIndex].countInStock,
          description: item.description || updated[existingIndex].description,
          variant: item.variant || updated[existingIndex].variant,
          selectedSize: item.variant || updated[existingIndex].selectedSize,
          productVariants: item.variants || updated[existingIndex].productVariants,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: itemId,
          _id: itemId,
          productId: baseId,
          name: item.name,
          price: newPrice,
          qty: item.qty || 1,
          image: item.image,
          countInStock: Number.isFinite(Number(item.countInStock)) ? Number(item.countInStock) : undefined,
          description: item.description,
          variant: item.variant,
          selectedSize: item.variant,
          productVariants: Array.isArray(item.variants) ? item.variants : undefined,
        }
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    const targetId = String(id);
    setCartItems(prev => prev.filter(i => String(i._id || i.id) !== targetId));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    const targetId = String(id);
    setCartItems(prev =>
      prev.map(i => {
        if (String(i._id || i.id) !== targetId) return i;
        const maxQuantity = Number.isFinite(i.countInStock) ? Math.max(1, i.countInStock!) : qty;
        return { ...i, qty: Math.min(qty, maxQuantity) };
      })
    );
  };

  const updateVariant = (id: string, variant: { size: string; price: number }) => {
    const targetId = String(id);
    setCartItems(prev => {
      const current = prev.find(item => String(item._id || item.id) === targetId);
      if (!current) return prev;
      const productId = current.productId || String(current._id || current.id).split('::')[0];
      const nextId = `${productId}::${variant.size}`;
      const existing = prev.find(item => String(item._id || item.id) === nextId && String(item._id || item.id) !== targetId);
      if (existing) {
        return prev
          .filter(item => String(item._id || item.id) !== targetId)
          .map(item => String(item._id || item.id) === nextId ? { ...item, qty: item.qty + current.qty } : item);
      }
      return prev.map(item => String(item._id || item.id) === targetId ? {
        ...item,
        id: nextId,
        _id: nextId,
        productId,
        name: item.name.replace(/\s+\([^)]*\)$/, '') + ` (${variant.size})`,
        variant: variant.size,
        selectedSize: variant.size,
        price: variant.price,
      } : item);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateVariant,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
