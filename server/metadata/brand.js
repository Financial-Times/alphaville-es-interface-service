'use strict';

let ftViewTag = {
	term: {
		name: 'FT View',
		id: 'MDRkMzU4YjktMjA0OS00MWEzLWJiY2ItYmJkZWNhMmVmMzQ0-QnJhbmRz',
		attributes: [ ],
		taxonomy: 'brand'
	}
};

let lexTag = {
	term: {
		name: 'Lex',
		id: 'YzhlNzZkYTctMDJiNy00NTViLTk3NmYtNmJjYTE5NDEyM2Yw-QnJhbmRz',
		attributes: [],
		taxonomy: 'brand'
	}
};

module.exports = {

	// Lex (the person -> brand)
	'TnN0ZWluX1BOX0FGVE1fUE5fMTc4MjM1-UE4=': lexTag,

	// Lex (the region -> brand)
	'TnN0ZWluX0dMX1N0YW5kYWxvbmVfMTUzNjU2-R0w=': lexTag,

	// Lex (the section -> brand)
	'MTE1-U2VjdGlvbnM=': lexTag,

	// FT Photo Diary
	'NTQ2MGRhM2UtMGNlOC00NDBjLTgyNWEtY2VmMWZkMjk5NDdk-QnJhbmRz': {
		term: {
			name: 'Photo Diary',
			id: 'NTQ2MGRhM2UtMGNlOC00NDBjLTgyNWEtY2VmMWZkMjk5NDdk-QnJhbmRz',
			attributes: [],
			taxonomy: 'brand'
		}
	},

	// Short View -> The Short View
	'QnJhbmRzXzE3MA==-QnJhbmRz': {
		term: {
			name: 'The Short View',
			id: 'MjFjOTI0Y2YtNGFlOS00OTMzLWJhMjEtNjBjNjE2YTRhMmJi-QnJhbmRz',
			attributes: [],
			taxonomy: 'brand'
		}
	},

	// Short View video -> The Short View
	'ZjI5NTE0NzctMTUzNS00OTcyLTliZGQtYjllM2JiYTQyMTY4-QnJhbmRz': {
		term: {
			name: 'The Short View',
			id: 'MjFjOTI0Y2YtNGFlOS00OTMzLWJhMjEtNjBjNjE2YTRhMmJi-QnJhbmRz',
			attributes: [],
			taxonomy: 'brand'
		}
	},

	// Mrs Moneypenny (the author)
	'Q0ItMDAwMTE4Mg==-QXV0aG9ycw==': {
		term: {
			name: 'Mrs Moneypenny',
			id: 'QnJhbmRzXzEyOA==-QnJhbmRz',
			attributes: [],
			taxonomy: 'brand'
		}
	},

	// ‘Editorial’ brand has been replaced by ‘FT View’
	'NTc3OGYxNTMtZGMzOS00ZDgwLWFiZjYtZjZhNDNlMzQ5MmUy-QnJhbmRz': ftViewTag,

	// ‘FT View’ (the section) -> ‘FT View’ (the brand)
	'NGYyMTRiYTMtZWQ2Ny00MDc3LTgwODctOTFkZmQ3OTM2Yjhi-U2VjdGlvbnM=': ftViewTag,

	// Expat Lives (the section) -> Expat Lives (the brand)
	'YjlkNjNlNWQtODQ3OC00NTZmLTg2ODUtOGQzOTk0NWIwZjIx-U2VjdGlvbnM=': {
		term: {
			name: 'Expat Lives',
			attributes: [],
			id: 'NzI1NzdhMjYtMDQ0OS00YjU1LTgwZmYtYWRhNmEwODkyMDNl-QnJhbmRz',
			taxonomy: 'brand'
		}
	},

	// At home (the section) -> At Home with the FT (the brand)
	'NTM1YTY2OGQtYmIxYy00MWIxLWJkYmMtOGQ1YTE0MzhmNWRi-U2VjdGlvbnM=': {
		term: {
			name: 'At Home with the FT',
			attributes: [],
			id: 'ODAxODJkZTMtZjZkYy00NDljLWExOTctNjA0MDM5MmM1ZDhl-QnJhbmRz',
			taxonomy: 'brand'
		}
	}

};
