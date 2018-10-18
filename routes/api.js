/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

var expect = require('chai').expect;
var mongoose = require("mongoose");

var db = require("../db/controller");

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB, { useNewUrlParser: true, autoIndex: false });
mongoose.set('useFindAndModify', false);

module.exports = function (app) {

  app.route('/api/threads/:board')
	.get((req, res, next) => {
		db.getThreads(req, res, next);
	})
	.post((req, res, next) => {
		db.postThread(req, res, next);
	})
	.put((req, res, next) => {
		db.reportThread(req, res, next);
	})
	.delete((req, res, next) => {
		db.deleteThread(req, res, next);
	});


  app.route('/api/replies/:board')
	.get((req, res, next) => {
		db.getOneThread(req, res, next);
	})
	.post((req, res, next) => {
		db.postReply(req, res, next);
	})
	.put((req, res, next) => {
		db.reportComment(req, res, next);
	})
	.delete((req, res, next) => {
		db.deleteComment(req, res, next);
	});
};
