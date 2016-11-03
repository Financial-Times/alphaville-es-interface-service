"use strict";

const fetch = require('node-fetch');

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

	let queryString = "";
	if (query) {
		Object.keys(query).forEach((key) => {
			if (typeof query[key] === 'string') {
				queryString += `&${key}=${query[key]}`;
			} else if (query[key] instanceof Array) {
				query[key].forEach((value) => {
					queryString += `&${key}=${value}`;
				});
			}
		});
	}

	if (queryString) {
		queryString = queryString.substr(1);
	}

	return fetch(`${url}?${queryString}`).then((res) => {
		if (!res.ok) {
			throw new SudsApiError(res.statusText, res.status, res);
		}
		return res.json();
	});
};
