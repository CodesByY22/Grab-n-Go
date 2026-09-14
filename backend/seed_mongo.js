const bcrypt = require('bcryptjs');
const { connectDB, User, Cafeteria, Category, MenuItem, Order, Notification } = require('./db');

async function seedMongo(force = false) {
  try {
    await connectDB();

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0 && !force) {
      console.log('🌱 MongoDB database already populated with demo data.');
      return;
    }

    console.log('🌱 Seeding MongoDB database with demo data...');

    // Clear existing collections if forcing reseed
    if (force) {
      await User.deleteMany({});
      await Cafeteria.deleteMany({});
      await Category.deleteMany({});
      await MenuItem.deleteMany({});
      await Order.deleteMany({});
      await Notification.deleteMany({});
    }

    // 1. Create Users
    const hashedPwStudent = await bcrypt.hash('student123', 10);
    const hashedPwVendor = await bcrypt.hash('vendor123', 10);
    const hashedPwAdmin = await bcrypt.hash('admin123', 10);

    const studentUser = await User.create({
      name: 'Alex Chen',
      email: 'student@campus.edu',
      password_hash: hashedPwStudent,
      role: 'STUDENT',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      phone: '+1 555-0192'
    });

    const vendorUser = await User.create({
      name: 'Chef Marco Rossi',
      email: 'vendor@campus.edu',
      password_hash: hashedPwVendor,
      role: 'VENDOR',
      avatar_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=250',
      phone: '+1 555-0193'
    });

    const adminUser = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'admin@campus.edu',
      password_hash: hashedPwAdmin,
      role: 'ADMIN',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
      phone: '+1 555-0194'
    });

    // 2. Create Cafeterias
    const cafe1 = await Cafeteria.create({
      name: 'Main Campus Cafeteria',
      code: 'MAIN-CAF',
      location: 'Student Center, Ground Floor',
      vendor_user_id: vendorUser._id,
      is_active: true,
      opening_hours: '07:30 AM - 09:30 PM',
      avg_prep_time_mins: 12,
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600'
    });

    const cafe2 = await Cafeteria.create({
      name: 'Science Block Food Court',
      code: 'SCI-COURT',
      location: 'Science Building 3, Level 2',
      vendor_user_id: vendorUser._id,
      is_active: true,
      opening_hours: '08:00 AM - 08:00 PM',
      avg_prep_time_mins: 10,
      image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600'
    });

    const cafe3 = await Cafeteria.create({
      name: 'Tech Hub Express Deli',
      code: 'TECH-DELI',
      location: 'Engineering Complex, Atrium',
      vendor_user_id: vendorUser._id,
      is_active: true,
      opening_hours: '09:00 AM - 07:00 PM',
      avg_prep_time_mins: 8,
      image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600'
    });

    // 3. Create Categories for Main Cafeteria
    const catBreakfast = await Category.create({
      cafeteria_id: cafe1._id,
      name: 'Breakfast & Snacks',
      description: 'Morning energizers and light snacks',
      icon: 'Coffee',
      sort_order: 1
    });

    const catFastFood = await Category.create({
      cafeteria_id: cafe1._id,
      name: 'Fast Food & Burgers',
      description: 'Quick bites, burgers, and rolls',
      icon: 'Pizza',
      sort_order: 2
    });

    const catSouthIndian = await Category.create({
      cafeteria_id: cafe1._id,
      name: 'South Indian Delights',
      description: 'Crispy dosas, idlis, and vadas',
      icon: 'Utensils',
      sort_order: 3
    });

    const catBeverages = await Category.create({
      cafeteria_id: cafe1._id,
      name: 'Beverages & Shakes',
      description: 'Cold drinks, fresh juices, and shakes',
      icon: 'CupSoda',
      sort_order: 4
    });

    // 4. Create Menu Items
    const item1 = await MenuItem.create({
      cafeteria_id: cafe1._id,
      category_id: catFastFood._id,
      name: 'Paneer Cheese Burger',
      description: 'Crispy cottage cheese patty with spicy mayo, cheddar cheese, and fresh lettuce',
      price: 140,
      prep_time_mins: 12,
      is_veg: true,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
      tags: ['Popular', 'Bestseller', 'Cheesy']
    });

    const item2 = await MenuItem.create({
      cafeteria_id: cafe1._id,
      category_id: catSouthIndian._id,
      name: 'Masala Butter Dosa',
      description: 'Crispy golden dosa filled with spiced potato masala, served with coconut chutney and sambar',
      price: 110,
      prep_time_mins: 10,
      is_veg: true,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=400',
      tags: ['Traditional', 'Crispy']
    });

    const item3 = await MenuItem.create({
      cafeteria_id: cafe1._id,
      category_id: catBeverages._id,
      name: 'Cold Coffee with Ice Cream',
      description: 'Rich blended espresso with chilled milk and a scoop of vanilla ice cream',
      price: 90,
      prep_time_mins: 5,
      is_veg: true,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400',
      tags: ['Refreshing', 'Cold']
    });

    const item4 = await MenuItem.create({
      cafeteria_id: cafe1._id,
      category_id: catFastFood._id,
      name: 'Peri Peri Veg Frankie',
      description: 'Whole wheat wrap stuffed with spicy veg patty, capsicum, onion, and peri peri sauce',
      price: 95,
      prep_time_mins: 8,
      is_veg: true,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=400',
      tags: ['Spicy', 'Quick Grab']
    });

    const item5 = await MenuItem.create({
      cafeteria_id: cafe1._id,
      category_id: catBreakfast._id,
      name: 'Classic Club Sandwich',
      description: 'Triple decker toasted sandwich with fresh veggies, mint chutney, and cheese slice',
      price: 120,
      prep_time_mins: 7,
      is_veg: true,
      is_available: true,
      image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400',
      tags: ['Fresh', 'Healthy']
    });

    // 5. Create Active Orders
    await Order.create({
      order_number: 'GN-1001',
      user_id: studentUser._id,
      cafeteria_id: cafe1._id,
      status: 'PREPARING',
      items: [
        { menu_item_id: item1._id, item_name: 'Paneer Cheese Burger', quantity: 1, unit_price: 140 },
        { menu_item_id: item3._id, item_name: 'Cold Coffee with Ice Cream', quantity: 1, unit_price: 90 }
      ],
      total_amount: 230,
      estimated_prep_mins: 12,
      queue_position: 2,
      pickup_qr_code: 'GN-1001-QR-PASS',
      pickup_type: 'ASAP'
    });

    await Order.create({
      order_number: 'GN-1002',
      user_id: studentUser._id,
      cafeteria_id: cafe1._id,
      status: 'ACCEPTED',
      items: [
        { menu_item_id: item2._id, item_name: 'Masala Butter Dosa', quantity: 2, unit_price: 110 }
      ],
      total_amount: 220,
      estimated_prep_mins: 15,
      queue_position: 4,
      pickup_qr_code: 'GN-1002-QR-PASS',
      pickup_type: 'ASAP'
    });

    await Order.create({
      order_number: 'GN-1003',
      user_id: studentUser._id,
      cafeteria_id: cafe1._id,
      status: 'PICKED_UP',
      items: [
        { menu_item_id: item4._id, item_name: 'Peri Peri Veg Frankie', quantity: 1, unit_price: 95 }
      ],
      total_amount: 95,
      estimated_prep_mins: 8,
      queue_position: 0,
      pickup_qr_code: 'GN-1003-QR-PASS',
      pickup_type: 'ASAP'
    });

    // 6. Create Notifications
    await Notification.create({
      user_id: studentUser._id,
      title: 'Order Preparing 🍳',
      message: 'Order #GN-1001 is now being prepared in the kitchen at Main Campus Cafeteria.',
      type: 'STATUS_UPDATE',
      read: false
    });

    console.log('✅ MongoDB Database Seeded Successfully!');
  } catch (error) {
    console.error('❌ Error Seeding MongoDB:', error);
  }
}

if (require.main === module) {
  seedMongo(true).then(() => process.exit(0));
}

module.exports = { seedMongo };
