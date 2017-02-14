const NOTIFICATIONS_API_V1 = 'http://api.ft.com/content/notifications/v1/items';
const NOTIFICATIONS_API_V2 = 'http://api.ft.com/content/notifications/';
const QUERY_STRING = `apiKey=${process.env.CAPI_API_KEY}&feature.blogposts=on`;

function getNotifications (url, list = []) {
	return fetch(url)
		.then((res) => {
			if (res.ok) {
				return res.json();
			} else {
				throw new Error(`Notifications API responded with a ${res.status}, ${res.statusText}`);
			}
		})
		.then((data) => {
			// Normalise the notification format and append to any previous list
			list.push.apply(list, normaliseNotifications(data.notifications));

			// Recursively fetch notications if there are more to come
			if (data.notifications.length && data.links.length) {
				const next = data.links[0].href;
				return getNotifications(`${next}&${QUERY_STRING}`, list);
			} else {
				return list;
			}
		});
}

function getNotificationsUrl (options) {
	if (options && options.apiVersion === 1) {
		return NOTIFICATIONS_API_V1;
	} else {
		return NOTIFICATIONS_API_V2;
	}
}

function normaliseNotifications (notifications) {
	const TYPE_V1 = /content-item-(deletion|update)/;
	const TYPE_V2 = /\/ThingChangeType\/(UPDATE|DELETE)/;

	return notifications.map((item) => {
		// V1 format
		// <https://developer.ft.com/docs/api_v1_reference/notifications/>
		const typeV1 = item.type.match(TYPE_V1);

		if (typeV1) {
			return {
				type: typeV1.pop() === 'deletion' ? 'delete' : 'update',
				id: item.data['content-item'].id
			};
		}

		// V2 format
		// <https://developer.ft.com/docs/api_v2_reference/notifications/>
		const typeV2 = item.type.match(TYPE_V2);

		if (typeV2) {
			return {
				type: typeV2.pop() === 'DELETE' ? 'delete' : 'update',
				id: item.id.replace('http://www.ft.com/thing/', '')
			};
		}
	});
}

module.exports = function (since, options) {
	const url = getNotificationsUrl(options);
	return getNotifications(`${url}?since=${since}&${QUERY_STRING}`);
};
