'use strict';

const fetch = require('node-fetch');
const _ = require('lodash');

const healthCheckModel = {
	id: 'wordpress-json-api',
	name: 'Wordpress JSON API',
	ok: false,
	technicalSummary: "Wordpress JSON API serves the list of team members and information about them.",
	severity: 3,
	businessImpact: "Whitelisting for AV team members will not be available.",
	checkOutput: "",
	panicGuide: "",
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		fetch(`${process.env.PROD_WP_URL}/api/get_recent_posts/?post_type=team_member&api_key=${process.env['WP_API_KEY']}`)
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
