const express = require('express');
const router = express.Router();
const controller = require('../controllers/customerController');   
const upload = require('../middlewares/upload');


router.post('/create', upload.single("photo"), controller.createCustomer);
router.get('/getAll', controller.getAllCustomers);
router.get('/id/:id', controller.getCustomerById);
router.put('/update/:id', upload.single("photo"), controller.updateCustomer); // General update
router.delete('/delete/:id', controller.deleteCustomer);


// Route: Update Basic Details

router.put('/basic/:id', upload.single("photo"), controller.updateBasicDetails);

// Route: Update Advanced Details

router.put('/advanced/:id', controller.updateAdvancedDetails);

// Route: Update Privacy Details

router.put('/privacy/:id', controller.updatePrivacyDetails);

// Route: Update Referral Details

router.put('/referral/:id', controller.updateReferralDetails);

// Import Excel for bulk update or create

router.post('/customer/import', upload.single('file'), controller.importFromExcel);

// Export sample import template

router.get('/customer/export-template', controller.downloadImportTemplate);

// Dynamic field access routes
router.get('/:id/field/:fieldName', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select(req.params.fieldName);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    
    const fieldValue = customer[req.params.fieldName] || 
                      customer.advancedDetails?.get(req.params.fieldName) ||
                      customer.privacyDetails?.get(req.params.fieldName) ||
                      customer.referenceDetails?.get(req.params.fieldName);
    
    if (!fieldValue) {
      return res.status(404).json({ error: "Field not found" });
    }
    
    res.json({ [req.params.fieldName]: fieldValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/field/:fieldName', upload.none(), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    // Check which map the field belongs to (or if it's a top-level field)
    const mapFields = ['advancedDetails', 'privacyDetails', 'referenceDetails'];
    let updated = false;

    if (customer[req.params.fieldName] !== undefined) {
      // Update top-level field
      customer[req.params.fieldName] = req.body.value;
      updated = true;
    } else {
      // Check map fields
      for (const mapField of mapFields) {
        if (customer[mapField]?.get(req.params.fieldName) !== undefined) {
          customer[mapField].set(req.params.fieldName, req.body.value);
          updated = true;
          break;
        }
      }
    }

    if (!updated) {
      // Field doesn't exist - add to advancedDetails by default
      customer.advancedDetails.set(req.params.fieldName, req.body.value);
    }

    await customer.save();
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;