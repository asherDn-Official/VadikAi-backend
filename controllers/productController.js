const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

// List products with search, filter, sort, and pagination

exports.getProducts = async (req, res) => {
  try {
    const {
      search = '',
      category,
      status,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = {
      name: { $regex: search, $options: 'i' },
      ...(category && { category }),
      ...(status && { status })
    };

    const products = await Product.find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({ products, total });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a new product

exports.addProduct = async (req, res) => {
  try {
    const { name, description, colors, price, status, category } = req.body;
    const colorList = Array.isArray(colors) ? colors : colors?.split(',') || [];
    const imagePaths = req.files.map(file => file.path);

    const product = new Product({
      name,
      description,
      colors: colorList,
      price,
      status,
      category,
      images: imagePaths
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
};

// Edit existing product

exports.editProduct = async (req, res) => {
  try {
    const { name, description, colors, price, status, category } = req.body;
    const colorList = Array.isArray(colors) ? colors : colors?.split(',') || [];
    const imagePaths = req.files.map(file => file.path);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        colors: colorList,
        price,
        status,
        category,
        ...(imagePaths.length && { images: imagePaths })
      },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};


// Delete a product by ID

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    //  delete image files from disk
    
    product.images.forEach(imgPath => {
      fs.unlink(path.join(__dirname, '..', imgPath), err => {
        if (err) console.error(`Failed to delete image ${imgPath}:`, err.message);
      });
    });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
