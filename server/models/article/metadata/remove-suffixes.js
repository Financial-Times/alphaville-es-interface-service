const bannedSuffixes = [
	/\bGroup$/,
	/\b[Ll]imited$/,
	/\bPLC$/,
	/\b[Ii]nc$/,
	/\b[Ll]td$/,
	/\bSA$/,
	/\bAG$/,
	/\bLLC$/,
	/\bNV$/,
	/(?:\B& |\b)Co$/,
	/\bSpA$/,
	/\bGmbH$/
];

module.exports = function (tags) {
	tags.forEach((tag) => {
		if (tag.taxonomy === 'organisations') {
			bannedSuffixes.forEach((item) => {
				tag.name = tag.name.replace(item, '').trim();
			});
		}
	});

	return tags;
};
