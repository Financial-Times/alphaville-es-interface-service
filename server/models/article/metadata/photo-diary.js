const allowed = [
	// Photo Diary brand
	'NTQ2MGRhM2UtMGNlOC00NDBjLTgyNWEtY2VmMWZkMjk5NDdk-QnJhbmRz',
	// Photo Story genre
	'NjM3ZGVmMzEtZjVjZS00ZjZhLThjYTgtNDM1OGZlMzI3MmE2-R2VucmVz',
	// World section
	'MQ==-U2VjdGlvbnM='
];

module.exports = function (tags) {
	const isPhotoDiary = tags.some((tag) => tag.id === allowed[0]);

	if (isPhotoDiary) {
		return tags.filter((tag) => allowed.indexOf(tag.id) !== -1);
	} else {
		return tags;
	}
};
