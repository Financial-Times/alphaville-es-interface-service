"use strict";
const formatTitle = require('../utils/formatTitle.js');

exports.processArticle = function (article) {
  if(article && 'found' in article && article.found === false){
    return article;
  } else {
    return new Promise((resolve) => {
      article.originalTitle = article.title;

      article.title = formatTitle(article.title);

      resolve(article);
    });

  }

}
