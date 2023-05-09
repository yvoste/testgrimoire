const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { validationResult } = require("express-validator");

exports.signup = (req,res,next) => {

	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(400).json({message: "Entrez une adresse email et un mot de passe valides.\
			Le mot de passe doit contenir un chiffre et un caractère spécial et avoir une longueur d'au moins 8 caractères."});
	}

	bcrypt.hash(req.body.password, 10)
		.then(hash => {
			const user = new User({
				email: req.body.email,
				password: hash
			});
			user.save()
				.then(() => res.status(201).json({message: "Utilisateur créé."}))
				.catch((error) => res.status(400).json({error}));
		})
		.catch(error => res.status(500).json({error}));
};

exports.login = (req,res,next) => {
	User.findOne({email: req.body.email})
		.then(user => {
			if (!user) { return res.status(401).json({message: "Login ou mot de passe erroné."});}
			bcrypt.compare(req.body.password, user.password)
				.then(result => {
					if (!result) {return res.status(401).json({message: "Login ou mot de passe erroné."});}
					res.status(200).json({userId: user._id, 
										token: jwt.sign({userId: user._id},process.env.SECRET_KEY,{expiresIn: '24h' })});
				})
				.catch(error => res.status(500).json({error}));
		})
		.catch(error => res.status(500).json({error}));
};