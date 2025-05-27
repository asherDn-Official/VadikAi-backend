const express = require('express');
const router = express.Router();
const controller = require('../controllers/customerController');   
const upload = require('../middlewares/upload');


router.post('/create', controller.createCustomer);
router.get('/getAll', controller.getAllCustomers);
router.get('/id/:id', controller.getCustomerById);
router.put('/update/:id', controller.updateCustomer); // General update
router.delete('/delete/:id', controller.deleteCustomer);


// Route: Update Basic Details

router.put('/basic/:id', controller.updateBasicDetails);

// Route: Update Advanced Details

router.put('/advanced/:id', controller.updateAdvancedDetails);

// Route: Update Privacy Details

router.put('/privacy/:id', controller.updatePrivacyDetails);

// Route: Update Referral Details

router.put('/referral/:id', controller.updateReferralDetails);

// Import Excel for bulk update or create

router.post('/customer/import', upload.single('file'), controller.importFromExcel);

module.exports = router;