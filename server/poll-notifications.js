require('isomorphic-fetch');

const logger = require('./lib/logger');
const handleNotifications = require('./processes/handle-notifications');
const args = require('minimist')(process.argv.slice(2));
const UPDATE_INTERVAL = parseInt(args.updateInterval, 10) || 1 * 60 * 1000;

function runUpdate () {
	handleNotifications(travelToThePast());
}

// Fetch the date string from where the update should occur
function travelToThePast () {
	return new Date(Date.now() - UPDATE_INTERVAL).toISOString();
}

setInterval(runUpdate, UPDATE_INTERVAL);

runUpdate();
