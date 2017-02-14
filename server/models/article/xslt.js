'use strict';

let spawn = require('child_process').spawn;

module.exports = function (xml, stylesheet = 'main', params = {}) {
	return new Promise(function (resolve, reject) {
		let output = [];
		let errors = [];
		let options = [
			'--html',
			'--novalid',
			'--encoding', 'utf-8'
		];

		Object.keys(params).forEach(function (param) {
			let string = typeof params[param] === 'string';
			options = options.concat(string ? '--stringparam' : '--param', param, params[param]);
		});

		let env = { PATH: '/app/libxslt/bin:' + process.env.PATH };
		let xsltproc = spawn('xsltproc', options.concat(
			process.cwd() + '/server/stylesheets/' + stylesheet + '.xsl',
			'-'
		), { env: env });

		xsltproc.stdout.setEncoding('utf8');

		xsltproc.stdin.write(xml);

		xsltproc.stdin.end();

		xsltproc.stdout.on('data', function (data) {
			output.push(data);
		});

		xsltproc.stderr.on('data', function (error) {
			errors.push(error.toString());
		});

		xsltproc.on('error', function (error) {
			reject(error.toString());
		});

		xsltproc.on('close', function (code) {
			if (code !== 0) {
				return reject('xsltproc exited with code ' + code + ': ' + errors);
			}

			resolve(output.join('')
				.replace(/<\/?(html|body)>/g, '')
				.replace(/\n$/, ''));
		});
	});
};
