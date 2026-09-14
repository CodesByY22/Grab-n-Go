require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Starting Grab-N-Go Database Schema Migration & Seeding...');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    console.log('🧹 Cleaning up old tables...');
    await client.query(`
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS menu_items CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
      DROP TABLE IF EXISTS cafeterias CASCADE;
      DROP TABLE IF EXISTS vendors CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log('🏗️ Creating database tables...');
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('STUDENT', 'VENDOR', 'ADMIN')),
        phone TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE cafeterias (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT,
        opening_hours TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        icon TEXT
      );

      CREATE TABLE menu_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        cafeteria_id UUID NOT NULL REFERENCES cafeterias(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        prep_time_mins INTEGER DEFAULT 10,
        is_veg BOOLEAN DEFAULT TRUE,
        is_available BOOLEAN DEFAULT TRUE,
        image_url TEXT,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_number TEXT NOT NULL UNIQUE,
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cafeteria_id UUID NOT NULL REFERENCES cafeterias(id) ON DELETE CASCADE,
        status TEXT NOT NULL CHECK (status IN ('PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'CANCELLED')) DEFAULT 'PLACED',
        order_type TEXT NOT NULL CHECK (order_type IN ('ASAP', 'SCHEDULED')) DEFAULT 'ASAP',
        scheduled_time TEXT,
        total_amount NUMERIC(10, 2) NOT NULL,
        pickup_code TEXT NOT NULL,
        estimated_prep_mins INTEGER DEFAULT 10,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price NUMERIC(10, 2) NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL
      );

      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'INFO',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX idx_orders_student ON orders(student_id);
      CREATE INDEX idx_orders_cafeteria ON orders(cafeteria_id);
      CREATE INDEX idx_orders_status ON orders(status);
      CREATE INDEX idx_menu_items_cafeteria ON menu_items(cafeteria_id);
    `);

    console.log('🔑 Seeding demo users...');
    const hashedPw = await bcrypt.hash('password123', 10);

    const studentRes = await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone, avatar_url)
      VALUES 
        ('Alex Chen', 'student@campus.edu', $1, 'STUDENT', '+1 555-0192', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'),
        ('Priya Sharma', 'priya@campus.edu', $1, 'STUDENT', '+1 555-0193', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'),
        ('Jordan Lee', 'jordan@campus.edu', $1, 'STUDENT', '+1 555-0194', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200')
      RETURNING id, name, email, role;
    `, [hashedPw]);

    const vendorUserRes = await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES 
        ('Chef Rajesh (Main Cafe)', 'vendor@maincafe.com', $1, 'VENDOR', '+1 555-0101'),
        ('Marco (Food Court)', 'vendor@foodcourt.com', $1, 'VENDOR', '+1 555-0102'),
        ('Sarah (Coffee Corner)', 'vendor@coffeecorner.com', $1, 'VENDOR', '+1 555-0103'),
        ('Anita (Juice Bar)', 'vendor@juicebar.com', $1, 'VENDOR', '+1 555-0104')
      RETURNING id, name, email;
    `, [hashedPw]);

    await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ('Campus Admin', 'admin@grabngo.com', $1, 'ADMIN', '+1 555-0000');
    `, [hashedPw]);

    const studentId = studentRes.rows[0].id;
    const vendor1Id = vendorUserRes.rows[0].id;
    const vendor2Id = vendorUserRes.rows[1].id;
    const vendor3Id = vendorUserRes.rows[2].id;
    const vendor4Id = vendorUserRes.rows[3].id;

    console.log('🏛️ Seeding cafeterias...');
    const cafeRes = await client.query(`
      INSERT INTO cafeterias (name, description, location, opening_hours, image_url, vendor_user_id)
      VALUES 
        ('Main Campus Cafeteria', 'Hearty North & South Indian meals, thalis, fresh dosas and parathas.', 'Student Center, Ground Floor', '08:00 AM - 08:30 PM', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800', $1),
        ('Flame & Grill Food Court', 'Fast food, sizzling paneer wraps, pizzas, burgers, and crisp fries.', 'North Academic Block', '09:00 AM - 10:00 PM', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800', $2),
        ('The Daily Grind Coffee', 'Artisanal cold coffees, espresso, gourmet sandwiches, and fresh pastries.', 'Library Plaza', '07:30 AM - 07:00 PM', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800', $3),
        ('Tropics Juice & Refresh', '100% natural cold-pressed juices, smooth protein shakes, and fruit bowls.', 'Sports Complex Gym', '08:00 AM - 09:00 PM', 'https://images.unsplash.com/photo-1622597467836-f3285f2131b7?auto=format&fit=crop&q=80&w=800', $4)
      RETURNING id, name;
    `, [vendor1Id, vendor2Id, vendor3Id, vendor4Id]);

    const mainCafeId = cafeRes.rows[0].id;
    const foodCourtId = cafeRes.rows[1].id;
    const coffeeCornerId = cafeRes.rows[2].id;
    const juiceBarId = cafeRes.rows[3].id;

    console.log('🏷️ Seeding categories...');
    const catRes = await client.query(`
      INSERT INTO categories (name, icon)
      VALUES 
        ('Breakfast', '🍳'),
        ('Meals', '🍱'),
        ('Snacks', '🥪'),
        ('Beverages', '🥤'),
        ('Desserts', '🍰')
      RETURNING id, name;
    `);

    const catMap = {};
    catRes.rows.forEach(c => { catMap[c.name] = c.id; });

    console.log('🍲 Seeding menu items...');
    const items = [
      // Main Cafeteria
      [mainCafeId, catMap['Meals'], 'Paneer Butter Masala Meal', 'Rich creamy cottage cheese gravy served with 2 butter naan & jeera rice.', 140.00, 12, true, true, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600', ['Bestseller', 'Chef Special']],
      [mainCafeId, catMap['Meals'], 'Hyderabadi Veg Biryani', 'Fragrant basmati rice cooked with garden fresh vegetables and aromatic spices.', 120.00, 15, true, true, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600', ['Popular', 'Spicy']],
      [mainCafeId, catMap['Breakfast'], 'Masala Dosa', 'Crispy rice crepe filled with spiced potato mash served with coconut chutney & sambar.', 70.00, 8, true, true, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600', ['Quick Bite', 'Breakfast']],
      [mainCafeId, catMap['Breakfast'], 'Aloo Paratha with Curd', 'Whole wheat flatbread stuffed with seasoned potatoes, served with fresh yogurt and butter.', 60.00, 10, true, true, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=600', ['Comfort Food']],

      // Food Court
      [foodCourtId, catMap['Snacks'], 'Grilled Paneer Tikka Wrap', 'Smokey grilled paneer cubes wrapped in tortilla with mint mayonnaise and onions.', 110.00, 7, true, true, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=600', ['Must Try', 'High Protein']],
      [foodCourtId, catMap['Snacks'], 'Crispy Veg Loaded Burger', 'Crispy vegetable patty topped with melted cheese slice and spicy mayo.', 90.00, 8, true, true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600', ['Cheesy']],
      [foodCourtId, catMap['Snacks'], 'Peri Peri Fries', 'Golden potato french fries tossed in zesty peri-peri spice mix.', 65.00, 5, true, true, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600', ['Spicy', 'Snack']],
      [foodCourtId, catMap['Snacks'], 'Chicken Tikka Roll', 'Juicy grilled chicken tikka strips wrapped with tangy spicy onions.', 130.00, 10, false, true, 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&q=80&w=600', ['Non-Veg']],

      // Coffee Corner
      [coffeeCornerId, catMap['Beverages'], 'Classic Iced Cold Coffee', 'Thick creamy blended cold coffee topped with chocolate drizzle.', 80.00, 4, true, true, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600', ['Bestseller', 'Chilled']],
      [coffeeCornerId, catMap['Beverages'], 'Hazelnut Cappuccino', 'Rich espresso shot with steamed milk foam and hazelnut syrup.', 95.00, 5, true, true, 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=600', ['Hot Coffee']],
      [coffeeCornerId, catMap['Snacks'], 'Grilled Cheese Sandwich', 'Multi-grain bread stuffed with cheddar, mozzarella, and herbs.', 85.00, 6, true, true, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=600', ['Quick Bite']],
      [coffeeCornerId, catMap['Desserts'], 'Fudge Chocolate Brownie', 'Warm chocolate brownie topped with chocolate fudge sauce.', 75.00, 3, true, true, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600', ['Sweet']],

      // Juice Bar
      [juiceBarId, catMap['Beverages'], 'Fresh Watermelon Juice', '100% natural cold pressed watermelon juice with mint leaves.', 50.00, 3, true, true, 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&q=80&w=600', ['Fresh', 'Hydrating']],
      [juiceBarId, catMap['Beverages'], 'Mango Smoothie Bowl', 'Almond milk blended mango topped with chia seeds, banana, and granola.', 120.00, 6, true, true, 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&q=80&w=600', ['Healthy', 'Energy']]
    ];

    const menuRows = [];
    for (const item of items) {
      const res = await client.query(`
        INSERT INTO menu_items (cafeteria_id, category_id, name, description, price, prep_time_mins, is_veg, is_available, image_url, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, name, cafeteria_id, price;
      `, item);
      menuRows.push(res.rows[0]);
    }

    const itemPaneer = menuRows.find(r => r.name.includes('Paneer Butter'));
    const itemDosa = menuRows.find(r => r.name.includes('Masala Dosa'));
    const itemCoffee = menuRows.find(r => r.name.includes('Cold Coffee'));
    const itemWrap = menuRows.find(r => r.name.includes('Paneer Tikka Wrap'));

    console.log('📦 Seeding sample orders...');
    // Order 1: Active PREPARING order for Main Student
    const order1Res = await client.query(`
      INSERT INTO orders (order_number, student_id, cafeteria_id, status, order_type, total_amount, pickup_code, estimated_prep_mins, created_at)
      VALUES ('GN-1001', $1, $2, 'PREPARING', 'ASAP', 210.00, 'GN-8942', 12, NOW() - INTERVAL '5 minutes')
      RETURNING id;
    `, [studentId, mainCafeId]);

    await client.query(`
      INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
      VALUES 
        ($1, $2, 'Paneer Butter Masala Meal', 1, 140.00, 140.00),
        ($1, $3, 'Masala Dosa', 1, 70.00, 70.00);
    `, [order1Res.rows[0].id, itemPaneer.id, itemDosa.id]);

    // Order 2: Active READY order for Main Student
    const order2Res = await client.query(`
      INSERT INTO orders (order_number, student_id, cafeteria_id, status, order_type, total_amount, pickup_code, estimated_prep_mins, created_at)
      VALUES ('GN-1002', $1, $2, 'READY', 'ASAP', 80.00, 'GN-4311', 4, NOW() - INTERVAL '10 minutes')
      RETURNING id;
    `, [studentId, coffeeCornerId]);

    await client.query(`
      INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
      VALUES ($1, $2, 'Classic Iced Cold Coffee', 1, 80.00, 80.00);
    `, [order2Res.rows[0].id, itemCoffee.id]);

    // Order 3: Completed Order
    const order3Res = await client.query(`
      INSERT INTO orders (order_number, student_id, cafeteria_id, status, order_type, total_amount, pickup_code, estimated_prep_mins, created_at)
      VALUES ('GN-1000', $1, $2, 'PICKED_UP', 'ASAP', 110.00, 'GN-1100', 7, NOW() - INTERVAL '1 hour')
      RETURNING id;
    `, [studentId, foodCourtId]);

    await client.query(`
      INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
      VALUES ($1, $2, 'Grilled Paneer Tikka Wrap', 1, 110.00, 110.00);
    `, [order3Res.rows[0].id, itemWrap.id]);

    // Seed initial notifications
    await client.query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES 
        ($1, 'Order Ready for Pickup! 🎉', 'Your Cold Coffee from The Daily Grind Coffee is READY! Code: GN-4311', 'ORDER_READY'),
        ($1, 'Kitchen Started Preparing 🍳', 'Main Campus Cafeteria has started preparing your order #GN-1001', 'ORDER_STATUS');
    `, [studentId]);

    console.log('✅ Database migration and seeding successfully completed!');
    console.log('----------------------------------------------------');
    console.log('DEMO CREDENTIALS:');
    console.log('👤 Student: student@campus.edu / password123');
    console.log('🏪 Vendor (Main Cafe): vendor@maincafe.com / password123');
    console.log('🛠️ Admin: admin@grabngo.com / password123');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('❌ Migration error:', err);
    throw err;
  } finally {
    await client.end();
  }
}

seed().catch(() => process.exit(1));
