const jwt = require("jsonwebtoken");

function authentification (req,res,next) {

	try {
		const token = req.headers.authorization.split(" ")[1];
		const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
		const userId = decodedToken.userId;
		req.auth = {userId};
		if ( req.body.userId && req.body.userId !== userId) {
			throw 'Invalid user ID'
		} else {
			next()
		}
	} catch (error) {
		res.status(401).json({error});
	}
}

module.exports = authentification;