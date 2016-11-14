'use strict';

const sapiUrl = 'http://' + process.env['SAPI_URL'] + '/v1';
const sapiKey = process.env['SAPI_KEY'];
const fetch = require('node-fetch');

const search = (searchStr, maxResults, offset) => {
	const body = {
		queryString: `brand:="FT Alphaville" AND (byline:"${searchStr}" OR title:"${searchStr}")`,
			queryContext: {
			curations: ['ARTICLES', 'BLOGS']
		},
		resultContext: {
				maxResults,
				offset,
				sortOrder: 'DESC',
				sortField: 'lastPublishDateTime'
		}
	};
	return fetch(sapiUrl, {
		timeout: 3000,
		body: JSON.stringify(body),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Api-Key': sapiKey
		}
	}).then(response => {
			if (!response.ok) {
				console.log('Failed getting SAPIv1 content', {
					query: searchStr,
					status: response.status
				});
			}
			return response.json();
		})
		.catch(console.log);

};

module.exports = {
	search
};
