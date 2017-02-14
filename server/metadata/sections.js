const opinionTag = {
	term: {
		name: 'Opinion',
		id: 'MTE2-U2VjdGlvbnM=',
		attributes: [],
		taxonomy: 'sections'
	}
};

const middleEastAndAfricaTag = {
	term: {
		name: 'Middle East & North Africa',
		id: 'MTY=-U2VjdGlvbnM=',
		attributes: [],
		taxonomy: 'sections'
	}
};

const booksTag = {
	term: {
		name: 'Books',
		id: 'MTU5-U2VjdGlvbnM=',
		attributes: [],
		taxonomy: 'sections'
	}
};

module.exports = {

	// Middle East (the organisation(!)) and region
	'TnN0ZWluX09OX0FGVE1fT05fMjAwNl8xODUzMDk=-T04=': middleEastAndAfricaTag,
	'TnN0ZWluX0dMX1N0YW5kYWxvbmVfMTcxMDAy-R0w=': middleEastAndAfricaTag,

	// Comment -> Opinion
	'MTE2-U2VjdGlvbnM=': opinionTag,

	// Opinion (the section)
	'MTE5-U2VjdGlvbnM=': opinionTag,

	// Management
	'MTI1-U2VjdGlvbnM=': {
		term: {
			name: 'Work & Careers',
			id: 'MTI1-U2VjdGlvbnM=',
			attributes: [],
			taxonomy: 'sections'
		}
	},

	// The Big Read (the section) -> The Big Read (the brand)
	'MTE4-U2VjdGlvbnM=': {
		term: {
			name: 'The Big Read',
			id: 'MmFjMzRlYzAtN2I5ZS00NDNjLTg5MWQtNWQzOWJmMzQzOGNi-QnJhbmRz',
			attributes: [],
			taxonomy: 'brand'
		}
	},

	// Small Talk -> Books
	'MzA0MzEwNTgtYjdkZS00NWExLWE5OGItOTYzM2EyY2JhNDM4-U2VjdGlvbnM=': booksTag,

	// Short Reviews -> Books
	'OTI2N2Y5ZGUtNTAyZS00YTc2LWFlZDQtNDFiYmVmMDFjNmVl-U2VjdGlvbnM=': booksTag,

	// Essay -> Books
	'ZWZlNGRkZDctNTg2NS00ODdjLTgwOWYtZDNmYzRhODgzZDA2-U2VjdGlvbnM=': booksTag,


	// Five of the Best (the section) -> Food & Drink (the section)
	'MTcxNTU3ZmItN2E5YS00NDkyLWFlZmQtNjYzNGIzYmVkNjk3-U2VjdGlvbnM=': {
		term: {
			name: 'Food & Drink',
			attributes: [],
			id: 'MTU2-U2VjdGlvbnM=',
			taxonomy: 'sections'
		}
	},

	// Power dressing (the section) -> Style (the section)
	'NWJiNjQ3YTctMmU0Yy00YmQzLTg1MDAtZDUyOGM0MmZjMWQx-U2VjdGlvbnM=': {
		term: {
			name: 'Style',
			attributes: [],
			id: 'MTU4-U2VjdGlvbnM=',
			taxonomy: 'sections'
		}
	},

	// Great Journeys (the section) -> Travel (the section)
	'MDY1MTYxNzQtNTZiOC00ZTdjLWFhMDgtYWFmNTYyOWVhMjIx-U2VjdGlvbnM=': {
		term: {
			name: 'Travel',
			attributes: [],
			id: 'MTY1-U2VjdGlvbnM=',
			taxonomy: 'sections'
		}
	},

	// International Property (the section) -> House & Home (the section)
	'OWY5ZDg3ZTMtNmFkNS00ZGY5LWJkMDktOTE4YjA2MDE5OWZm-U2VjdGlvbnM=': {
		term: {
			name: 'House & Home',
			attributes: [],
			id: 'MTU3-U2VjdGlvbnM=',
			taxonomy: 'sections'
		}
	},
	// FT Confidential Research (the author) -> FT Confidential Research (the section)
	'MTYzMjNmMTQtNmJmYy00ZTVjLWFmMWItNTg4NDBhZTQ2YjI4-QXV0aG9ycw==': {
		term: {
			name: 'FT Confidential Research',
			attributes: [],
			id: 'NjlmOTA1NjEtMGJiMC00MzdmLTlkN2YtNjMwYWVlYTkxYjA2-U2VjdGlvbnM=',
			taxonomy: 'sections'
		}
	},
	// Podcast reviews (the section) -> Podcasts (the section)
	'NTdmNDU4ZGMtMjM1ZS00MTkwLWJkZTctZjljODk1OTdkOGFm-U2VjdGlvbnM=': {
		term: {
			name: 'Podcasts',
			attributes: [],
			id: 'NjI2MWZlMTEtMTE2NS00ZmI0LWFkMzMtNDhiYjA3YjcxYzIy-U2VjdGlvbnM=',
			taxonomy: 'sections'
		}
	}
};
