"use strict";

const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const bcrypt = require("bcrypt-nodejs");

// DEFINE MODELS
const ReplySchema = new Schema({
	text: {
		type: String, required: true, trim: true
	},
	created_on: {
		type: Date, default: new Date()
	},
	bumped_on: {
		type: Date, default: new Date()
	},
	delete_password: {
		type: String, required: true,
	},
	reported: {
		type: Boolean, default: false
	}
},
{ 
	writeConcern: {
		w: 'majority',
		j: true,
		wtimeout: 1000
	}
});
ReplySchema.pre("save", function a(next) {
	const reply = this;
	this.bumped_on = new Date();
	if (reply.isNew) {
		return bcrypt.genSalt(10, (err, salt) => {
			if (err) { return next(err); }

			return bcrypt.hash(reply.delete_password, salt, null, (errB, hash) => {
				if (errB) { return next(errB); }

				reply.delete_password = hash;
				return next(); // i.e. saves the model
			});
		});
	} else {
		next();
	}
});
ReplySchema.pre("update", function a(next) {
	this.bumped_on = new Date();
	return next();
});


const MessageBoardSchema = new Schema({

	board: {
		type: String, required: true, trim: true
	},
	text: {
		type: String, required: true, trim: true
	},
	created_on: {
		type: Date, default: new Date()
	},
	bumped_on: {
		type: Date, default: new Date()
	},
	reported: {
		type: Boolean, default: false
	},
	delete_password: {
		type: String, required: true
	},
	replies: {
		type: [ ReplySchema ], trim: true, default: []
	}
},
{ 
	writeConcern: {
		w: 'majority',
		j: true,
		wtimeout: 1000
	}
});

MessageBoardSchema.pre("save", function a(next) {
	const messageBoard = this;
	this.bumped_on = new Date();
	if (messageBoard.isNew) {
		return bcrypt.genSalt(10, (err, salt) => {
			if (err) { return next(err); }

			return bcrypt.hash(messageBoard.delete_password, salt, null, (errB, hash) => {
				if (errB) { return next(errB); }

				messageBoard.delete_password = hash;
				return next(); // i.e. saves the model
			});
		});
	} else{
		next();
	}
});

MessageBoardSchema.methods.compareThreadPassword = function b(candidatePassword, callback) {
	const messageBoard = this;
	bcrypt.compare(candidatePassword, messageBoard.delete_password, (err, isMatch) => {
		if (err) { return callback(err); }

		return callback(null, isMatch);
	});
};

MessageBoardSchema.methods.compareReplyPassword = function c(candidatePassword, replyId, callback) {
	const thread = this;
	const reply = thread.replies.id(replyId);

	bcrypt.compare(candidatePassword, reply.delete_password, (err, isMatch) => {
		if (err) { return callback(err); }

		return callback(null, isMatch);
	});
};


module.exports.Threads = mongoose.model("Threads", MessageBoardSchema, "messageboard");
