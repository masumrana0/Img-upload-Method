const express = require("express");
const productController = require("../controllers/product.controller");

const { productImageUploader } = require("../middlewares/productImageUploader");
const {
  updateProductImageUploader,
} = require("../middlewares/updateProductImageUploader");
const { verifyToken } = require("../middlewares/verifyToken");
const { authorization } = require("../middlewares/authorization");
const { ADMIN, SUPER_ADMIN } = require("../contants/userRole");
const router = express.Router();

router.route("/products/admin").get(productController.getAdminQueryProduct);
router.route("/cartProducts").post(productController.getCartProducts);
router
  .route("/products/search")
  .get(productController.getSearchByQueryProducts);

router.route("/products/section").get(productController.getSectionRandProducts);

router
  .route("/products")
  .get(productController.getProducts)
  .post(
    verifyToken,
    authorization(ADMIN, SUPER_ADMIN),
    productImageUploader,
    productController.createProduct
  );

router
  .route("/products/bulk")
  .get(productController.getAllProducts)
  .post(
    verifyToken,
    authorization(ADMIN, SUPER_ADMIN),
    productController.createBulkProduct
  )
  .patch(
    verifyToken,
    authorization(ADMIN, SUPER_ADMIN),
    productController.bulkUpdateProduct
  );

router
  .route("/product/:id")
  .get(productController.getProductDetails)
  .patch(
    verifyToken,
    authorization(ADMIN, SUPER_ADMIN),
    updateProductImageUploader,
    productController.updateProduct
  )
  .delete(
    verifyToken,
    authorization(ADMIN, SUPER_ADMIN),
    productController.deleteProduct
  );

module.exports = router;
