const filterMetadata = require('../utils/filterMetadata');

const alphavilleTeamMembers = require('alphaville-team-members');

const headshots = [];

function initCache () {
	alphavilleTeamMembers.getMemberNames().then((teamMemberNames) => {
		if (teamMemberNames && teamMemberNames.length) {
			teamMemberNames.forEach((tm) => {
				headshots.push({
					name: tm.name,
					url: tm.headshotUrl
				});
			});
		} else {
			setTimeout(initCache, 10000);
		}
	}).catch((e) => {
		console.log("es-interface", "Error fetching team members", e);
		setTimeout(initCache, 10000);
	});
}
initCache();


function getHeadshot(authorName) {
	const authorHeadshot = headshots.filter(function(item) {
		return (item.name === authorName);
	});
	return (authorHeadshot.length > 0) ? authorHeadshot[0] : false;
}

exports.processArticle = function (article) {
	return new Promise((resolve) => {
		if (article) {
			const authorsMetadata = filterMetadata(article.metadata, { taxonomy: 'authors' });
			const authors = [];

			if (authorsMetadata.length) {
				authorsMetadata.forEach(author => {
					const obj = {};
					obj.metadata = author;
					obj.name = author.prefLabel;

					const headshot = getHeadshot(author.prefLabel);
					if (headshot) {
						obj.headshotUrl = headshot.url;
						obj.isAlphavilleEditor = true;
						obj.url = '/author/' + encodeURIComponent(obj.name);
					} else {
						obj.url = author.url;
					}
					authors.push(obj);
				});
			} else {
				if (article.byline) {
					const bylineAuthors = article.byline.split(',');

					bylineAuthors.forEach((author) => {
						author = author.trim();

						const headshot = getHeadshot(author);
						if (headshot) {
							const obj = {};
							obj.name = author;
							obj.headshotUrl = headshot.url;
							obj.isAlphavilleEditor = true;
							obj.url = '/author/' + encodeURIComponent(obj.name);
							authors.push(obj);
						}
					});
				}
			}

			article.authors = authors;
		}

		resolve(article);
	});
};
