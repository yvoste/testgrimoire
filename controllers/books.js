const Book = require("../models/book");
const fs = require("fs");
const path = require("path");

exports.getAllBooks = (req,res,next) => {
	Book.find()
		.then( things => res.status(200).json(things))
		.catch( error => res.status(400).json({error}));
};

exports.createBook = (req,res,next) => {
	const bookObject = JSON.parse(req.body.book);
	delete bookObject._id;
	delete bookObject._userId;
	const book = new Book({
		...bookObject,
		userId: req.auth.userId,
		imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
	});

	book.save()
		.then( () => res.status(201).json({message: "Livre enregistré."}))
		.catch( error => res.status(400).json({ error }));
};

exports.getOneBook = (req,res,next) => {
	Book.findOne({_id: req.params.id})
		.then(book => res.status(200).json(book))
		.catch(error => res.status(404).json({error}));
};

exports.updateBook = (req,res,next) => {
	const bookObject = req.file ? 
	{
		...JSON.parse(req.body.book),
		imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
	} : {
		...req.body
	};

	delete bookObject._userId;

	Book.findOne({_id: req.params.id})
		.then(book => {
			if (book.userId != req.auth.userId) {
				console.log("erreur userId");
				res.status(401).json({message: "Action non autorisée."});
				return;
			}

			if (req.file) {
				const oldImageNameArray = book.imageUrl.split("/");
				oldImagePath = `images/${oldImageNameArray[oldImageNameArray.length - 1]}`;
				try {
					fs.unlink(path.join(__dirname,`../${oldImagePath}`), (error) => {
						if (error) {throw error;}
					});
				} catch (error) {
					console.log(error);
				}
			}

			Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
				.then( () => res.status(200).json({message: "Livre modifié."}))
				.catch( error => {
					console.log(error);
					res.status(401).json({error});
				});

		})
		.catch(error => res.status(400).json({error}));
};

exports.deleteBook = (req,res, next) => {
	Book.findOne({_id: req.params.id})
		.then( book => {
			if (book.userId != req.auth.userId) {
				res.status(401).json({message: "Action non autorisée."});
			} else {
				const oldImageNameArray = book.imageUrl.split("/");
				oldImagePath = `images/${oldImageNameArray[oldImageNameArray.length - 1]}`;
				fs.unlink(path.join(__dirname,`../${oldImagePath}`), () => {
					Book.deleteOne({_id: req.params.id})
						.then( () => {res.status(200).json({message: "Livre supprimé."})})
						.catch( error => {res.status(400).json({error})});
				});
			}
		})
		.catch( error => { res.status(500).json({error}); console.log(error);});
};

exports.getBestratedBooks = (req,res,next) => {
	Book.find().sort({averageRating : -1}).limit(3)
		.then( books => {
			res.status(200).json(books);
		})
		.catch( error => { res.status(500).json({error}); console.log(error)});
};

exports.addRating = (req,res,next) => {

	if (!Number.isInteger(req.body.rating) || req.body.rating > 5) {
		res.status(400).json({message : "Notation impossible."});
		return;
	}

	Book.findOne({_id: req.params.id})
		.then( book => {
			const bookRatings = book.ratings;
			let totalRatings = 0;
			for (const rating of bookRatings) {
				if (rating.userId === req.auth.userId) {
					console.log("coucou5");
					res.status(400).json({message: "Notation impossible."});
					return;
				}
				totalRatings += rating.grade;
			}

			const newAverage = Math.round((totalRatings + req.body.rating) / (book.ratings.length+1));
			Book.findOneAndUpdate(
				{_id: req.params.id},
				{
					$push: {ratings: {userId: req.auth.userId, grade: req.body.rating}},
					averageRating: newAverage
				},
				{
					returnDocument: "after"
				})
				.then( newBook => {
					res.status(200).json(newBook);
				})
				.catch( error => { res.status(500).json({error}); console.log(error);});

		})
		.catch( error => { res.status(500).json({error}); console.log(error); });

};