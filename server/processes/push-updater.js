require('isomorphic-fetch');

const EventSource = require('eventsource');
const elastic = require('../lib/elastic');
const logger = require('../lib/logger');


const apiUrlRegex = /api\.ft\.com\/content\/([a-z0-9-]+)/;

let eventSource;

function getUID (url) {
	let matches = apiUrlRegex.exec(url);

	if (!matches || matches.length < 2) {
		return null;
	}

	return matches[1];
}

function error (type, d) {
	let logStr = `event=PUSH_EVENT_ERROR error=${type}`;
	logger.error(logStr, d);
}

function onMessage (e) {
	logger.info({ event: 'PUSH_EVENT_RECEIVED', data: e.data });

	let apiUrl;
	let data = JSON.parse(e.data);

	if (data.length === 0) {
		logger.info('event=EMPTY_DATA');
		return;
	}

	try {
		apiUrl = data[0].apiUrl;
	} catch (e) {
		return error('UNEXPECTED_DATA_STRUCTRE', {data:e.data});
	}

	let uid = getUID(apiUrl);

	if (!uid) {
		return error('UID_PARSE_FAILURE', {apiUrl:apiUrl});
	}

	logger.info(`event=PUSH_UID uid=${uid}`);
	elastic.update(uid);
}

function start (){
	if (!process.env.PUSH_API_URL) {
		throw new Error('PUSH_API_URL env var missing!');
	}

	if (!process.env.COCO_API_AUTHORIZATION) {
		throw new Error('COCO_API_AUTHORIZATION env var missing');
	}

	logger.info(`event=PUSH_API_CONNECT url=${process.env.PUSH_API_URL}`);

	eventSource = new EventSource(
		process.env.PUSH_API_URL,
		{
			headers:{
				'Authorization' : process.env.COCO_API_AUTHORIZATION
			}
		}
	);
	eventSource.onmessage = onMessage;
	eventSource.onopen = () => logger.info('event=PUSH_API_CONNECTION_OPEN');
	eventSource.onerror = err => {
		let stack = typeof err.stack === 'string' ? err.stack.replace(/\n/g, '; ') : '';
		let status = err.status || null;
		error('EVENT_SOURCE_ERROR', {message:err.message, stack:stack, status:status});
	};
}

function stop () {
	eventSource.close();
}

// If not being required (ie not a unit test) start up this script
if (!module.parent) {
	start();
}

module.exports = { start, stop };
