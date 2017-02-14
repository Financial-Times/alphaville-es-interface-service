const client = require('../client');
const model = require('./model');
const { chunk } = require('promise-patterns');

const callback = (uuid) => {
	return () => model(uuid).catch(() => {});
};

const format = (item) => {
	// <https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html>
	const description = {
		index: { _index: 'content', _type: 'item', _id: item.id }
	};

	return [ description, item ];
};

module.exports = function (uuids) {
	// wrap each request in a callback so they may be throttled
	const models = uuids.map(callback);

	return chunk(models, 10).then((items) => {
		const queue = [];

		items.forEach((item) => {
			item && queue.push.apply(queue, format(item));
		});

		return client.bulk({ body: queue });
	});
};
