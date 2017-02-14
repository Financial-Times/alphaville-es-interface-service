const cheerio = require('cheerio');
const logger = require('../../../lib/logger');
const map = require('../../../metadata/map');
const deletions = require('../../../metadata/deletions');
const signedFetch = require('signed-aws-es-fetch');
const CLUSTER = require('../../../lib/get-es-cluster');

const MARKETS_URL = 'http://markets.ft.com/data/equities/tearsheet/summary?s=';
const TAG_AUTHORITY = 'http://api.ft.com/system/FT-TME';

module.exports = (xml) => {
	const $ = cheerio.load(xml, { decodeEntities: false });
	const $links = $('ft-concept[type="http://www.ft.com/ontology/company/PublicCompany"]');

	const resolutions = [];

	$links.each((i) => {
		const $link = $links.eq(i);
		const companyUuid = $link.attr('url').split('/').pop();
		const companyText = $link.text().trim();
		const companyLinkLeadingWhitespace = $link.text().match(/^\s/) ? ' ' : '';
		const companyLinkTrailingWhitespace = $link.text().match(/\s$/) ? ' ' : '';

		const resolution = fetchFromConcordanceApi(companyUuid)
			.then(extractTMEIdentifier)
			.then(getTagById)
			.then(extractStockId)
			.then((stockId) => {
				$link.replaceWith(`${companyLinkLeadingWhitespace}<a href="${MARKETS_URL + stockId}" data-symbol="${stockId}">${companyText}</a>${companyLinkTrailingWhitespace}`);
			})
			.catch((err) => {
				logger.warn(`event=PRERESOLVE_COMPANY_FAILED error=${err.toString()}`);
				$link.replaceWith($link.text());
			});

		resolutions.push(resolution);
	});

	return Promise.all(resolutions).then(() => $.html());
};

const fetchFromConcordanceApi = (uuid) => {
	const url = `http://api.ft.com/concordances?conceptId=${uuid}&apiKey=${process.env.CAPI_API_KEY}`;

	return fetch(url).then((res) => {
		if (res.ok) {
			return res.json();
		} else {
			throw new Error(`Concordance API failed with ${res.status}`);
		}
	});
};

const extractTMEIdentifier = (json) => {
	const concordance = json.concordances.find((item) => (
		item.identifier && item.identifier.authority === TAG_AUTHORITY
	));

	if (concordance) {
		return concordance.identifier.identifierValue;
	} else {
		throw new Error('Cannot find TME concordances');
	}
};

function compat (tag) {
	return {
		term: {
			name: tag.prefLabel,
			attributes: tag.attributes,
			id: tag.idV1,
			taxonomy: tag.taxonomy,
			url: tag.url
		}
	};
}

function getTagById (id) {
	if (map[id]) {
		logger.info('tag', map[id]);
		return Promise.resolve(map[id]);
	}
	if (deletions[id]) {
		logger.info('tag', 'Not found, tag has definitely been deleted');
		return Promise.resolve('Not found, tag has definitely been deleted');
	}
	return signedFetch(`https://${CLUSTER}/content/item/_search`, {
		method: 'POST',
		timeout: 3000,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			_source:[ 'metadata'],
			query: {
				term: {
					'metadata.idV1': id
				}
			},
			sort: {
				publishedDate: {
					order: 'desc'
				}
			},
			size: 1
		})
	})
		.then(res => {
			if (res.ok) {
				return res.json();
			}
			throw new Error('Can\'t find tag');
		})
		.then(data => {
			if (data.hits.hits[0]) {
				logger.info('tag', compat(data.hits.hits[0]._source.metadata.find(tag => tag.idV1 === id)));
				return compat(data.hits.hits[0]._source.metadata.find(tag => tag.idV1 === id));
			}

			logger.info('tag', 'Not found, could be deleted or might never had existed');
			return { error: 'Not found, could be deleted or might never had existed' };
		})
		.catch(() => {
			logger.info('tag', 'Server error');

			return { error: 'Server error' };
		});
}

const extractStockId = (json) => {
	const stockId = json.term.attributes.find((attr) => attr.key === 'wsod_key');

	if (stockId) {
		return stockId.value;
	} else {
		throw new Error('Stock ID cannot be found');
	}
};
