const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/productModel');

dotenv.config();

const officialSomvalliProducts = [
  {
    name: 'SomValli Premium Masala Tea',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800',
    description: 'Aromatic | Rich Flavour | Traditional Taste. Crafted with premium handpicked tea leaves and authentic ground cardamom, ginger, and cloves.',
    category: 'Masala Tea',
    price: 395,
    retailPrice: 395,
    shopPrice: 355,
    packSizes: ['250g', '500g', '1kg'],
    countInStock: 250,
    rating: 5.0,
    numReviews: 148
  },
  {
    name: 'Premium Quality Dry Fruit Laddoos',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=800',
    description: 'Rich in Dry Fruits | Traditional Sweetness | Premium Quality. Handcrafted laddoos packed with almonds, cashews, pistachios, and pure ghee.',
    category: 'Sweets & Laddoos',
    price: 1500,
    retailPrice: 1500,
    shopPrice: 1300,
    packSizes: ['250g', '500g', '1kg'],
    countInStock: 180,
    rating: 4.9,
    numReviews: 96
  },
  {
    name: 'Chocolate Flavoured Biscuits',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800',
    description: 'Crispy | Delicious | Chocolate Delight. Oven baked crunchy dark chocolate biscuits baked with rich cocoa.',
    category: 'Biscuits & Cookies',
    price: 450,
    retailPrice: 450,
    shopPrice: 360,
    packSizes: ['250g', '500g', '1kg'],
    countInStock: 300,
    rating: 4.8,
    numReviews: 112
  },
  {
    name: 'Pista Chocolate',
    image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=800',
    description: 'Rich Pistachio Goodness in Smooth Chocolate. Gourmet dark cocoa infused with crunchy roasted pistachios.',
    category: 'Chocolates',
    price: 750,
    retailPrice: 750,
    shopPrice: 680,
    packSizes: ['250g', '500g', '1kg'],
    countInStock: 150,
    rating: 5.0,
    numReviews: 87
  },
  {
    name: 'Badam Chocolate',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800',
    description: 'Rich Almond Goodness in Smooth Chocolate. Slow roasted California almonds embedded in smooth silky chocolate.',
    category: 'Chocolates',
    price: 750,
    retailPrice: 750,
    shopPrice: 680,
    packSizes: ['250g', '500g', '1kg'],
    countInStock: 160,
    rating: 4.9,
    numReviews: 74
  },
  {
    name: 'Premium Biscuits',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800',
    description: 'Crispy oven-baked traditional butter biscuits, perfect companion for your morning SomValli Masala Tea.',
    category: 'Biscuits & Cookies',
    price: 320,
    retailPrice: 320,
    shopPrice: 280,
    packSizes: ['250g', '500g', '1kg'],
    countInStock: 220,
    rating: 4.7,
    numReviews: 65
  },
  {
    name: 'Peanut Chikki',
    image: 'https://images.unsplash.com/photo-1536591375315-198956582373?q=80&w=800',
    description: 'Traditional crunchy peanut brittle made with pure organic jaggery and golden roasted peanuts.',
    category: 'Sweets & Laddoos',
    price: 280,
    retailPrice: 280,
    shopPrice: 240,
    packSizes: ['250g', '500g', '1kg'],
    countInStock: 250,
    rating: 4.8,
    numReviews: 92
  },
  {
    name: 'Protein Bars',
    image: 'https://images.unsplash.com/photo-1622484210800-8851b576f9d2?q=80&w=800',
    description: 'Wholesome natural energy protein bar crafted with dates, seeds, dry fruits, and pure honey.',
    category: 'Healthy Snacks',
    price: 499,
    retailPrice: 499,
    shopPrice: 420,
    packSizes: ['250g', '500g', '1kg'],
    countInStock: 140,
    rating: 4.9,
    numReviews: 53
  },
  {
    name: 'Premium Peanut Laddoos',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800',
    description: 'Melt-in-mouth traditional peanut laddoos prepared with roasted peanuts and pure jaggery.',
    category: 'Sweets & Laddoos',
    price: 380,
    retailPrice: 380,
    shopPrice: 320,
    packSizes: ['250g', '500g', '1kg'],
    countInStock: 190,
    rating: 4.8,
    numReviews: 81
  },
  {
    name: 'Dry Fruit Chocolates',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800',
    description: 'Luxury bite-sized chocolates filled with raisins, roasted almonds, and crunchy cashews.',
    category: 'Chocolates',
    price: 799,
    retailPrice: 799,
    shopPrice: 720,
    packSizes: ['250g', '500g', '1kg'],
    countInStock: 130,
    rating: 5.0,
    numReviews: 104
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/somvalli';
    await mongoose.connect(mongoUri);
    
    await Product.deleteMany(); // Clear existing products
    console.log('Old products cleared.');

    await Product.insertMany(officialSomvalliProducts);
    console.log('Official SomValli Foods Catalog Seeded Successfully!');
    
    process.exit();
  } catch (error) {
    console.error(`Error with Seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
