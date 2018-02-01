"use strict";

const MLApi = require('alphaville-marketslive-api-client');

const striptags = require('striptags');
const _ = require('lodash');
const moment = require('moment-timezone');
moment.tz.setDefault("Europe/London");

const cheerio = require('cheerio');
const imageService = require('../utils/imageService');
const categorization = require('../utils/categorization');

function ellipsisTrim(str, length){
	return _.truncate(str, {length, separator: ' '});
}

const commentsApi = require('./commentsApi');

const maxSummaryLength = 120;


let mockContent;

if (process.env.ML_TRANSCRIPT_MOCK_URL) {
	const mockMLApi = new MLApi(process.env.ML_API_URL, process.env.ML_TRANSCRIPT_MOCK_URL);
	let path = process.env.ML_TRANSCRIPT_MOCK_URL;
	while (path[0] === '/') {
		path = path.substr(1, path.length);
	}
	if (path.indexOf('marketslive') !== -1) {
		path = `marketslive/${path}`;
	}

	mockMLApi.init().then((init) => {
		let dataPromise;
		if (init.data.status === 'closed') {
			dataPromise = mockMLApi.transcriptJson();
		} else {
			dataPromise = mockMLApi.catchupJson();
		}

		Promise.all([dataPromise, commentsApi.getAllComments({
				title: init.data.post_title,
				articleId: init.data.post_uuid,
				url: `${process.env.APP_URL}/${path}`,
				order: 'ascending'
			})])
		.then((response) => {
			const content = response[0];
			const comments = response[1];

			mockContent = [init, content, comments];
		});
	}).catch(e => {
		console.log('[Error mockMLApi]: ', e.message);
	});
}


function populateContent (mlApiPath, article, isMock, withContent) {
	const mlApi = new MLApi(process.env.ML_API_URL, mlApiPath);

	const fetchNormalContent = function () {
		return mlApi.init().then((init) => {
			if (init.data.status === 'closed' && withContent) {
				return Promise.all([mlApi.transcriptJson(), commentsApi.getAllComments({
						title: article.title,
						articleId: article.id,
						url: process.env.APP_URL + article.av2WebUrl,
						order: 'ascending'
					})])
				.then((response) => {
					const content = response[0];
					const comments = response[1] || [];

					return [init, content, comments];
				});
			} else {
				return [init];
			}
		});
	};

	const fetchMockContent = function () {
		if (mockContent) {
			return new Promise((resolve) => {
				resolve(mockContent);
			});
		} else {
			return new Promise((resolve, reject) => {
				reject(new Error("Mock content not found"));
			});
		}
	};

	const fetch = isMock === true ? fetchMockContent : fetchNormalContent;

	return fetch().then((response) => {
		const initResponse = response[0];
		const jsonResponse = response[1];
		const livefyreComments = response[2];

		if (initResponse.data.status === 'deleted') {
			article.isDeleted = true;
		}

		if (initResponse.data.status === 'inprogress') {
			article.isLive = true;
			article.isComingSoon = false;
		} else {
			article.isLive = false;

			if (initResponse.data.status === 'comingsoon') {
				article.isComingSoon = true;
			} else {
				article.isComingSoon = false;
			}
		}

		article.comments.enabled = initResponse.data.allow_comment;

		article.sessionPath = article.av2WebUrl.replace('marketslive', '').replace(/\//g, '');

		article.subheading = initResponse.data.post_excerpt;
		article.openingHTML = `<p>${initResponse.data.post_excerpt}</p>`;


		if (withContent) {
			let bodyHTML = '';

			if (!article.isLive && jsonResponse && jsonResponse.success) {
				let intercalatedComments = [];
				intercalatedComments = intercalatedComments.concat(jsonResponse.data.filter((el) => {
					if (el.event && el.event === 'msg') {
						return true;
					}

					return false;
				}));
				intercalatedComments = intercalatedComments.concat(livefyreComments);

				intercalatedComments.sort((a, b) => {
					let timestampA;
					let timestampB;

					if (a.event && a.event === 'msg') {
						timestampA = parseInt(a.data.emb, 10);
					} else {
						timestampA = a.timestamp;
					}

					if (b.event && b.event === 'msg') {
						timestampB = parseInt(b.data.emb, 10);
					} else {
						timestampB = b.timestamp;
					}

					if (timestampA > timestampB) {
						return 1;
					}

					if (timestampA < timestampB) {
						return -1;
					}

					return 0;
				});

				let index = 0;
				intercalatedComments.forEach((comment) => {
					if (comment.data && comment.event === 'msg' && comment.data.html.indexOf('sysmsg') === -1) {
						if (index % 3 === 0) {
							const dateModifiedTime = parseInt(comment.data.datemodified, 10) * 1000;
							const dateModifiedDate = new Date(dateModifiedTime);

							bodyHTML +=
								`<time
									class="marketslive-timestamp o-date"
									data-o-component="o-date"
									data-o-date-format="h:mm a"
									datetime="${dateModifiedDate.toISOString()}"
									title="${dateModifiedDate.toDateString()} ${dateModifiedDate.toTimeString()}"
									aria-label="${dateModifiedDate.toDateString()} ${dateModifiedDate.toTimeString()}">
										${moment(dateModifiedDate).format('h:mm a')}
								</time>`;
						}
						index++;

						bodyHTML += comment.data.html;
					} else if (comment.content) {
						bodyHTML += `
							<div class="marketslive-user-comment">
								<span class="marketslive-user-comment-pseudonym">${comment.author.displayName}</span>
								${striptags(comment.content)}
							</div>`;
					}
				});

				if (bodyHTML) {
					const $ = cheerio.load(bodyHTML);

					$('img').each(function () {
						const image = $(this);
						const srcMatch = image.attr('src').match(/\/wp-content(.*)\/emoticons\/([^.]+)/);
						if (image.attr('class') && image.attr('class').indexOf('emoticon') > -1 && srcMatch) {
							image.replaceWith(`
								<span class="webchat-emoticon webchat-emoticon--${srcMatch[2]}" data-code="${srcMatch[2]}">
									${srcMatch[2].replace('-', ' ').replace('_', ' ')}
								</span>
							`);
						} else {
							image.attr('src', imageService.getUrl(image.attr('src')));
						}
					});

					$('.separator').each(function () {
						const datePublished = new Date($(this).attr('data-timestamp') * 1000);
						const messageBody = $(this).find('.messagebody');
						if (messageBody) {
							messageBody.html(
								`<time
									class="o-date"
									data-o-component="o-date"
									data-o-date-format="h:mm a"
									datetime="${datePublished.toISOString()}"
									title="${datePublished.toDateString()} ${datePublished.toTimeString()}"
									aria-label="${datePublished.toDateString()} ${datePublished.toTimeString()}">
										${messageBody.innerHTML}
								</time>`
							);
						}
					});

					bodyHTML = $.html();

					article.bodyHTML = '<div class="webchat-closed-content">' + bodyHTML + '</div>';
				}
			}
		}

		return article;
	});
}


exports.processArticle = function (article, withContent) {
	return new Promise((resolve) => {
		if (article && article.webUrl && article.webUrl.indexOf('marketslive') !== -1) {
			article.isMarketsLive = true;

			populateContent(article.av2WebUrl, article, false, withContent).then(article => {
				resolve(article);
			}).catch((err) => {
				if (process.env.ML_TRANSCRIPT_MOCK_URL) {
					console.log(`Normal content fetch failed for ${article.av2WebUrl}, try mock URL.`);

					return populateContent(process.env.ML_TRANSCRIPT_MOCK_URL, article, true, withContent).then(article => {
						resolve(article);
					}).catch((err) => {
						console.log("Error fetching MarketsLive data for " + process.env.ML_TRANSCRIPT_MOCK_URL, err, err.stack);

						resolve(article);
					});
				} else {
					console.log("Error fetching MarketsLive data for " + article.av2WebUrl, err, err.stack);

					resolve(article);
				}
			});
		} else {
			resolve(article);
		}
	});
};
