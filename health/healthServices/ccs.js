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
	panicGuide: "",
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		fetch(`https://${process.env['CCS_URL']}/v1/getComments?title=Markets%20Live:%20Tuesday,%201st%20November,%202016&url=https://ftalphaville2.ft.com/marketslive/2016-11-01/&articleId=bf488b61-e0fd-3fb6-abff-f175ad0beab3`)
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
