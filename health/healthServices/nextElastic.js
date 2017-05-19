"use strict";

const _ = require('lodash');
const nEsClient = require('@financial-times/n-es-client');

const healthCheckModel = {
	id: 'next-elastic',
	name: 'Next elastic',
	ok: false,
	technicalSummary: "Next elastic is used to search articles and serve the content of the them.",
	severity: 1,
	businessImpact: "Article search or article data will not be available.",
	checkOutput: "",
	panicGuide: `Check the healthcheck of the service (https://next-elastic.ft.com/__health)`,
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		nEsClient.get('eb634bb5-f4f5-347d-9514-4688c5c67e30')
			.then(res => {
				if (res) {
					currentHealth.ok = true;
					resolve(_.omit(currentHealth, ['checkOutput']));
				} else {
					throw new Error("No response");
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
