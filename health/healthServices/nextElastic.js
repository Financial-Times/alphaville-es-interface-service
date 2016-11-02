"use strict";

const _ = require('lodash');
const fetch = require('node-fetch');

const healthCheckModel = {
	id: 'next-elastic',
	name: 'Next elastic',
	ok: false,
	technicalSummary: "Next elastic is used to search articles and serve the content of the them.",
	severity: 1,
	businessImpact: "Article search or article data will not be available.",
	checkOutput: "",
	panicGuide: `Check the healthcheck of the service (https://${process.env['ELASTIC_SEARCH_URL']}/__health)`,
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		fetch(`http://${process.env['ELASTIC_SEARCH_URL']}/v3_api_v2/item/eb634bb5-f4f5-347d-9514-4688c5c67e30`)
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					const error = new Error(res.statusText);
					error.response = res;
					throw error;
				}
			})
			.then(() => {
				currentHealth.ok = true;
				resolve(_.omit(currentHealth, ['checkOutput']));
			})
			.catch((err) => {
				currentHealth.ok = false;
				currentHealth.checkOutput = "Next elastic is unreachable. Error: " + (err && err.message ? err.message : '');
				resolve(currentHealth);
			});
	});
};
