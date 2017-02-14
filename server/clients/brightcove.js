const httpErrors = require('http-errors');

const readResponse = (meta = {}, response) => {
	if (response.ok) {
		return response.json()
	} else {
		return response.text()
			.then(text => {
				throw httpErrors(response.status, text, meta);
			});
	}
};

const getAccessToken = ({
	clientId = process.env.BRIGHTCOVE_CLIENT_ID,
	clientSecret = process.env.BRIGHTCOVE_CLIENT_SECRET
} = {}) => {
	const authString = new Buffer(`${clientId}:${clientSecret}`).toString('base64');
	return fetch('https://oauth.brightcove.com/v3/access_token', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${authString}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'grant_type=client_credentials'
	})
		.then(readResponse.bind(null, { event: 'BRIGHTCOVE_FETCH_ERROR', operation: 'oauth' }))
		.then(({ access_token: accessToken } = {}) => accessToken);
};

const brightcoveRequest = (operation, { accountId = process.env.BRIGHTCOVE_ACCOUNT_ID, accessToken } = {}) => {
	const accessTokenPromise = accessToken ? Promise.resolve(accessToken) : getAccessToken();
	return accessTokenPromise.then(accessToken => {
		return fetch(`https://cms.api.brightcove.com/v1/accounts/${accountId}/${operation}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		})
			.then(readResponse.bind(null, { event: 'BRIGHTCOVE_FETCH_ERROR', operation }));
	});
};

module.exports = {

	accessToken: getAccessToken,

	video: (id, { accessToken } = {}) => {
		return brightcoveRequest(`videos/${id}`, { accessToken });
	},

	renditions: (id, { accessToken } = {}) => {
		return brightcoveRequest(`videos/${id}/sources`, { accessToken });
	},

	images: (id, { accessToken } = {}) => {
		return brightcoveRequest(`videos/${id}/images`, { accessToken });
	},

};
