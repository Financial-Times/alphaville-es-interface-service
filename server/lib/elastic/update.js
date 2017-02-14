const deepDiff = require('deep-diff').diff;
const client = require('../client');
const model = require('./model');
const logChangedContent = require('../log-changed-content');

const get = (uuid) => {
	return client.get({
		id: uuid,
		type: 'item',
		index: 'content'
	})
		.then(result => result._source)
		.catch(() => {});
};

const create = (uuid, newContent) => {
	return client.create({
		id: uuid,
		type: 'item',
		index: 'content',
		body: newContent
	})
		.then(() => logChangedContent({ uuid, changes: {newContent}, event: 'CREATE' }));
};

const reindex = (uuid, newContent, oldContent) => {
	return client.index({
		id: uuid,
		type: 'item',
		index: 'content',
		body: newContent
	})
		.then(() => {
			const diff = deepDiff(newContent, oldContent, (path, key) => {
				// HACK: we don't really want to ignore provenance, but the URL has a cachebuster
				return key === '_lastUpdatedDateTime' || key === 'provenance';
			});

			if (diff) {
				return logChangedContent({ uuid, changes: {diff, newContent, oldContent}, event: 'UPDATE' });
			}
		});
};

module.exports = function (uuid) {
	return Promise.all([
		// model the requested ID
		model(uuid),
		// and also attempt to fetch the existing
		get(uuid)
	])
		.then(([ newContent, oldContent ]) => {
			if (oldContent) {
				return reindex(uuid, newContent, oldContent);
			} else {
				return create(uuid, newContent);
			}
		});
};
