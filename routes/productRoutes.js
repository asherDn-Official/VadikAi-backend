const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  getProducts,
  addProduct,
  editProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/get", getProducts);
router.post("/add", upload.array("images"
  
), addProduct);
router.put("/edit/:id", upload.array("images"), editProduct);

router.delete('/delete/:id', deleteProduct);

module.exports = router;
