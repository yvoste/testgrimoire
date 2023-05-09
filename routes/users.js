const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/users");
const { checkSchema } = require("express-validator");

const schema = {
	email: {isEmail : true},
	password: {
		isStrongPassword: {
			options: {
				minUppercase: 0,
			},
		},
	},
};

router.post("/signup", checkSchema(schema,['body']), userCtrl.signup);
router.post("/login",userCtrl.login);

module.exports = router;