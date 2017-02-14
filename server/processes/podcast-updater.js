const FeedMe = require('feedme');
const { retry, chunk } = require('promise-patterns');
const logger = require('../lib/logger');
const podcastModelV3 = require('../models/podcast-v3');
const podcastLegacyMapping = require('../lib/podcast-legacy-mapping');
const signedFetch = require('signed-aws-es-fetch');

function PodcastUpdater (options) {
	this.options = options;
	this.cache = {};
}

PodcastUpdater.prototype.init = function () {
	const chain = Promise.resolve();

	!this.options.quiet && logger.info('Starting to fetch feed ' + this.options.rssFeedUrl + '.');

	// Old podcasts maintain their existing IDs which tend to be URLs rather
	// than GUIDs. These are maintained in a Google spreadsheet.
	if (this.options.legacyMappingUrl) {
		chain
			.then(() => this.loadLegacyMappingData())
			.then((data) => { this.legacyMappingData = data; });
	}

	if (!this.options.all) {
		chain
			.then(() => this.fetchLastUpdate())
			.then((datetime) => { this.cache.lastUpdateDatetime = datetime; });
	}

	return chain
		.then(this.fetchRssFeed.bind(this))
		.then(this.processRssFeed.bind(this))
		.then(() => logger.info(`event=PODCAST_UPDATER_COMPLETE feed=${this.options.rssFeedUrl}`))
		.catch((err) => logger.error(`event=PODCAST_UPDATER_FAILED feed=${this.options.rssFeedUrl} error=${err.toString()}`));
};

PodcastUpdater.prototype.loadLegacyMappingData = function () {
	return podcastLegacyMapping.load(this.options.legacyMappingUrl);
};

PodcastUpdater.prototype.fetchLastUpdate = function () {
	const postBody = {
		size: 1,
		filter: {
			term: {
				provenance: this.options.rssFeedUrl
			}
		},
		sort: {
			'_timestamp': 'desc'
		},
		_source: [ '_lastUpdatedDateTime' ],
	};

	const payload = {
		method: 'POST',
		timeout: 3000,
		body: JSON.stringify(postBody),
		headers: { 'Content-Type': 'application/json' }
	};

	return signedFetch(`https://${this.options.elasticSearchUrl}/content/item/_search`, payload)
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(`Elasticsearch returned a ${response.status}`);
			}
		})
		.then((data) => {
			if (data.error) {
				throw new Error(data.error);
			}

			if (data.hits.total) {
				return new Date(data.hits.hits[0]._source._lastUpdatedDateTime);
			}
		});
};

PodcastUpdater.prototype.fetchRssFeed = function () {
	const parser = new FeedMe(true);

	return fetch(this.options.rssFeedUrl, { timeout: 3000 })
		.then((response) => {
			if (response.ok) {
				return response.text();
			} else {
				throw new Error(`Acast returned a ${response.status}`);
			}
		})
		.then((text) => {
			parser.on('error', (error) => {
				throw error;
			});

			parser.write(text);

			return parser.done();
		});
};

PodcastUpdater.prototype.processRssFeed = function (feed) {
	let items = feed.items;

	if (this.cache.lastUpdateDatetime) {
		const time = this.cache.lastUpdateDatetime.getTime();

		items = items.filter((item) => {
			const published = new Date(item.pubdate);
			return !time || time < published.getTime();
		});
	}

	this.cache.rssFeedMeta = {
		title: feed.title,
		defaultImage: feed['itunes:image'].href,
		masterSource: this.options.rssFeedUrl,
		byline: feed['itunes:summary']
	};

	!this.options.quiet && logger.info('' + items.length + ' podcast items to update.');

	// wrap each into a callback so we can throttle them
	const requests = items.map((item) => (
		() => this.processRssFeedItem(item).catch((err) => logger.warn(err))
	));

	return chunk(requests, 10);
};

PodcastUpdater.prototype.processRssFeedItem = function (item) {
	const postBody = {
		doc_as_upsert: true
	};

	let id;

	return podcastModelV3(item, this.cache.rssFeedMeta)
		.then((response) => {
			postBody.doc = response;
			id = postBody.doc.id;

			if (this.legacyMappingData && /^https?/.test(id)) {
				const guid = podcastLegacyMapping.find(this.legacyMappingData, id);

				if (guid) {
					postBody.doc.id = id = guid;
				} else {
					return Promise.reject('New GUID could not be found for ' + id + '.');
				}
			}

			// HACK: Add ‘url’ to the Podcast item
			postBody.doc.url = 'https://www.ft.com/content/' + postBody.doc.id;

			return retry(() => this.updateRssFeedItem(id, postBody), 3);
		});
};

PodcastUpdater.prototype.updateRssFeedItem = function (id, postBody) {
	const endpoint = `https://${this.options.elasticSearchUrl}/content/item/${id}/_update`;

	const payload = {
		method: 'POST',
		timeout: 3000,
		body: JSON.stringify(postBody),
		headers: { 'Content-Type': 'application/json' }
	};

	!this.options.quiet && logger.info('Indexing podcast ' + id + '.');

	return signedFetch(endpoint, payload)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			if (data.error) {
				throw new Error(data.error);
			}

			!this.options.quiet && logger.info('' + id + ' updated to version ' + data._version + '.');

			return Promise.resolve();
		});
};

module.exports = PodcastUpdater;
