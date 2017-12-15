"use strict";

const ccsUrl = process.env.CCS_URL;
const fetch = require('node-fetch');
const _ = require('lodash');


exports.getAllComments = function (config) {
	let url = `https://${ccsUrl}/v1/getComments?title=${config.title}&url=${config.url}&articleId=${config.articleId}`;

	const order = config.order === 'ascending' ? 'ascending' : 'descending';

	if (!isNaN(config.pageNumber)) {
		url += `&pageNumber=${config.pageNumber}`;
	}

	return fetch(url).then((response) => {
		if (response.ok) {
			return response.json();
		} else {
			console.error('Unable to fetch comments or comments not available.');

			return {};
		}
	}).then((data) => {
		if (data && data.collection && data.collection.collectionId) {
			let comments = [];
			if (config.comments) {
				comments = config.comments;
			}

			if (order === 'ascending') {
				data.collection.comments.reverse();
				comments = data.collection.comments.concat(comments);
			} else {
				comments = comments.concat(data.collection.comments);
			}

			if (typeof data.collection.nextPage === 'number') {
				return exports.getAllComments(_.extend({}, config, {
					pageNumber: data.collection.nextPage,
					comments: comments
				}));
			} else {
				return comments;
			}
		} else {
			return data;
		}
	});
};
