const isFtUrl = (url) => {
	return /^https:\/\/www\.ft\.com\/content\/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/.test(url);
};

const extractUuid = (url) => {
	return url.replace('https://www.ft.com/content/', '');
};

module.exports = (metadata = {}) => {
	const { custom_fields: customFields } = metadata;
	const storyPackage = [];

	customFields && Object.keys(customFields)
		.map((fieldName) => {
			const fieldValue = customFields[fieldName];
			// linked articles fields have the format `relatedlinkX(url|txt)`
			const [, linkIndex] = (/^relatedlink(\d)url$/.exec(fieldName) || []);

			if (linkIndex && isFtUrl(fieldValue)) {
				storyPackage[linkIndex] = ({
					id: extractUuid(fieldValue),
					title: customFields[`relatedlink${linkIndex}txt`] || ''
				})
			}
		});

	if (metadata.link && isFtUrl(metadata.link.url) && metadata.link.text) {
		storyPackage.unshift({
			id: extractUuid(metadata.link.url),
			title: metadata.link.text
		})
	}

	// filter out empties
	return storyPackage.filter((item) => item);
};
