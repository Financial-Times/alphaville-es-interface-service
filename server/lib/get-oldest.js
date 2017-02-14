'use strict';

const signedFetch = require('signed-aws-es-fetch');
const CLUSTER = require('../lib/get-es-cluster');

module.exports = query => {
	return signedFetch(`https://${CLUSTER}/content/item/_search`, {
			method: 'POST',
			timeout: 3000,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				filter: {
					exists : {
						field: '_lastUpdatedDateTime'
					}
				},
				fields: ['_lastUpdatedDateTime'],
				sort: {
					_lastUpdatedDateTime: 'asc'
				},
				query: query,
				size: 1
			})
		})
		.then(function (res) {
			if (res.ok) {
				return res.json();
			} else {
				return res.json()
					.then(function () {
						throw new Error(`Cannot get oldest content: ${res.status}`);
					});
			}
		});
};
