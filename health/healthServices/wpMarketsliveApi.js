'use strict';

const fetch = require('node-fetch');
const _ = require('lodash');

const healthCheckModel = {
	id: 'wordpress-marketslive-api',
	name: 'Wordpress Markets Live API',
	ok: false,
	technicalSummary: "Wordpress Markets Live API serves information about the status of a Markets Live session and transcript for closed sessions.",
	severity: 2,
	businessImpact: "Markets Live will have unstyled content or just the excerpt.",
	checkOutput: "",
	panicGuide: "https://sites.google.com/a/ft.com/technology/systems/content/alphaville2/00-troubleshooting",
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		fetch(`${process.env['WP_URL']}/marketslive/2016-11-01?action=init&v=2`)
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
				currentHealth.checkOutput = "Wordpress API is unreachable. Error: " + (err && err.message ? err.message : '');
				resolve(currentHealth);
			});
	});
};
