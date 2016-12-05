'use strict';

const KeenQuery = require('keen-query');
require('promise.prototype.finally');

KeenQuery.setConfig({
  KEEN_PROJECT_ID: process.env.KEEN_PROJECT_ID,
  KEEN_READ_KEY: process.env.KEEN_READ_KEY,
  KEEN_HOST: 'https://keen-proxy.ft.com/3.0'
});

const getResults = query => new KeenQuery(query)
	.print('json')
  .then(results => results.rows
    .map(([ pathname, count]) => ({ pathname, count }))
    .sort(({ count: countOne }, { count: countTwo }) => countTwo - countOne)
  );

module.exports = class KeenQueryPoller {
	constructor (query, updateInterval = 300000) {
		this.query = query;
		this.results = null;
		this.interval = updateInterval;
		this.updateFunc = null;
		this.update();
	}

	update (repeat = true) {
		if (this.updateFunc) {
			return this.updateFunc
		}
		return this.updateFunc = getResults(this.query)
			.then(results => this.results = results)
      .finally(() => {
        this.updateFunc = null;
        if (repeat) {
          setTimeout(this.update.bind(this), this.interval);
        }
      });
	}

	get (count = 10) {
		if (this.results) {
			return Promise.resolve(this.results.slice(0, count))
		} else {
			return this.update(false)
				.then(results => results.slice(0, count));
		}
	}
}

