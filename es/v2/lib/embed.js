"use strict";

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const avSeries = require('./series');
const categorization = require('../utils/categorization');

function embedPodcast (article) {
	const url = `${process.env.PROD_WP_URL}${article.av2WebUrl}?json=1&api_key=${process.env['WP_API_KEY']}`;

	return fetch(url)
		.then(res => res.json())
		.then(json => {
			if (json && json.post &&
					json.post.custom_fields &&
					json.post.custom_fields &&
					json.post.custom_fields.embed1 &&
					json.post.custom_fields.embed1.length) {
				const embedCode = json.post.custom_fields.embed1[0].replace(/http\:/g, 'https:');
				article.bodyHTML = embedCode + article.bodyHTML;
			}
		})
		.catch((err) => {
			console.log("Error fetching embeds for article " + article.id, err);
		});
}

function embedFtVideo (article) {
	return new Promise((resolve) => {
		let $;
		try {
			$ = cheerio.load(article.bodyHTML);

			$('.n-content-video--internal').each(function () {
				const el = $(this);
				const href = el.find('a').attr('href');
				const vIdMatch = href.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/);
				const videoId = Array.isArray(vIdMatch) ? vIdMatch.pop() : null;

				if (videoId) {
					el.replaceWith($(`<div class="o-video o-video--large" data-o-component="o-video" data-o-video-id="${videoId}" data-o-video-advertising="true" data-o-video-placeholder="true"></div>`));
				}
			});

			article.bodyHTML = $.html();
			resolve(article);
		} catch (e) {
			console.log("ERROR", e);
			console.log(article.id);

			resolve(article);
			return;
		}
	});
}

exports.processArticle = function (article) {
	return new Promise((resolve) => {
		if (article) {
			const embeds = [];
			if (article.bodyHTML) {
				if (avSeries.getSeries(article, 'Alphachat') || avSeries.getSeries(article, 'Alphachatterbox') || categorization.isPodcast(article)) {
					embeds.push(embedPodcast(article));
				}

				if (article.bodyHTML.indexOf('n-content-video--internal') !== -1) {
					embeds.push(embedFtVideo(article));
				}
			}

			Promise.all(embeds).then(() => {
				resolve(article);
			}).catch(() => {
				resolve(article);
			});
		} else {
			resolve(article);
		}
	});
};
