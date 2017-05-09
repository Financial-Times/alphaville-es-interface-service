"use strict";

const cheerio = require('cheerio');
const imageService = require('../utils/imageService');
const avSeries = require('./series');

function processImage(article) {
	let $;
	try {
		$ = cheerio.load(article.bodyHTML);
	} catch (e) {
		console.log("ERROR", e);
		console.log(article.id);
		return;
	}

	$('img').each(function (index) {
		if ($(this).attr('src').indexOf('wp-includes/js/tinymce/plugins/wordpress/img/trans.gif') !== -1) {
			$(this).remove();
			return;
		}

		const src = imageService.getUrl($(this).attr('src'));

		$(this).attr('src', src);

		if (index === 0 && !article.mainImage) {
			article.mainImage = {
				url : src
			};
			article.withImage = true;
		}
	});

	article.bodyHTML = $.html();
}


exports.processArticle = function (article) {
	return new Promise((resolve) => {
		if (article) {

			if (avSeries.getSeries(article, 'Alphachatterbox')) {
				article.mainImage = {
					url: imageService.getUrl('https://thumborcdn.acast.com/vYSKzefOJvuFSeZPMN77qDgbDd4=/500x500/smart/filters:quality(80)/acastprod.blob.core.windows.net/media/v1/e6648376-4625-4914-86be-1e6431229054/a-villebox-if736lxo.png')
				};
				article.withImage = true;
			} else if (avSeries.getSeries(article, 'Alphachat')) {
				article.mainImage = {
					url: imageService.getUrl('http://imagecdn.acast.com/v2/ft-alphachat/timharfordontheunheraldedvirtuesofmessiness/image.jpg')
				};
				article.withImage = true;
			} else if (article.mainImage) {
				article.mainImage.url = imageService.getUrl(article.mainImage.url);
				article.withImage = true;
			}

			if (article.bodyHTML) {
				processImage(article);
			}
		}

		resolve(article);
	});
};

