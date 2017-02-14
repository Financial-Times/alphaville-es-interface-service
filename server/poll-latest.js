require('isomorphic-fetch');

const logger = require('./lib/logger');
const handleLatest = require('./processes/handle-latest');
const args = require('minimist')(process.argv.slice(2));
const UPDATE_INTERVAL = parseInt(args.updateInterval, 10) || 2 * 60 * 1000;
const UPDATE_COUNT = parseInt(args.updateCount, 10) || 100;

function runUpdate () {
	handleLatest(UPDATE_COUNT);
}

setInterval(runUpdate, UPDATE_INTERVAL);

runUpdate(UPDATE_COUNT);
