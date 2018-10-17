"use strict";

const { Threads } = require("./model");

// GET
exports.getThreads = function(req, res, next) {
	const { board } = req.params;

	Threads.find({ board: board }).sort({'bumped_on': -1}).limit(10).exec((err, results) => {
		if (err) { return next(err); }

		const result = results.map(item => ({
			_id: item._id,
			board: item.board,
			text: item.text,
			created_on: item.created_on,
			bumped_on: item.bumped_on,
			replies: item.replies.slice(-3),
			replycount: item.replies.length
		}));

		return res.status(200).send(result);
	});
};


//POST
exports.postThread = function(req, res, next) {
	const { board, text, delete_password } = req.body;

	if (board == null || text == null || delete_password == null) {
		return res.status(400).send({ error: "All fields are mandatory!" })
	}
	// FIND BOARD AND INSERT THREAD, IF THREAD EXISTS -> REDIRECT /b/:board
	Threads.findOne({ board }).exec((err, result) => {
		if (err) { return next(err); }

		if ( result.text === text) {
			return res.redirect(`/b/${board}`)
		}
		const newThread = new Threads({
			board,
			text,
			delete_password,
			replies: []
		});
		newThread.save(function(err, doc) {
			if (err) { return next(err); }

			return res.redirect(`/b/${doc.board}`);
		});
	});
};

exports.postReply = function(req, res, next) {
	const { thread_id, text, delete_password } = req.body;

	if ( thread_id == null || text == null || delete_password == null) {
		return res.status(400).send({ error: "All fields are mandatory!" })
	}

	Threads.findById(thread_id).exec((err, parent) => {
		if (err) { return next(err); }

		if (parent == null) {
			return res.status(400).send({ error: "No such thread!" })
		}
		parent.replies.push({
			text,
			delete_password
		});
		parent.save(function(err, doc) {
			if (err) { return next(err); }
console.log("hm", doc);
			return res.redirect(`/b/${doc.board}/${thread_id}`);
		});
	});
};





















// DELETE
exports.deleteAllBooks = function(req, res, next) {

	LibrarySchema.deleteMany({}, function(err, doc) {
		if (err) { return next(err); }

		return res.status(200).send("complete delete successful");
	})
};

exports.deleteBook = function(req, res, next) {
	var bookid = req.params.id;
	LibrarySchema.deleteOne({_id: bookid}, function(err, doc) {
		if (err) { return next(err); }

		return res.status(200).send("delete successful");
	})
};
