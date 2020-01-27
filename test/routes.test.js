require('dotenv').config();
const request = require('supertest');
const expect = require('expect');
const app = require('../server').startServer({id: 1});


describe('api routes', () => {
	describe('GET /', () => {
		it('api should be up', (done) => {
			request(app)
				.get('/')
				.expect(200)
				.end((err, res) => {
					expect(res.text).toBe('hello');
					done();
				});
		});
	});

	describe('GET /v1.*', () => {
		it('should require an api key', (done) => {
			request(app)
				.get('/v1')
				.expect(401)
				.end((err, res) => {
					expect(res.text).toBe('Unauthorized');
					done();
				});
		});
	});
	describe('GET /v1/articles', () => {
		it('should return one article when limit is set to 1', (done) => {
			request(app)
				.get('/v1/articles?limit=1')
				.set('X-API-KEY', process.env['API_KEY'])
				.expect(200)
				.end((err, res) => {
					expect(res.body).toBeAn(Array);
					expect(res.body.length).toBe(1);
					done();
				});
		});
		it('should return one article when limit is set to 1 and search term is set', (done) => {
			request(app)
				.get(`/v1/articles?q=${encodeURIComponent('Paul Murphy')}&limit=1`)
				.set('X-API-KEY', process.env['API_KEY'])
				.expect(200)
				.end((err, res) => {
					expect(res.body).toBeAn(Array);
					expect(res.body.length).toBe(1);
					done();
				});
		});
	});
	describe('GET /v1/author', () => {
		it('should return one article by the searched author when limit is set to 1', (done) => {
			let author = 'Paul Murphy';
			request(app)
				.get(`/v1/articles?q=${encodeURIComponent(author)}&limit=1`)
				.set('X-API-KEY', process.env['API_KEY'])
				.expect(200)
				.end((err, res) => {
					expect(res.body).toBeAn(Array);
					expect(res.body.length).toBe(1);
					expect(res.body[0].byline).toEqual(author);
					done();
				});
		});
	});
	describe('GET /v1/article', () => {
		before(() => {
			let articleId = null;
		});
		it('should return one article by vanity', (done) => {
			request(app)
				.get(`/v1/article/${process.env['TEST_ARTICLE_VANITY']}`)
				.set('X-API-KEY', process.env['API_KEY'])
				.expect(200)
				.end((err, res) => {
					articleId = res.body._id;
					expect(res.body).toBeAn(Object);
					done();
				});
		});
		it('should return the same article by uuid', (done) => {
			request(app)
				.get(`/v1/article/${articleId}`)
				.set('X-API-KEY', process.env['API_KEY'])
				.expect(200)
				.end((err, res) => {
					expect(res.body).toBeAn(Object);
					expect(res.body._id).toEqual(articleId);
					done();
				});
		});
	});
});
