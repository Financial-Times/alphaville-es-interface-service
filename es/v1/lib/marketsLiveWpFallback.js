const WpApi = require('alphaville-marketslive-wordpress-api');
const _ = require('lodash');

const fakeEsResponse = {
	"type": "article",
	"id": "",
	"title": "",
	"alternativeTitles": {},
	"byline": "Paul Murphy",
	"bodyXML": "<p>Live markets commentary from FT.com</p>",
	"bodyHTML": "<p>Live markets commentary from FT.com</p>",
	"publishReference": "",
	"publishedDate": "",
	"initialPublishedDate": "",
	"annotations": [{
		"predicate": "http://www.ft.com/ontology/classification/isClassifiedBy",
		"id": "dbb0bdae-1f0c-11e4-b0cb-b2227cce2b54",
		"apiUrl": "http://api.ft.com/brands/dbb0bdae-1f0c-11e4-b0cb-b2227cce2b54",
		"prefLabel": "Financial Times",
		"type": "BRAND",
		"directType": "http://www.ft.com/ontology/product/Brand",
		"idV2": "dbb0bdae-1f0c-11e4-b0cb-b2227cce2b54"
	}, {
		"predicate": "http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy",
		"id": "d969d76e-f8f4-34ae-bc38-95cfd0884740",
		"apiUrl": "http://api.ft.com/things/d969d76e-f8f4-34ae-bc38-95cfd0884740",
		"prefLabel": "Markets",
		"type": "SECTION",
		"directType": "http://www.ft.com/ontology/Section",
		"idV2": "d969d76e-f8f4-34ae-bc38-95cfd0884740"
	}, {
		"predicate": "http://www.ft.com/ontology/classification/isClassifiedBy",
		"id": "d969d76e-f8f4-34ae-bc38-95cfd0884740",
		"apiUrl": "http://api.ft.com/things/d969d76e-f8f4-34ae-bc38-95cfd0884740",
		"prefLabel": "Markets",
		"type": "SECTION",
		"directType": "http://www.ft.com/ontology/Section",
		"idV2": "d969d76e-f8f4-34ae-bc38-95cfd0884740"
	}, {
		"predicate": "http://www.ft.com/ontology/classification/isClassifiedBy",
		"id": "e569e23b-0c3e-3d20-8ed0-4c17b8177c05",
		"apiUrl": "http://api.ft.com/things/e569e23b-0c3e-3d20-8ed0-4c17b8177c05",
		"prefLabel": "Comment",
		"type": "GENRE",
		"directType": "http://www.ft.com/ontology/Genre",
		"idV2": "e569e23b-0c3e-3d20-8ed0-4c17b8177c05"
	}, {
		"predicate": "http://www.ft.com/ontology/classification/isClassifiedBy",
		"id": "89d15f70-640d-11e4-9803-0800200c9a66",
		"apiUrl": "http://api.ft.com/brands/89d15f70-640d-11e4-9803-0800200c9a66",
		"prefLabel": "FT Alphaville",
		"type": "BRAND",
		"directType": "http://www.ft.com/ontology/product/Brand",
		"idV2": "89d15f70-640d-11e4-9803-0800200c9a66"
	}],
	"webUrl": "",
	"provenance": [
		"http://api.ft.com/content/items/v1/a96e3e67-7bfc-3b5a-b193-15ad7b0d6f6f",
		"http://api.ft.com/enrichedcontent/a96e3e67-7bfc-3b5a-b193-15ad7b0d6f6f"
	],
	"originatingParty": "FT",
	"storyPackage": [],
	"standout": {},
	"realtime": true,
	"comments": {
		"enabled": true
	},
	"canBeSyndicated": "verify",
	"_lastUpdatedDateTime": "",
	"url": "",
	"contentStats": {
		"relatedBoxes": 0,
		"pullQuotes": 0,
		"images": 0,
		"videos": 0
	},
	"metadata": [{
		"attributes": [],
		"taxonomy": "sections",
		"primary": "section",
		"primaryTag": true,
		"teaserTag": true,
		"idV1": "NzE=-U2VjdGlvbnM=",
		"prefLabel": "Markets",
		"url": "https://www.ft.com/markets"
	}, {
		"attributes": [],
		"taxonomy": "brand",
		"primary": "brand",
		"idV1": "ZDkyYTVhMzYtYjAyOS00OWI1LWI5ZTgtM2QyYTIzYjk4Y2Jj-QnJhbmRz",
		"prefLabel": "FT Alphaville",
		"url": "https://ftalphaville.ft.com"
	}, {
		"attributes": [],
		"taxonomy": "genre",
		"idV1": "OA==-R2VucmVz",
		"prefLabel": "Comment",
		"url": "https://www.ft.com/stream/genreId/OA==-R2VucmVz"
	}]
};


module.exports = function(urlSearch) {
	const wpPath = urlSearch.replace(/.*ftalphaville.ft.com/, '');

	const wpApi = new WpApi(wpPath);

	return wpApi.init().then((init) => {
		if (init) {
			const response = _.merge(JSON.parse(JSON.stringify(fakeEsResponse)), {
				id: init.data.post_uuid,
				title: init.data.post_title,
				publishedDate: new Date(init.data.time * 1000).toISOString(),
				initialPublishedDate: new Date(init.data.time * 1000).toISOString(),
				webUrl: 'http://ftalphaville.ft.com' + wpPath,
				realtime: init.data.status === 'closed' ? false : true,
				comments: {
					enabled: init.data.allow_comment
				},
				_lastUpdatedDateTime: new Date(init.data.time).toISOString(),
				url: 'http://ftalphaville.ft.com' + wpPath
			});

			return response;
		}

		return null;
	}).catch(err => {
		if (err.response && err.response.status === 404) {
			return null;
		}

		throw err;
	});
};
