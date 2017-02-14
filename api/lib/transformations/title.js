"use strict";
const formatTitle = require('../utils/formatTitle.js');

exports.processArticle = function (article) {
  if(article && 'found' in article && article.found === false){
    return article;
  } else {
    return new Promise((resolve) => {
      article._source.originalTitle = article._source.title;

      article._source.title = formatTitle(article._source.title);

      resolve(article);
    });
    
  }

}