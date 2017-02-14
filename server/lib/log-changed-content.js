const logger = require('./logger');
const AWS = require('aws-sdk');
const denodeify = require('denodeify');
const kinesis = new AWS.Kinesis({ region: 'eu-west-1' });
const putRecord = denodeify(kinesis.putRecord.bind(kinesis));

module.exports = function logChangedContent (data = {}, opts) {
	// log to n-logger by default
	if (!opts || opts.verbose) {
		const changes = [];

		// only log changed fields to splunk
		if (data.changes && Array.isArray(data.changes.diff)) {
			data.changes.diff.forEach((change) => {
				const field = change.path && change.path[0];
				field && !changes.includes(field) && changes.push(field);
			});
		}

		logger.info(`event=CONTENT_${data.event} uuid=${data.uuid} changes="${changes.join()}"`);
	}

	// Don't put event to Kinesis for unchanged data
	if (data.event === 'UPDATE_TIMESTAMP') {
		return Promise.resolve();
	}

	// only put events in the EU onto the Kinesis stream
	if (process.env.REGION !== 'EU') {
		return Promise.resolve();
	}

	return putRecord({
		StreamName: 'nextContentChangelog',
		PartitionKey: process.env.DYNO + ':' + Date.now(),
		Data: JSON.stringify(data)
	})
		.catch(error => {
			logger.info(`event=KINESIS_PUTRECORD_FAILED trigger=${data.event} uuid=${data.uuid} url=${data.url} error=${error}`);
		});
};
