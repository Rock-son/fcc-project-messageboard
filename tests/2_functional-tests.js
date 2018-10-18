/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chaiDatetime = require('chai-datetime');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var thread_id = "";
var reply_id = "";
var testingBoard = "testing_my_ass_off";

chai.use(chaiHttp);
chai.use(chaiDatetime);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {

    suite('POST', function() {
		test('#example Test POST /api/threads/:board', function(done) {
			chai.request(server)
			.post(`/api/threads/${testingBoard}`)
			.redirects(0)
			.send({ board: testingBoard, text:"interesting thread", delete_password: "123456"})
			.end(function(err, res){
				assert.equal(res.status, 302);
				done();
			});
		});
    });

    suite('GET', function() {
		test('#example Test GET /api/threads/:board', function(done) {
			chai.request(server)
			.get(`/api/threads/${testingBoard}`)
			.end(function(err, res){
				let reply = JSON.parse(res.text);
				reply = reply[0];
				thread_id = reply._id;

				assert.equal(res.status, 200);
				assert.equal(reply.board, testingBoard);
				assert.equal(reply.text, 'interesting thread');
				assert.isArray(reply.replies);
				assert.equal(reply.replycount, reply.replies.length);
				assert.withinDate(new Date(reply.bumped_on), new Date(Date.now() - 5000), new Date());
				assert.withinDate(new Date(reply.created_on), new Date(Date.now() - 5000), new Date());
				done();
			});
		});
    });

    suite('PUT', function() {
		test('#example Test UPDATE /api/threads/:board', function(done) {
			chai.request(server)
			.put(`/api/threads/${testingBoard}`)
			.send({ report_id: thread_id})
			.end(function(err, res){
				assert.equal(res.status, 200);
				assert.equal(res.text,"success"),
				done();
			});
		});
		test('#example Test GET UPDATED /api/replies/:board', function(done) {
			chai.request(server)
			.get(`/api/replies/${testingBoard}`)
			.query({ thread_id })
			.end(function(err, res){
				const reply = JSON.parse(res.text);

				assert.equal(res.status, 200);
				assert.equal(reply.board, testingBoard);
				assert.equal(reply.reported, true);
				assert.withinDate(new Date(reply.bumped_on), new Date(Date.now() - 5000), new Date());
				done();
			});
		});
	});

	suite('DELETE', function() {
		test('#example Test DELETE /api/threads/:board', function(done) {
			chai.request(server)
			.delete(`/api/threads/${testingBoard}`)
			.send({ thread_id, delete_password: "123456"})
			.end(function(err, res){
				assert.equal(res.status, 200);
				assert.equal(res.text, "success"),
				done();
			});
		});
		test('#example Test GET DELETED /api/replies/:board', function(done) {
			chai.request(server)
			.get(`/api/replies/${testingBoard}`)
			.query({ thread_id })
			.end(function(err, res){

				assert.equal(res.status, 200);
				assert.isNotOk(res.text)
				done();
			});
		});
    });
  });

// FOR POPULAING DELETED THREAD PURPOSE
suite('POST NEW THREAD', function() {
	test('#example Test POST /api/threads/:board', function(done) {
		chai.request(server)
		.post(`/api/threads/${testingBoard}`)
		.redirects(0)
		.send({ board: testingBoard, text:"interesting thread", delete_password: "123456"})
		.end(function(err, res){
			assert.equal(res.status, 302);
			done();
		});
	});
});

suite('GET THREAD_ID', function() {
	test('#example Test GET /api/threads/:board', function(done) {
		chai.request(server)
		.get(`/api/threads/${testingBoard}`)
		.end(function(err, res){
			let reply = JSON.parse(res.text);
			reply = reply[0];
			thread_id = reply._id;
			assert.equal(res.status, 200);
			done();
		});
	});
});


  suite('API ROUTING FOR /api/replies/:board', function() {

    suite('POST', function(done) {
		test('#example Test POST /api/replies/test', function(done) {
			chai.request(server)
			.post(`/api/replies/${testingBoard}`)
			.redirects(0)
			.send({ thread_id, text:"garbage comment", delete_password: "123"})
			.end(function(err, res){
				assert.equal(res.status, 302);
				done();
			});
		});
    });

    suite('GET', function(done) {
		test('#example Test GET /api/replies/:board', function(done) {
			chai.request(server)
			.get(`/api/replies/${testingBoard}`)
			.query({ thread_id })
			.end(function(err, res){
				const reply = JSON.parse(res.text);
				thread_id = reply._id;
				reply_id = reply.replies[0]._id;

				assert.equal(res.status, 200);
				assert.equal(reply.board, testingBoard);
				assert.equal(reply.text, 'interesting thread');
				assert.isArray(reply.replies);
				assert.equal(reply.replies[0].text, 'garbage comment');
				assert.equal(reply.replies[0].reported, false);
				assert.equal(reply.replies.length, 1);
				assert.withinDate(new Date(reply.bumped_on), new Date(Date.now() - 5000), new Date());
				assert.withinDate(new Date(reply.replies[0].bumped_on), new Date(Date.now() - 5000), new Date());
				done();
			});
		});
    });

    suite('PUT', function(done) {
		test('#example Test UPDATE/report comment /api/replies/:board', function(done) {
			chai.request(server)
			.put(`/api/replies/${testingBoard}`)
			.send({ thread_id, reply_id })
			.end(function(err, res){
				assert.equal(res.status, 200);
				assert.equal(res.text, "success"),
				done();
			});
		});
		test('#example Test GET UPDATED /api/replies/:board', function(done) {
			chai.request(server)
			.get(`/api/replies/${testingBoard}`)
			.query({ thread_id })
			.end(function(err, res){
				const reply = JSON.parse(res.text);

				assert.equal(res.status, 200);
				assert.equal(reply._id, thread_id);
				assert.equal(reply.board, testingBoard);
				assert.equal(reply.text, 'interesting thread');
				assert.equal(reply.replies.length, 1);
				assert.equal(reply.replies[0].text, 'garbage comment');
				assert.equal(reply.replies[0].reported, true);
				assert.withinDate(new Date(reply.bumped_on), new Date(Date.now() - 5000), new Date());
				assert.withinDate(new Date(reply.replies[0].bumped_on), new Date(Date.now() - 5000), new Date());
				done();
			});
		});
    });

    suite('DELETE', function(done) {
		test('#example Test DELETE /api/replies/:board', function(done) {
			chai.request(server)
			.delete(`/api/replies/${testingBoard}`)
			.send({ thread_id, reply_id, delete_password: "123"})
			.end(function(err, res){
				assert.equal(res.status, 200);
				assert.equal(res.text, "success"),
				done();
			});
		});
		test('#example Test GET DELETED /api/replies/:board', function(done) {
			chai.request(server)
			.get(`/api/replies/${testingBoard}`)
			.query({ thread_id, reply_id })
			.end(function(err, res){
				const reply = JSON.parse(res.text);

				assert.equal(res.status, 200);
				assert.equal(reply._id, thread_id);
				assert.equal(reply.board, testingBoard);
				assert.equal(reply.text, 'interesting thread');
				assert.equal(reply.replies.length, 1);
				assert.equal(reply.replies[0].text, '[deleted]');
				assert.equal(reply.replies[0].reported, true);
				assert.withinDate(new Date(reply.bumped_on), new Date(Date.now() - 5000), new Date());
				assert.withinDate(new Date(reply.replies[0].bumped_on), new Date(Date.now() - 5000), new Date());
				done();
			});
		});
		test('#DELETE THREAD FOR NEW TEST /api/threads/:board', function(done) {
			chai.request(server)
			.delete(`/api/threads/${testingBoard}`)
			.send({ thread_id, delete_password: "123456"})
			.end(function(err, res){
				assert.equal(res.status, 200);
				assert.equal(res.text, "success"),
				done();
			});
		});
    });

  });

});
