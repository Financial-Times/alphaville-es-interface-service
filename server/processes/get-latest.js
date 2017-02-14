const signedFetch = require('signed-aws-es-fetch');
const CLUSTER = require('../lib/get-es-cluster');

function fetchFromSAPI (maxResults = 100, offset = 0) {
	// allow 5 minute grace period for content to appear
	const minutesAgo = 1000 * 60 * 5;
	const isoDate = new Date(Date.now() - minutesAgo).toISOString();
	const formattedTime = isoDate.replace(/\.[0-9]+Z$/, 'Z');

	const query = {
		queryString: `lastPublishDateTime:<${formattedTime}`,
		queryContext: {
			curations: ['ARTICLES', 'BLOGS']
		},
		resultContext: {
			sortOrder: 'DESC',
			sortField: 'lastPublishDateTime',
			maxResults,
			offset
		}
	};

	// <https://developer.ft.com/docs/api_v1_reference/search/>
	return fetch(process.env.DIRECT_SEARCH_API_URL, {
		method: 'POST',
		timeout: 9000,
		headers: {
			'X-Api-Key': process.env.CAPI_API_KEY,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(query)
	})
		.then((res) => {
			if (res.ok) {
				return res.json();
			} else {
				throw new Error(`Search API responded with a ${res.status}`);
			}
		})
		.then((data) => {
			return data.results[0].results.map((result) => result.id);
		});
}

function fetchFromElastic (ids) {
	const query = {
		docs: ids.map((id) => ({
			_id: id,
			_source: false
		}))
	};

	return signedFetch(`https://${CLUSTER}/content/item/_mget`, {
		method: 'POST',
		timeout: 9000,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(query)
	})
		.then((res) => {
			if (res.ok) {
				return res.json();
			} else {
				throw new Error(`Elastic MGET responded with a ${res.status}`);
			}
		})
		.then((data) => data.docs);
}

function pingCAPI (id) {
	// Just fetch enough to validate
	return fetch(`http://api.ft.com/content/items/v1/${id}?aspects=body,title,metadata`, {
		timeout: 9000,
		headers: {
			'X-Api-Key': process.env.CAPI_API_KEY
		}
	})
		.then((res) => {
			if (res.ok) {
				return res.json();
			} else {
				throw new Error(`CAPI V1 responded with a ${res.status} for ${id}`);
			}
		})
		.then((data) => (
			{ id, ok: validateCAPI(data) }
		))
		.catch(() => (
			{ id, ok: false }
		));
}

function validateCAPI (data) {
	const properties = [
		'item.body.body',
		'item.title.title',
		'item.metadata.tags'
	];

	return properties.every((path) => {
		return path.split('.').reduce((node, prop) => {
			return node && node.hasOwnProperty(prop) ? node[prop] : false;
		}, data);
	});
}

module.exports = function () {
	// get the latest content from SAPI
	return fetchFromSAPI()

	// then try to retrieve them from ES
	.then(fetchFromElastic)

	.then((docs) => {
		// filter out those we already have
		const missing = docs.filter((item) => !item.found);

		// now check if the remaining items still exist
		return Promise.all(
			missing.map((doc) => pingCAPI(doc._id))
		);
	})

	// lastly, only return the items we can ingest
	.then((items) => items.filter((item) => item.ok).map((item) => item.id));
};
