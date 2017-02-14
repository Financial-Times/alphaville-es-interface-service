'use strict';

const nikkeiTag = {
	term: {
		name: 'Nikkei',
		attributes: [
			{ value: 'true', key: 'is_company' }
		],
		id: 'TnN0ZWluX09OX0FGVE1fT05fMjMyMzcx-T04=',
		taxonomy: 'organisations'
	}
};

const citadelTag = {
	term: {
		name: 'Citadel LLC',
		id: 'YmUyZjk5MDctMjMwZC00NGE0LWEwYTctYTlhY2JlMjIyNGVl-T04=',
		attributes: [
			{
				'key': 'is_company',
				'value': 'true'
			}
		],
		taxonomy: 'organisations'
	}
};

module.exports = {

	// Google (the topic)
	'ZTdkMGEzNDUtMDljYS00MjhjLThjYjYtYTM0YjBhNmY3ODFh-VG9waWNz': {
		term: {
			name: 'Google',
			id: 'TnN0ZWluX09OX0ZvcnR1bmVDb21wYW55X0dPT0c=-T04=',
			attributes: [
				{
					key: 'wsod_key',
					value: 'us:GOOG'
				},
				{
					key: 'is_company',
					value: 'true'
				}
			],
			taxonomy: 'organisations'
		}
	},

	// HSBC PLC -> HSBC Holdings
	'TnN0ZWluX09OX0FGVE1fT05fMTU1MDcw-T04=': {
		term: {
			name: 'HSBC Holdings',
			attributes: [
				{ value: 'uk:HSBA', key: 'wsod_key' },
				{ value: 'true', key: 'is_company' }
			],
			id: 'TnN0ZWluX09OX0ZvcnR1bmVDb21wYW55X0hCQw==-T04=',
			taxonomy: 'organisations'
		}
	},

	// Nihon Keizai Shimbun Inc. -> Nikkei (name change)
	'TnN0ZWluX09OX0FGVE1fT05fMjMyMzcx-T04=': nikkeiTag,

	// Nikkei (ID change)
	'TnN0ZWluX09OX0FGVE1fT05fMjMyNDU1-T04=': nikkeiTag,

	// Société Générale (the topic) -> Société Générale (the organisation)
	'YTRmMjFjYzMtYjFkMS00NDBlLWE4NzYtMDJmMjI2MjgxMTMy-VG9waWNz': {
		term: {
			name: 'Societe Generale',
			attributes: [
				{
					value: 'fr:GLE',
					key: 'wsod_key'
				},
				{
					value: 'true',
					key: 'is_company'
				}
			],
			id: 'TnN0ZWluX09OX0ZvcnR1bmVDb21wYW55X0dMRQ==-T04=',
			taxonomy: 'organisations'
		}
	},

	// IAAF
	'MGEwMGQ3NmMtZTE1OS00NjI5LTk3ZDAtNDM1YzZhMTU2ZTIz-T04=': {
		term: {
			name: 'IAAF',
			id: 'MGEwMGQ3NmMtZTE1OS00NjI5LTk3ZDAtNDM1YzZhMTU2ZTIz-T04=',
			attributes: [
				{
					value: 'false',
					key: 'is_company'
				}
			],
			taxonomy: 'organisations'
		}
	},
	// International Business Machines -> IBM
	'TnN0ZWluX09OX0ZvcnR1bmVDb21wYW55X0lCTQ==-T04=': {
		term: {
			name: 'IBM Corp',
			id: 'TnN0ZWluX09OX0ZvcnR1bmVDb21wYW55X0lCTQ==-T04=',
			attributes: [
				{
					key: 'wsod_key',
					value: 'us:IBM'
				},
				{
					key: 'is_company',
					value: 'true'
				}
			],
			taxonomy: 'organisations'
		}
	},
	// Facebook (the topic) -> Facebook (organisation)
	'ZjAxMzMxMzMtY2EyYy00M2EyLTg3MmItYTBkZmQ1ZTA5OWZm-VG9waWNz': {
		term: {
			name: 'Facebook',
			id: 'NzM2ZjRiMmUtZTk2Yi00NWUxLWJmOTEtM2M0OTJmYzcwODAw-T04=',
			attributes: [
				{
					key: 'is_company',
					value: 'true'
				}
			],
			taxonomy: 'organisations'
		}
	},

	// One Puma
	'TnN0ZWluX09OX0FGVE1fT05fMjYzMDc3-T04=': {
		term: {
			name: 'Puma',
			id: 'OTkzNGMxNTMtNDMwYS00NTMzLWFlOTYtOTk3MzI5ZDg3NjBm-T04=',
			attributes: [
				{
					key: 'wsod_key',
					value: 'de:PUM'
				},
				{
					key: 'is_company',
					value: 'true'
				}
			],
			taxonomy: 'organisations'
		}
	},

	// Citadel
	'TnN0ZWluX09OX0FGVE1fT05fNzY5NjQ=-T04=': citadelTag,
	'TnN0ZWluX09OX0FGVE1fT05fNzY5NjM=-T04=': citadelTag,
	'NTIxNjZiM2YtYjFhNy00ZTgwLTg2YjgtOTg4NjA2ODc1YTQ5-T04=': citadelTag,
	'TnN0ZWluX09OX0FGVE1fT05fNzY5NjY=-T04=': citadelTag,

	// Brussels (the section) -> European Union (the organisation)
	'MTA=-U2VjdGlvbnM=': {
		term: {
			name: 'European Union',
			attributes: [],
			id: 'VC0xNDcyNTI3-T04=',
			taxonomy: 'organisations'
		}
	}
};
