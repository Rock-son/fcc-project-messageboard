"use strict";

const { Threads } = require("./model");

// GET
exports.getThreads = function(req, res, next) {
	const { board } = req.params;

	Threads.find({board}).sort({'bumped_on': -1}).limit(10).exec((err, results) => {
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

exports.getOneThread = function(req, res, next) {
	const { board } = req.params;
	const { thread_id } = req.query;

	Threads.findById(thread_id, '_id board text created_on bumped_on replies').exec((err, doc) => {
		if (err) { return next(err); }

		return res.status(200).send(doc);
	});
};

//POST
exports.postThread = function(req, res, next) {
	const { text, delete_password } = req.body;
	const board = req.body.board || req.params.board;

	if (board == null || text == null || delete_password == null) {
		return res.status(400).send({ error: "All fields are mandatory!" })
	}
	// FIND BOARD AND INSERT THREAD, IF THREAD EXISTS -> REDIRECT /b/:board
	Threads.findOne({ board }).exec((err, result) => {
		if (err) { return next(err); }

		if ( (result || {}).text === text) {
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

			return res.redirect(`/b/${doc.board}/${thread_id}`);
		});
	});
};

// DELETE

exports.deleteThread = function(req, res, next) {
	var { thread_id, delete_password } = req.body;

	Threads.findById(thread_id).exec((err, doc) => {
		if (err) { return next(err); }

		doc.compareThreadPassword(delete_password, (error, isMatch) => {
			if (error) { return next(error); }

			if (isMatch) {
				doc.remove()
					.then(() => res.send("success"))
					.catch(err => next(err));
			} else {
				res.send("incorrect password");
			}
		});
	})
};

exports.deleteComment = function(req, res, next) {
	var { thread_id, reply_id, delete_password } = req.body;

	Threads.findById(thread_id).exec((err, doc) => {
		if (err) { return next(err); }

		doc.compareReplyPassword(delete_password, reply_id, (error, isMatch) => {
			if (error) { return next(error); }

			if (isMatch) {
				doc.replies.id(reply_id).text = "[deleted]";
				doc.save((subErr) => {
					if (subErr) { return next(subErr); }

					res.send("success");
				});
			} else {
				res.send("incorrect password");
			}
		});
	})
};


// UPDATE
exports.reportThread = function(req, res, next) {
	const { report_id } = req.body;

	Threads.findById(report_id).exec((err, doc) => {
		if (err) { return next(err); }

		doc.reported = true;
		doc.save((error) => {
			if (error) { return next(error); }

			res.send("success");
		});
	})

}

exports.reportComment = function(req, res, next) {
	const { thread_id, reply_id } = req.body;

	Threads.findById(thread_id).exec((err, doc) => {
		if (err) { return next(err); }

		const reply = doc.replies.id(reply_id);
		reply.reported = true;
		doc.save((error) => {
			if (error) { return next(error); }

			res.send("success");
		});
	})

}

