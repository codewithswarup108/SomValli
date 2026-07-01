const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/productModel');

dotenv.config();

const indianProducts = [
  {
    name: 'Authentic South Indian Filter Coffee',
    image: '/images/filter_coffee_1782881420520.png',
    description: 'A traditional blend of roasted coffee beans (80%) and chicory (20%), perfect for that nostalgic strong and aromatic filter coffee experience.',
    category: 'Coffee',
    price: 349,
    countInStock: 250,
    rating: 4.8,
    numReviews: 45
  },
  {
    name: 'Premium Malabar Monsoon Blend',
    image: '/images/malabar_blend_1782881450243.png',
    description: 'Exposed to the monsoon winds of the Malabar coast, these beans offer a unique, heavy-bodied profile with low acidity and notes of dark chocolate.',
    category: 'Coffee',
    price: 599,
    countInStock: 120,
    rating: 4.9,
    numReviews: 32
  },
  {
    name: 'SomValli Special Masala Roast',
    image: '/images/masala_roast_1782881476305.png',
    description: 'A signature luxury blend infused with traditional Indian spices like cardamom and cinnamon for an invigorating, immune-boosting morning cup.',
    category: 'Coffee',
    price: 499,
    countInStock: 100,
    rating: 4.7,
    numReviews: 28
  },
  {
    name: 'Coorg Arabica Select',
    image: '/images/coorg_arabica_1782881522751.png',
    description: 'Sourced from the lush green hills of Coorg. This 100% Arabica roast provides a smooth, sweet flavor profile with vibrant berry undertones.',
    category: 'Coffee',
    price: 699,
    countInStock: 80,
    rating: 4.9,
    numReviews: 54
  },
  {
    name: 'Chikmagalur Estate Peaberry',
    image: '/images/peaberry_1782881533168.png',
    description: 'Handpicked peaberry beans from the birthplace of Indian coffee. Known for their dense flavor, yielding a cup with intense richness and deep crema.',
    category: 'Coffee',
    price: 849,
    countInStock: 50,
    rating: 5.0,
    numReviews: 12
  },
  {
    name: 'Mysore Nuggets Extra Bold',
    image: '/images/coorg_arabica_1782881522751.png', // Reusing an image
    description: 'The highest grade of Indian washed Arabica. These extra bold nuggets produce a well-rounded, balanced cup with a highly satisfying finish.',
    category: 'Coffee',
    price: 799,
    countInStock: 60,
    rating: 4.8,
    numReviews: 22
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    await Product.deleteMany(); // Clear existing products
    console.log('Old products cleared.');

    await Product.insertMany(indianProducts);
    console.log('Indian Local Market Products Seeded Successfully!');
    
    process.exit();
  } catch (error) {
    console.error(`Error with Seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
