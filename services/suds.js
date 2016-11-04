"use strict";

const fetch = require('node-fetch');
const qs = require('querystring');

function SudsApiError(message, code, response) {
	this.message = message;
	this.errMsg = message;
	this.errCode = code;
	this.response = response;
}
SudsApiError.prototype = new Error('sudsApi');

exports.getHotArticles = function (query) {
	const url = process.env.SUDS_API_URL + '/v1/livefyre/hottest';
	query = query || {};

	return fetch(`${url}?${qs.stringify(query)}`).then((res) => {
		if (!res.ok) {
			throw new SudsApiError(res.statusText, res.status, res);
		}
		return res.json();
	});
};
