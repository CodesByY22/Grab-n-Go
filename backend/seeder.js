require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Shop = require('./models/Shop');
const connectDB = require('./config/db');

const shops = [
  {
    name: 'Espresso Express',
    description: 'Fuel your study sessions with our premium coffee and artisan pastries. The perfect spot for a quick caffeine fix.',
    image: '/uploads/espresso_express.png',
    isOpen: true,
    menu: [
      { name: 'Cappuccino', price: 120, description: 'Rich espresso with steamed milk foam', isAvailable: true },
      { name: 'Iced Americano', price: 90, description: 'Chilled espresso with water and ice', isAvailable: true },
      { name: 'Butter Croissant', price: 80, description: 'Flaky, buttery French pastry', isAvailable: true },
    ]
  },
  {
    name: 'The Burger Barn',
    description: 'Juicy, flame-grilled burgers made with fresh ingredients. Grab a bite that packs a punch!',
    image: '/uploads/burger_barn.png',
    isOpen: true,
    menu: [
      { name: 'Classic Cheeseburger', price: 180, description: 'Beef patty, cheddar, lettuce, tomato', isAvailable: true },
      { name: 'Spicy Zinger', price: 210, description: 'Crispy chicken with spicy mayo', isAvailable: true },
      { name: 'Cajun Fries', price: 70, description: 'Crispy fries with Cajun seasoning', isAvailable: true },
    ]
  },
  {
    name: 'Green Garden',
    description: 'Health is wealth! Fresh salads, smoothie bowls, and organic juices for a balanced day.',
    image: '/uploads/green_garden.png',
    isOpen: true,
    menu: [
      { name: 'Greek Salad', price: 150, description: 'Feta, olives, cucumber, and tomatoes', isAvailable: true },
      { name: 'Acai Bowl', price: 230, description: 'Superfood bowl with berries and granola', isAvailable: true },
      { name: 'Green Detox Juice', price: 100, description: 'Kale, apple, and ginger', isAvailable: true },
    ]
  },
  {
    name: 'Spice Route',
    description: 'Experience the rich flavors of India. From aromatic biryanis to buttery tikkas.',
    image: '/uploads/spice_route.png',
    isOpen: true,
    menu: [
      { name: 'Paneer Tikka Roll', price: 140, description: 'Grilled paneer with mint chutney', isAvailable: true },
      { name: 'Chicken Biryani', price: 250, description: 'Fragrant basmati rice with spices', isAvailable: true },
      { name: 'Masala Chai', price: 30, description: 'Traditional Indian spiced tea', isAvailable: true },
    ]
  },
  {
    name: 'Sweet Retreat',
    description: 'Life is short, eat dessert first! Heavenly cakes, macarons, and artisanal sweets.',
    image: '/uploads/sweet_retreat.png',
    isOpen: true,
    menu: [
      { name: 'Chocolate Truffle', price: 120, description: 'Rich chocolate cake slice', isAvailable: true },
      { name: 'Macaron Box (6)', price: 300, description: 'Assorted French macarons', isAvailable: true },
      { name: 'Blueberry Muffin', price: 90, description: 'Baked fresh every morning', isAvailable: true },
    ]
  },
  {
    name: 'Pizza Palace',
    description: 'Authentic wood-fired pizzas with a modern twist. The ultimate comfort food for any time.',
    image: '/uploads/pizza_palace.png',
    isOpen: true,
    menu: [
      { name: 'Margherita', price: 220, description: 'Mozzarella, basil, and tomato sauce', isAvailable: true },
      { name: 'Pepperoni Feast', price: 280, description: 'Double pepperoni and extra cheese', isAvailable: true },
      { name: 'Garlic Knots', price: 60, description: 'Baked knots with garlic butter', isAvailable: true },
    ]
  }
];

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Shop.deleteMany();
    await User.deleteMany();

    // Create a dummy vendor
    const vendor = await User.create({
      name: 'Demo Vendor',
      email: 'vendor@example.com',
      password: 'password123',
      role: 'vendor'
    });

    // Also create a dummy user
    await User.create({
      name: 'Demo User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    });

    const sampleShops = shops.map(shop => {
      return { ...shop, owner: vendor._id };
    });

    await Shop.insertMany(sampleShops);

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error with data import:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // Add destroy logic if needed
} else {
  importData();
}
