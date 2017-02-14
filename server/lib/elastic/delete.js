const client = require('../client');
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

module.exports = function (uuid) {
	return get(uuid)
		.then(oldContent => {
			return client.delete({
				id: uuid,
				type: 'item',
				index: 'content'
			})
				.then(() => logChangedContent({ uuid, changes: {oldContent}, event: 'DELETE' }));
		});
};
