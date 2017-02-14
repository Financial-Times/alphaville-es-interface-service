'use strict';

module.exports = (endpoint) => {
	return fetch(endpoint, {
		timeout: 9000,
		headers: {
			'X-Api-Key': process.env.CAPI_API_KEY,
			'X-Policy': 'INCLUDE_RICH_CONTENT, INCLUDE_COMMENTS, INTERNAL_UNSTABLE, INCLUDE_PROVENANCE',
			'X-FT-API-Content-Control-Policy': 'FT_B2C_FT_COM_CONTENT_POLICY_2013',
			Authorization: process.env.COCO_API_AUTHORIZATION
		}
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			return response.text()
				.then((text) => {
					const requestId = response.headers.get('x-request-id') || 'UNKNOWN';
					const server = response.headers.get('server') || 'UNKNOWN';
					const masheryMessageId = response.headers.get('x-mashery-message-id') || 'UNKNOWN';
					return Promise.reject({
						error: text,
						status: response.status,
						requestId: requestId,
						server: server,
						masheryMessageId: masheryMessageId
					});
				});
		});
};
