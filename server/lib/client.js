const elasticsearch = require('elasticsearch');
const connectionClass = require('http-aws-es');

function region (url) {
	return url.match(/\.(\w{2}-\w{4}-\d)\.es\.amazonaws\.com/).pop();
}

// Elastic version
const apiVersion = '1.5';

module.exports = new elasticsearch.Client({
	apiVersion,
	connectionClass,
	amazonES: {
		accessKey: process.env.AWS_ACCESS_KEY,
		secretKey: process.env.AWS_SECRET_ACCESS_KEY,
		region: region(process.env.ELASTIC_SEARCH_HOST)
	},
	host: 'https://' + process.env.ELASTIC_SEARCH_HOST,
	requestTimeout: 9000,
	keepAlive: true
});
