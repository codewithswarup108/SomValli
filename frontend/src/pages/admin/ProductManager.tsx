import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/admin/Sidebar';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AVAILABLE_PACK_SIZES } from '../../constants/packSizes';
import { BASE_API_URL } from '../../utils/api';

type Product = {
  _id: string;
  name: string;
  price: number;
  shopPrice?: number;
  retailPrice?: number;
  description: string;
  image: string;
  category: string;
  countInStock: number;
  rating?: number;
  numReviews?: number;
  createdAt?: string;
  variants?: { size: string; price: number; available: boolean }[];
};

type FormVariant = { size: string; price: string; available: boolean };

type ProductFormData = {
  name: string;
  price: string;
  retailPrice: string;
  shopPrice: string;
  description: string;
  image: string;
  category: string;
  customCategory: string;
  countInStock: string;
  variants: FormVariant[];
};

const DEFAULT_CATEGORIES = ['Masala Tea', 'Sweets & Laddoos', 'Biscuits & Cookies', 'Chocolates', 'Healthy Snacks', 'Spices', 'General'];

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Add / Edit Modal state
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [localImageName, setLocalImageName] = useState('');

  // Form State
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    retailPrice: '',
    shopPrice: '',
    description: '',
    image: '',
    category: 'Masala Tea',
    customCategory: '',
    countInStock: '100',
    variants: [
      ...AVAILABLE_PACK_SIZES.map(size => ({ size, price: '', available: false })),
    ],
  });

  const apiBase = BASE_API_URL;

  const handleLocalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please choose an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = reader.result;
      if (typeof image === 'string') {
        setFormData(prev => ({ ...prev, image }));
        setLocalImageName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/products`, { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Could not load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      retailPrice: '',
      shopPrice: '',
      description: '',
      image: '',
      category: 'Masala Tea',
      customCategory: '',
      countInStock: '100',
      variants: AVAILABLE_PACK_SIZES.map(size => ({ size, price: '', available: false })),
    });
    setModalMode('create');
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    const isStandardCat = DEFAULT_CATEGORIES.includes(product.category);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      retailPrice: (product.retailPrice ?? product.price).toString(),
      shopPrice: (product.shopPrice ?? product.price).toString(),
      description: product.description,
      image: product.image,
      category: isStandardCat ? product.category : 'Other',
      customCategory: isStandardCat ? '' : product.category,
      countInStock: product.countInStock.toString(),
      variants: [
        ...AVAILABLE_PACK_SIZES.map(size => {
        const current = product.variants?.find((variant: any) => (variant.size || variant.label) === size);
        return { size, price: current?.price?.toString?.() ?? '', available: current?.available === true };
        }),
        ...(product.variants || [])
          .filter((variant: any) => !AVAILABLE_PACK_SIZES.includes(variant.size || variant.label))
          .map((variant: any) => ({
            size: variant.size || variant.label,
            price: variant.price?.toString?.() ?? '',
            available: variant.available !== false,
          })),
      ],
    });
    setModalMode('edit');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = formData.category === 'Other' ? formData.customCategory.trim() : formData.category;

    const enabledVariants = formData.variants.filter(variant => variant.available);
    if (!formData.name.trim() || !formData.image.trim() || !finalCategory || enabledVariants.length === 0) {
      toast.error('Please complete the product details and enable at least one priced pack size.');
      return;
    }

    if (enabledVariants.some(variant => variant.price === '' || Number(variant.price) < 0 || !Number.isFinite(Number(variant.price)))) {
      toast.error('Every enabled pack size must have a non-negative price.');
      return;
    }

    const normalizedSizes = formData.variants.map(variant => variant.size.trim().toLowerCase());
    if (normalizedSizes.some(size => !size) || new Set(normalizedSizes).size !== normalizedSizes.length) {
      toast.error('Pack sizes must be unique and cannot be empty.');
      return;
    }

    const invalidCustomSize = normalizedSizes.find(size => !AVAILABLE_PACK_SIZES.includes(size as any) && !/^\d+(?:\.\d+)?g$/.test(size));
    if (invalidCustomSize) {
      toast.error('Custom sizes must be entered in grams, for example 750g.');
      return;
    }

    setSubmitting(true);
    try {
      const numPrice = Number(enabledVariants[0].price);
      const payload = {
        name: formData.name.trim(),
        price: numPrice,
        retailPrice: formData.retailPrice ? Number(formData.retailPrice) : numPrice,
        shopPrice: formData.shopPrice ? Number(formData.shopPrice) : numPrice,
        description: formData.description.trim(),
        image: formData.image.trim(),
        category: finalCategory,
        countInStock: Number(formData.countInStock) || 0,
        variants: formData.variants.map((v: any) => ({ size: v.size, price: v.available ? Number(v.price) : 0, available: !!v.available })),
      };

      const url = modalMode === 'edit' && editingProduct 
        ? `${apiBase}/api/products/${editingProduct._id}`
        : `${apiBase}/api/products`;

      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save product');

      toast.success(modalMode === 'edit' ? `"${data.name}" pack prices updated!` : `New product "${data.name}" created!`);
      
      if (modalMode === 'create') {
        setProducts(prev => [data, ...prev]);
      } else {
        setProducts(prev => prev.map(p => (p._id === data._id ? data : p)));
      }

      setModalMode(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`${apiBase}/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(`"${name}" removed from catalog.`);
        setProducts(prev => prev.filter(p => p._id !== id));
      } else {
        toast.error('Failed to delete product.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting product.');
    }
  };

  const categoriesInStore = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-poppins text-primary">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-playfair font-black text-primary">SomValli Products Catalog</h1>
            <p className="text-sm text-gray-500 mt-1">Manage, add, edit prices, and delete store items seamlessly.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 bg-gray-200 text-primary px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-300 transition-colors"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-accent text-primary px-5 py-2.5 rounded-xl text-xs font-black hover:scale-105 transition-transform shadow-md"
            >
              <FiPlus size={16} /> Add New Product
            </button>
          </div>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categoriesInStore.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-accent shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat} ({cat === 'All' ? products.length : products.filter(p => p.category === cat).length})
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search product name, category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-500 font-bold">Loading SomValli catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No products found. Click "Add New Product" to list an item!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Catalog Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredProducts.map(product => (
                    <tr key={product._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-primary font-playfair text-base">{product.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">{product.description}</p>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                          {product.category}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-black text-accent text-base block">{product.variants?.filter(variant => variant.available).map(variant => `${variant.size}: ₹${variant.price}`).join(' | ') || `₹${product.price.toFixed(2)}`}</span>
                        {product.retailPrice && (
                          <span className="text-[11px] text-gray-400 font-semibold block">Retail: ₹{product.retailPrice}</span>
                        )}
                      </td>

                      <td className="p-4">
                        {product.countInStock > 0 ? (
                          <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold">
                            In Stock ({product.countInStock})
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-bold">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2.5 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5"
                            title="Edit product details and pack prices"
                          >
                            <FiEdit2 size={15} /> Edit Price
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="p-2.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5"
                            title="Delete product"
                          >
                            <FiTrash2 size={15} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add / Edit Product Modal */}
        <AnimatePresence>
          {modalMode && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalMode(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white w-full max-w-xl max-h-[calc(100vh-2rem)] rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-200 font-poppins flex flex-col"
              >
                {/* Header */}
                <div className="bg-primary text-cream p-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-accent">
                      {modalMode === 'edit' ? 'Edit Product & Pack Prices' : 'Add New SomValli Product'}
                    </h2>
                    <p className="text-xs text-cream/70 mt-1">
                      {modalMode === 'edit' ? 'Modifications save directly to database & update storefront cart instantly' : 'List a new item in your online store'}
                    </p>
                  </div>
                  <button onClick={() => setModalMode(null)} className="text-cream hover:text-accent p-2">
                    <FiX size={24} />
                  </button>
                </div>

                {/* Variant editor (moved out of header) */}
                <div className="p-6 border-b border-gray-100 bg-white shrink-0 max-h-[38vh] overflow-y-auto">
                  <label className="block text-xs font-bold text-primary uppercase mb-1">Available Pack Sizes</label>
                  <div className="grid gap-2">
                    {formData.variants.map((v: any, idx: number) => (
                      <div key={`variant-row-${idx}`} className="grid grid-cols-[minmax(5rem,1fr)_minmax(8rem,10rem)] sm:flex items-center gap-3 border-b border-gray-100 py-2">
                        <label className="flex items-center gap-2 text-sm font-bold min-w-24">
                          <input
                            type="checkbox"
                            checked={v.available}
                            onChange={e => setFormData(prev => ({ ...prev, variants: prev.variants.map((it: any, i: number) => i === idx ? { ...it, available: e.target.checked } : it) }))}
                          />
                          {AVAILABLE_PACK_SIZES.includes(v.size) ? v.size : (
                            <input
                              type="text"
                              value={v.size}
                              onChange={e => setFormData(prev => ({ ...prev, variants: prev.variants.map((it: any, i: number) => i === idx ? { ...it, size: e.target.value } : it) }))}
                              placeholder="e.g. 750g"
                              className="w-28 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm font-bold"
                              aria-label="Custom pack size"
                            />
                          )}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder={v.available ? 'Price required' : 'Disabled'}
                          value={v.price}
                          disabled={!v.available}
                          onChange={e => setFormData(prev => ({ ...prev, variants: prev.variants.map((it: any, i: number) => i === idx ? { ...it, price: e.target.value } : it) }))}
                          className="w-full sm:w-32 bg-gray-50 border border-gray-200 rounded-xl p-2 text-sm disabled:opacity-40"
                        />
                        {!AVAILABLE_PACK_SIZES.includes(v.size) && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }))}
                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                            title="Remove custom size"
                            aria-label={`Remove ${v.size || 'custom'} size`}
                          >
                            <FiTrash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        variants: [...prev.variants, { size: '750g', price: '', available: true }],
                      }))}
                      className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-cream transition-colors hover:bg-secondary"
                    >
                      + Add Custom Size
                    </button>
                    <p className="text-xs text-gray-500">Enable a standard or custom pack size and set its price.</p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleFormSubmit} className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. SomValli Special Masala Chai, Dark Artisan Chocolate"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="rounded-2xl border border-accent/20 bg-amber-50/50 p-4 text-xs text-gray-600">
                    Pack prices above are the customer prices. The first enabled pack is retained as the legacy base price for older records.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase mb-1">Category *</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-accent font-bold"
                      >
                        {DEFAULT_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="Other">+ Add Custom Category...</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary uppercase mb-1">Count In Stock</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.countInStock}
                        onChange={e => setFormData({ ...formData, countInStock: e.target.value })}
                        placeholder="100"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-accent"
                      />
                      <p className="mt-1 text-[11px] text-gray-500">Customers can select up to this quantity. Use 0 to mark out of stock.</p>
                    </div>
                  </div>

                  {formData.category === 'Other' && (
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase mb-1">Custom Category Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.customCategory}
                        onChange={e => setFormData({ ...formData, customCategory: e.target.value })}
                        placeholder="e.g. Spices, Sweets, Drinks"
                        className="w-full bg-amber-50 border border-amber-300 rounded-xl p-3 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase mb-1">Image URL / Upload *</label>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <input
                        type="url"
                        required={!formData.image.startsWith('data:')}
                        value={formData.image.startsWith('data:') ? '' : formData.image}
                        onChange={e => {
                          setFormData(prev => ({ ...prev, image: e.target.value }));
                          setLocalImageName('');
                        }}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-accent"
                      />
                      <label className="cursor-pointer inline-flex items-center justify-center bg-primary text-cream rounded-xl px-4 py-3 text-sm font-bold hover:bg-accent transition-colors">
                        Upload File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLocalImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Choose a local image file or paste an image URL. Local files are converted to a preview-friendly data URL.</p>
                    {formData.image && (
                      <div className="mt-2 flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                        <img src={formData.image} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Image Preview</p>
                          {localImageName && <p className="text-[11px] text-gray-400">{localImageName}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase mb-1">Product Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the authentic taste, ingredients, and rich features of this SomValli product..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setModalMode(null)}
                      className="w-1/3 bg-gray-100 hover:bg-gray-200 text-primary py-3 rounded-xl font-bold text-xs uppercase"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-2/3 bg-accent hover:opacity-90 text-primary py-3 rounded-xl font-black text-xs uppercase transition-all shadow-md disabled:opacity-50"
                    >
                      {submitting ? 'Saving to Database...' : modalMode === 'edit' ? 'Update Database Price' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProductManager;
