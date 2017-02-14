const logger = require('../lib/logger');
const fetchCapiJson = require('../lib/fetch-capi-json');
const types = require('./types');

const fetchCapiV1 = (uuid) => (
	fetchCapiJson(`http://api.ft.com/content/items/v1/${uuid}?cb=${Date.now()}`)
		.catch((error) => {
			logger.warn({ event: 'CAPI_V1_FETCH_FAIL', uuid, status: error.status, requestId: error.requestId, error: error.error });
		})
);

const fetchCapiV2 = (uuid) => (
	fetchCapiJson(`https://${process.env.COCO_API_HOST}/enrichedcontent/${uuid}?cb=${Date.now()}`)
		.catch((error) => {
			logger.warn({ event: 'CAPI_V2_FETCH_FAIL', uuid, status: error.status, requestId: error.requestId, error: error.error });
		})
);

const matchContentType = (data) => {
	const ContentType = types.find((Type) => Type.match(data));

	if (ContentType) {
		return new ContentType(data);
	} else {
		throw new Error('No matching content types');
	}
};

// This will initially fetch content from CAPI V1 and V2.
// Extensions for different content types may then take over and append extra data.
module.exports = (uuid) => {
	return Promise.all([
		fetchCapiV1(uuid),
		fetchCapiV2(uuid)
	])
		.then(([ capiV1, capiV2 ]) => {
			// TODO: how to associate with correct model
			if (capiV1 || capiV2) {
				return matchContentType({ capiV1, capiV2 });
			} else {
				throw new Error('No responses from CAPI V1 or V2');
			}
		});
};
