'use strict';

require('promise.prototype.finally');

module.exports = class KeenQueryPoller {

	constructor (getResults, updateInterval = 300000) {
		this.getResults = getResults;
		this.results = null;
		this.interval = updateInterval;
		this.updateFunc = null;
		this.update();
	}


	update (repeat = true) {
		if (this.updateFunc) {
			return this.updateFunc
		}

		return this.updateFunc = this.getResults()
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

