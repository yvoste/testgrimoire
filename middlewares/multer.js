const multer = require("multer");

const MIME_TYPES = {
	"image/jpg": "jpg",
	"image/jpeg": "jpeg",
	"image/png": "png"
};

const validator = (req, file, callback) => {
	const book = JSON.parse(req.body.book);
	const allowedTypes = /jpeg|jpg|png|webp/;

	if (!book.title || !book.author || !book.year || !book.genre) {
		callback(null, false);
	}

	else if (book.title.includes("$") || book.author.includes("$") || book.genre.includes("$")){
		callback(null,false);
	}

	else if (!parseInt(book.year,10)) {
		callback(null, false);
	}

	else if ( !allowedTypes.test(file.mimetype) ) {
		callback(null, false);
	}

	else { callback(null, true); }
};

const storage = multer.diskStorage({
	destination: (req,file, callback) => {
		callback(null, 'images');
	},
	filename: (req,file,callback) => {
		const name = file.originalname.split(".")[0].split(" ").join("_");
		const extension = MIME_TYPES[file.mimetype];
		callback(null, name + Date.now() + "." + extension);
	}
});

const limits = {
	fileSize: 1024 * 1024
};

const multerMiddleware = function (req, res, next) {
	const upload = multer({storage: storage, fileFilter: validator, limits: limits}).single("image");
	upload(req, res, function (error) {
		if (error instanceof multer.MulterError) {
			return res.status(400).json({message: "Fichier trop volumineux. Taille maximale : 1Mo."});
		}
		next();
	});
};

module.exports = multerMiddleware;
