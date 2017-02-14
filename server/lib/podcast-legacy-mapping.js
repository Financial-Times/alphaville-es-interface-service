'use strict';

exports.load = function load (url) {
	return fetch(url).then(function (response) {
		if (response.ok) {
			return response.json();
		}

		return Promise.reject('Failed to load worksheet');
	});
};

exports.find = function find (dataset, guid) {
	let results = dataset.filter(function (row) {
		return row.permalinkinrss.trim() === guid;
	});

	if (results.length && results[0].newacastguidnotusedinrss) {
		return results[0].newacastguidnotusedinrss.trim();
	}
};
