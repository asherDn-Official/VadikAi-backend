const Order = require('../models/Order');
const DailyBilling = require('../models/DailyBilling');

// Create a new order
// exports.createOrder = async (req, res) => {
//   try {
//     const { customerName, mobileNumber, gender, customerType, products, discount } = req.body;
    
//     // Calculate totals
//     const subtotal = products.reduce((sum, product) => sum + product.totalPrice, 0);
//     const grandTotal = subtotal - discount;
    
//     // Generate order ID
//     const orderId = `ORD-${Date.now()}`;
    
//     const order = new Order({
//       customerName,
//       mobileNumber,
//       gender,
//       customerType,
//       orderId,
//       products,
//       subtotal,
//       discount,
//       grandTotal
//     });
    
//     await order.save();
    
//     // Update daily billing
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     let dailyBilling = await DailyBilling.findOne({ date: today });
    
//     if (!dailyBilling) {
//       dailyBilling = new DailyBilling({
//         date: today,
//         numberOfCustomers: 0,
//         totalSales: 0,
//         orders: []
//       });
//     }
    
//     dailyBilling.numberOfCustomers += 1;
//     dailyBilling.totalSales += grandTotal;
//     dailyBilling.orders.push(order._id);
    
//     await dailyBilling.save();
    
//     res.status(201).json({ success: true, order });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

exports.createOrder = async (req, res) => {
  try {
    // Parse numeric fields explicitly
    const { customerName, mobileNumber, gender, customerType } = req.body;
    const discount = parseFloat(req.body.discount) || 0;
    
    // Validate products array
    if (!Array.isArray(req.body.products)) {
      return res.status(400).json({
        success: false,
        error: "Products must be an array"
      });
    }

    // Process each product
    const processedProducts = req.body.products.map(product => {
      const quantity = parseInt(product.quantity);
      const unitPrice = parseFloat(product.unitPrice);
      
      if (isNaN(quantity) || isNaN(unitPrice)) {
        throw new Error(`Invalid numeric values in product: ${product.productName}`);
      }
      
      return {
        productName: product.productName,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: quantity * unitPrice // Calculate total price
      };
    });

    // Calculate totals
    const subtotal = processedProducts.reduce((sum, product) => {
      return sum + product.totalPrice;
    }, 0);

    const grandTotal = subtotal - discount;

    // Generate order ID
    const orderId = `ORD-${Date.now()}`;
    
    const order = new Order({
      customerName,
      mobileNumber,
      gender,
      customerType: customerType || 'Regular',
      orderId,
      products: processedProducts,
      subtotal,
      discount,
      grandTotal
    });
    
    await order.save();
    
    // Update daily billing
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyBilling = await DailyBilling.findOne({ date: today });
    
    if (!dailyBilling) {
      dailyBilling = new DailyBilling({
        date: today,
        numberOfCustomers: 0,
        totalSales: 0,
        orders: []
      });
    }
    
    dailyBilling.numberOfCustomers += 1;
    dailyBilling.totalSales += grandTotal;
    dailyBilling.orders.push(order._id);
    
    await dailyBilling.save();
    
    res.status(201).json({ 
      success: true, 
      message: "Order created successfully",
      order 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: "Failed to create order"
    });
  }
};

// Get orders by date
exports.getOrdersByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

