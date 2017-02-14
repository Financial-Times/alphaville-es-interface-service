const logger = require('../../lib/logger');

const FAST_FT = 'NTlhNzEyMzMtZjBjZi00Y2U1LTg0ODUtZWVjNmEyYmU1NzQ2-QnJhbmRz';

// HACK: temporary hack while triaging fastft publish delays
module.exports = (uuid, tags = []) => {
	if (tags.some((tag) => tag.idV1 === FAST_FT)) {
		logger.warn({ event: 'FASTFT_CONTENT_MONITOR', uuid, tagged: true });
		return tags;
	} else {
		logger.warn({ event: 'FASTFT_CONTENT_MONITOR', uuid, tagged: false });

		return [].concat(tags, {
			'idV1': FAST_FT,
			'prefLabel': 'Fast FT',
			'taxonomy': 'brand',
			'primary': 'brand',
			'attributes': [],
			'url': 'https://www.ft.com/fastft'
		});
	}
};
