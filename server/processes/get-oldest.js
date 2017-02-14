const signedFetch = require('signed-aws-es-fetch');
const CLUSTER = require('../lib/get-es-cluster');

module.exports = function (size = 100) {
	// podcasts do their own thing
	const excludePodcasts = {
		bool: {
			must_not: [
				{ regexp: { provenance: '.*acast.*' } }
			]
		}
	};

	const body = {
		fields: ['_lastUpdatedDateTime'],
		sort: {
			_lastUpdatedDateTime: 'asc'
		},
		filter: excludePodcasts,
		size
	};

	return signedFetch(`https://${CLUSTER}/content/item/_search`, {
		method: 'POST',
		timeout: 9000,
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then((res) => {
			if (res.ok) {
				return res.json();
			} else {
				throw new Error(`Elastic responded with a ${res.status}, ${res.statusText}`);
			}
		})
		.then((data) => {
			// re-format the response so we only get the data we need.
			return data.hits.hits.map((item) => ({
				id: item._id,
				lastUpdated: item.fields._lastUpdatedDateTime[0]
			}));
		});
};
