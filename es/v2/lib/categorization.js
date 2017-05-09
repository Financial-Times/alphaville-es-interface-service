"use strict";

let categorization = require('../utils/categorization');

exports.processArticle = function (article) {

	if(article && 'found' in article && article.found === false){
		return article;
	} else {
		return new Promise((resolve) => {

			for(let categories in categorization){

				if (categorization[categories](article)) {
					article[categories] = true;
				}

			}
			resolve(article);
		});

	}
};
