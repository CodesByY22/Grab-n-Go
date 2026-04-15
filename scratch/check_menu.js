const mongoose = require('mongoose');
const Shop = require('./backend/models/Shop');
require('dotenv').config({ path: './backend/.env' });

const checkShop = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const shopId = '69dfd924e6d965101674f6c1';
        const shop = await Shop.findById(shopId);
        
        if (!shop) {
            console.log('Shop not found!');
        } else {
            console.log('--- SHOP INFO ---');
            console.log('Name:', shop.name);
            console.log('Menu Count:', shop.menu.length);
            console.log('Menu Items:', JSON.stringify(shop.menu, null, 2));
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkShop();
