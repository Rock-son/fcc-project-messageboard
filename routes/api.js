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
	.put((req, res, next) => {})
	.delete((req, res) => {});


  app.route('/api/replies/:board')
	.get((req, res, next) => {})
	.post((req, res, next) => {
		db.postReply(req, res, next);
	})
	.put((req, res, next) => {})
	.delete((req, res, next) => {});
};
