const Shop = require('../models/Shop');

// @desc    Create a shop
// @route   POST /api/shops
// @access  Private/Vendor
const createShop = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Shop name is required' });
    }

    const shopExists = await Shop.findOne({ owner: req.user._id });

    if (shopExists) {
      return res.status(400).json({ message: 'Shop already exists for this vendor' });
    }

    const shop = await Shop.create({
      owner: req.user._id,
      name,
      description,
      image,
      menu: [],
    });

    res.status(201).json(shop);
  } catch (error) {
    console.error('Create shop error:', error);
    res.status(500).json({ message: 'Server error creating shop' });
  }
};

// @desc    Get vendor's shop
// @route   GET /api/shops/myshop
// @access  Private/Vendor
const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (shop) {
      res.json(shop);
    } else {
      res.status(404).json({ message: 'Shop not found' });
    }
  } catch (error) {
    console.error('Get my shop error:', error);
    res.status(500).json({ message: 'Server error fetching shop' });
  }
};

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
const getShops = async (req, res) => {
  try {
    const shops = await Shop.find({});
    res.json(shops);
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ message: 'Server error fetching shops' });
  }
};

// @desc    Get shop by ID
// @route   GET /api/shops/:id
// @access  Public
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (shop) {
      res.json(shop);
    } else {
      res.status(404).json({ message: 'Shop not found' });
    }
  } catch (error) {
    console.error('Get shop by ID error:', error);
    res.status(500).json({ message: 'Server error fetching shop' });
  }
};

// @desc    Add menu item
// @route   POST /api/shops/menu
// @access  Private/Vendor
const addMenuItem = async (req, res) => {
  try {
    const { name, price, description, image } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Item name and price are required' });
    }

    const shop = await Shop.findOne({ owner: req.user._id });

    if (shop) {
      const newItem = {
        name,
        price: Number(price),
        description,
        image,
        isAvailable: true,
      };

      shop.menu.push(newItem);
      await shop.save();
      res.json(shop.menu);
    } else {
      res.status(404).json({ message: 'Shop not found' });
    }
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ message: 'Server error adding menu item' });
  }
};

// @desc    Remove menu item
// @route   DELETE /api/shops/menu/:itemId
// @access  Private/Vendor
const removeMenuItem = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });

    if (shop) {
      shop.menu = shop.menu.filter(
        (item) => item._id.toString() !== req.params.itemId
      );
      await shop.save();
      res.json(shop.menu);
    } else {
      res.status(404).json({ message: 'Shop not found' });
    }
  } catch (error) {
    console.error('Remove menu item error:', error);
    res.status(500).json({ message: 'Server error removing menu item' });
  }
};

// @desc    Toggle shop open/close
// @route   PUT /api/shops/toggle
// @access  Private/Vendor
const toggleShopOpen = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });

    if (shop) {
      shop.isOpen = !shop.isOpen;
      await shop.save();
      res.json(shop);
    } else {
      res.status(404).json({ message: 'Shop not found' });
    }
  } catch (error) {
    console.error('Toggle shop error:', error);
    res.status(500).json({ message: 'Server error toggling shop status' });
  }
};

// @desc    Toggle menu item availability
// @route   PUT /api/shops/menu/:itemId/toggle
// @access  Private/Vendor
const toggleMenuItemAvailability = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });

    if (shop) {
      const item = shop.menu.id(req.params.itemId);
      if (!item) {
        return res.status(404).json({ message: 'Menu item not found' });
      }

      item.isAvailable = !item.isAvailable;
      await shop.save();
      res.json(shop.menu);
    } else {
      res.status(404).json({ message: 'Shop not found' });
    }
  } catch (error) {
    console.error('Toggle menu item error:', error);
    res.status(500).json({ message: 'Server error toggling menu item' });
  }
};

module.exports = {
  createShop,
  getMyShop,
  getShops,
  getShopById,
  addMenuItem,
  removeMenuItem,
  toggleShopOpen,
  toggleMenuItemAvailability,
};
