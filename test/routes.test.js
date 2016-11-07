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
					expect(res.body.hits.hits).toBeAn(Array);
					expect(res.body.hits.hits.length).toBe(1);
					done();
				});
		});
		it('should return one article when limit is set to 1 and search term is set', (done) => {
			request(app)
				.get(`/v1/articles?q=${encodeURIComponent('Paul Murphy')}&limit=1`)
				.set('X-API-KEY', process.env['API_KEY'])
				.expect(200)
				.end((err, res) => {
					expect(res.body.hits.hits).toBeAn(Array);
					expect(res.body.hits.hits.length).toBe(1);
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
					expect(res.body.hits.hits).toBeAn(Array);
					expect(res.body.hits.hits.length).toBe(1);
					expect(res.body.hits.hits[0]._source.byline).toEqual(author);
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
					expect(res.body._source).toBeAn(Object);
					done();
				});
		});
		it('should return the same article by uuid', (done) => {
			request(app)
				.get(`/v1/article/${articleId}`)
				.set('X-API-KEY', process.env['API_KEY'])
				.expect(200)
				.end((err, res) => {
					expect(res.body._source).toBeAn(Object);
					expect(res.body._id).toEqual(articleId);
					done();
				});
		});
	});
	describe('GET /v1/marketslive', () => {
		before(() => {
			let mlArticleId = null;
		});
		it('should return one article when limit is set to 1', (done) => {
			request(app)
				.get(`/v1/marketslive?limit=1`)
				.set('X-API-KEY', process.env['API_KEY'])
				.expect(200)
				.end((err, res) => {
					expect(res.body.hits.hits).toBeAn(Array);
					expect(res.body.hits.hits.length).toBe(1);
					done();
				});
		});
		it('should return one article by vanity', (done) => {
			request(app)
				.get(`/v1/marketslive${process.env['TEST_ML_ARTICLE_VANITY']}`)
				.set('X-API-KEY', process.env['API_KEY'])
				.expect(200)
				.end((err, res) => {
					mlArticleId = res.body._id;
					expect(res.body._source).toBeAn(Object);
					done();
				});
		});
		it('should return the same article by uuid', (done) => {
			request(app)
				.get(`/v1/article/${mlArticleId}`)
				.set('X-API-KEY', process.env['API_KEY'])
				.expect(200)
				.end((err, res) => {
					expect(res.body._source).toBeAn(Object);
					expect(res.body._id).toEqual(mlArticleId);
					done();
				});
		});
	});
	describe('GET /v1/hotarticles', () => {
		it('should return the hottest article when limit is set to 1', (done) => {
			request(app)
				.get(`/v1/hotarticles?limit=1`)
				.set('X-API-KEY', process.env['API_KEY'])
				.expect(200)
				.end((err, res) => {
					expect(res.body.hits.hits).toBeAn(Array);
					expect(res.body.hits.hits.length).toBe(1);
					done();
				});
		});
	});
});
