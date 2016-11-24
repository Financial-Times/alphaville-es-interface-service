'use strict';

const KeenQuery = require('keen-query');
require('promise.prototype.finally');

KeenQuery.setConfig({
  KEEN_PROJECT_ID: process.env.KEEN_PROJECT_ID,
  KEEN_READ_KEY: process.env.KEEN_READ_KEY,
  KEEN_HOST: 'https://keen-proxy.ft.com/3.0'
})


const getMostCommentedArticles = () => new KeenQuery('comment:post')
  .count()
  .group('page.location.pathname')
  .relTime('previous_3_days')
  .filter('context.app=alphaville')
  .filter('page.location.pathname~/')
  .filter('page.location.pathname!~/marketslive')
  .print('json')
  .then(results => results.rows
    .map(([ pathname, count]) => ({ pathname, count }))
    .sort(({ count: countOne }, { count: countTwo }) => countTwo - countOne)
  );

class MostCommentedArticlesPoller {

  // update every 5 mins
  constructor (updateInterval = 300000) {
    this.popularArticles = null;
    this.updateInterval = updateInterval;
    // so we only have one update happening at a time
    this.currentUpdateFunc = null;
    this.update();
  }

  update (repeat = true) {
    if (this.currentUpdateFunc) {
      return this.currentUpdateFunc;
    }
    return this.currentUpdateFunc = getMostCommentedArticles()
      .then(articles => this.popularArticles = articles)
      .finally(() => {
        this.currentUpdateFunc = null;
        if (repeat) {
          setTimeout(this.update.bind(this), this.updateInterval);
        }
      });
  }

  get (count = 10) {
    if (this.popularArticles) {
      return Promise.resolve(this.popularArticles.slice(0, count));
    } else {
      return this.update(false)
        .then(articles => articles.slice(0, count));
    }
  }

}


module.exports = MostCommentedArticlesPoller; 
