const logger = require('./logger');
const fetchCapiJson = require('./fetch-capi-json');
const Base64 = require('js-base64').Base64;

// HACK: Pure filth.
// When concording V2 to V1 we don't get the taxonomy. Fortunately TME tags are base64 encoded
// and the taxonomy is shoved on the end (sort of)...
const TAXONOMY_SUFFIXES = {
	[Base64.encode('Authors')]: 'authors',
	[Base64.encode('Brands')]: 'brand',
	[Base64.encode('Genres')]: 'genre',
	[Base64.encode('ON')]: 'organisations',
	[Base64.encode('PN')]: 'people',
	[Base64.encode('GL')]: 'regions',
	[Base64.encode('Sections')]: 'sections',
	[Base64.encode('SpecialReports')]: 'specialReports',
	[Base64.encode('Topics')]: 'topics'
};

const AUTHORITY = 'http://api.ft.com/system/FT-TME';

function getTaxonomyFromID (id) {
	return TAXONOMY_SUFFIXES[id.split('-').pop()];
}

module.exports.v1toV2 = function (tags) {
	const params = tags.map(tag => `identifierValue=${encodeURIComponent(tag.term.id)}`);

	return fetchCapiJson(`http://api.ft.com/concordances?${params.join('&')}&authority=${AUTHORITY}`)
		.then(result => {
			return result.concordances ? result.concordances
				.reduce((deduped, concordance) => {
					// "It is unlikely, but possible, that you could get multiple V2 IDs back from a concordance call"
					if (!deduped.find(item => item.identifier.identifierValue === concordance.identifier.identifierValue)) {
						deduped.push(concordance);
					}

					return deduped;
				}, [])
				.map(concordance => {
					// We may not receieve the same number of results
					const original = tags.find(tag => tag.term.id === concordance.identifier.identifierValue);

					return {
						id: concordance.concept.id,
						apiUrl: concordance.concept.apiUrl,
						prefLabel: original.term.name
						// we can't infer the directType (most specific concept) of the tag
					};
				}) : [];
		})
		.catch(error => logger.warn(error));
};

module.exports.v2toV1 = function (annotations) {
	const params = annotations.map(annotation => `conceptId=${encodeURIComponent(annotation.id)}`);

	return fetchCapiJson(`http://api.ft.com/concordances?${params.join('&')}`)
		.then(result => {
			return result.concordances ? result.concordances
				.filter(concordance => {
					// The API can't filter concepts by authority
					return concordance.identifier.authority === AUTHORITY;
				})
				.reduce((deduped, concordance) => {
					// We may receive multiple concordances so take the first
					if (!deduped.find(item => item.concept.id === concordance.concept.id)) {
						deduped.push(concordance);
					}

					return deduped;
				}, [])
				.map(concordance => {
					const original = annotations.find(annotation => annotation.id === concordance.concept.id);

					return {
						name: original.prefLabel,
						id: concordance.identifier.identifierValue,
						attributes: [],
						taxonomy: getTaxonomyFromID(concordance.identifier.identifierValue)
					};
				}) : [];
		})
		.catch(error => logger.warn(error));
};
