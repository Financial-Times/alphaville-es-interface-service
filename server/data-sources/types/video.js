const { zip } = require('promise-patterns');
const brightcoveClient = require('../../clients/brightcove');
const Type = require('./type');
const validateContent = require('./validation/content');

const fetchBrightcoveData = (id) => {
	// we can use a single token for both requests (tokens last 300 seconds)
	return brightcoveClient.accessToken()
		.then((accessToken) => (
			Promise.all([
				brightcoveClient.video(id, { accessToken }),
				brightcoveClient.renditions(id, { accessToken })
			])
		))
		.then(([ metadata, renditions ]) => {
			if (metadata && metadata.state !== 'ACTIVE') {
				throw new Error('Requested video has not been activated');
			}

			return { metadata, renditions };
		});
};

const decorate = ({ capiV2 }) => {
	const brightcoveId = capiV2.webUrl.replace('http://video.ft.com/', '');

	// zip is like Promise.all but for objects =]
	return zip({
		capiV2,
		brightcove: fetchBrightcoveData(brightcoveId)
	});
};

class VideoType extends Type {
	static match ({ capiV2 }) {
		return capiV2 && capiV2.webUrl && capiV2.webUrl.includes('video.ft.com');
	}

	static get model () {
		return require('../../models/video');
	}

	static check (content) {
		const issues = validateContent(content);
		if (issues.length) {
			throw new Error(issues.join());
		}
		return content;
	}

	data () {
		return decorate(this.initialData);
	}
}

module.exports = VideoType;
