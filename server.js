const express = require('express');
const http = require('http');
const _ = require('lodash');
const throng = require('throng');
const defaultConfig = require('./config');

const createServer = (config) => {

	const app = express();
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
		console.log('Server #%s listening on port %s', config.id, config.port)
	});
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
