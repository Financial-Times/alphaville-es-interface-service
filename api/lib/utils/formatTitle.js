module.exports = title => {
	title = title.replace(/podcast:\s|alphachat:\s|guest post:\s|markets live:\s|FT Opening Quote:\s|FT Opening Quote – |Opening Quote:\s/gi, '');
	return title.charAt(0).toUpperCase() + title.slice(1);
};