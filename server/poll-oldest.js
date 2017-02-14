require('isomorphic-fetch');

const handleOldest = require('./processes/handle-oldest');
const args = require('minimist')(process.argv.slice(2));
const UPDATE_INTERVAL = parseInt(args.updateInterval, 10) || 1 * 60 * 1000;
const UPDATE_COUNT = parseInt(args.updateCount, 10) || 100;


function runUpdate () {
	handleOldest(UPDATE_COUNT);
}

setInterval(runUpdate, UPDATE_INTERVAL);

runUpdate(UPDATE_COUNT);
