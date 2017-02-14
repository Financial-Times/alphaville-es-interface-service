const express = require('express');
const http = require('http');
const _ = require('lodash');
const throng = require('throng');
const bodyParser = require('body-parser');
const defaultConfig = require('./config');

const createServer = (config) => {
	// force GC to 80% of available memory
	const v8 = require('v8');

	if(process.env.WEB_MEMORY) {
		const gcMemory = Math.floor(parseInt(process.env.WEB_MEMORY, 10) * 4 / 5);
		v8.setFlagsFromString(`--max_old_space_size=${gcMemory}`);
	}

	const app = express();
	app.use(bodyParser.json());
	app.disable('x-powered-by');
	require('./appSetup')(app, config);
	app.use(require('./router'));

	const server = http.createServer(app);

	if (config.timeout) {
		server.setTimeout(config.timeout, (socket) => {
			const message = `Timeout of ${config.timeout}ms exceeded`;

			socket.end([
				`HTTP/1.1 503 Service Unavailable`,
				`Date: ${(new Date).toGMTString()}`,
				`Content-Type: text/plain`,
				`Content-Length: ${message.length}`,
				`Connection: close`,
				``,
				message
			].join(`\r\n`));
		});
	}

	return server;
};

const startServer = (serverConfig) => {
	const config = _.merge(defaultConfig, serverConfig);
	const server = createServer(config);
	server.listen(config.port, () => {
		console.log('Server #%s listening on port %s', config.id, config.port);
	});
	return server;
};

module.exports = {
	startServer
};

if (require.main === module) {
	throng({
		start: (id) => startServer({ id }),
		workers: process.env.WEB_CONCURRENCY || 1,
		lifetime: Infinity
	});
}
