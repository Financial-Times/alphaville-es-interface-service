module.exports = (byline) => {
	if (!byline || byline === '—') {
		return;
	} else {
		return byline.trim().replace(/^By\s+/i, '');
	}
};
