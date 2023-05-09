const sharp = require("sharp");
const path =require("path");
const fs = require("fs");

function validator (req,res,next) {

	if (req.body) {
		const book = req.body.book ? JSON.parse(req.body.book) : req.body;

		if (!book.title || !book.author || !book.year || !book.genre) {
			return res.status(400).json({message: "Formulaire invalide."});
		}

		if (book.title.includes("$") || book.author.includes("$") || book.genre.includes("$")){
			return res.status(400).json({message: "Formulaire invalide."});
		}

		if ( !parseInt(book.year,10) ) {
			return res.status(400).json({message: "Formulaire invalide."});
		}
	}

	if (req.file) {
		const imageFullname = req.file.filename;
		const imageName = path.parse(imageFullname).name;
		sharp(`images/${imageFullname}`)
			.resize({height: 500})
			.toFormat('webp')
			.toFile(`images/${imageName}.webp`)
			.then( () => {
				if (path.parse(imageFullname).ext != '.webp') {
					fs.unlink(path.join(__dirname,`../images/${imageFullname}`), (error) => {
						if (error) {console.log(error);}
					});
				}
				req.file.filename = `${imageName}.webp`;
				next();
			}).catch( (error) => { console.log(error); return res.status(400).json({error}); });
	} else {
		next();
	}
}

module.exports = validator;