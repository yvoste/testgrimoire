const express = require("express");
const router = express.Router();

const bookCtrl = require("../controllers/books");
const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer");
const validator = require("../middlewares/validator");

router.get("/",bookCtrl.getAllBooks);
router.post("/", auth, multer, validator, bookCtrl.createBook);
router.get("/bestrating", bookCtrl.getBestratedBooks);
router.get("/:id", bookCtrl.getOneBook);
router.put("/:id", auth, multer, validator, bookCtrl.updateBook);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.post("/:id/rating", auth, bookCtrl.addRating);

module.exports = router;