'use strict';

const fetch = require('node-fetch');
const _ = require('lodash');

const healthCheckModel = {
	id: 'comment-creation-service',
	name: 'Comment creation service',
	ok: false,
	technicalSummary: "Comment creation service is used to fetch user comments for Markets Live transcripts.",
	severity: 2,
	businessImpact: "Markets Live transcript pages will not have user comments rendered.",
	checkOutput: "",
	panicGuide: `Check the healthcheck of the service (https://${process.env['CCS_URL']}/__health)`,
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		fetch(`https://${process.env['CCS_URL']}/v1/getComments?title=Markets%20Live:%Thursday,%205th%20September,%202019&url=https://ftalphaville2.ft.com/marketslive/2019-09-05/&articleId=2a7e3536-c880-37d5-81fa-bfaaf9d424e3`)
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
				currentHealth.checkOutput = "Comment creation service is unreachable. Error: " + (err && err.message ? err.message : '');
				resolve(currentHealth);
			});
	});
};
