const key = document.getElementById('js-key');
const log = document.getElementById('js-log');
const input = document.getElementById('js-input');
const action = document.getElementById('js-action');

const actions = {};

actions.ingest = function () {
	updateItem(input.value, 'PUT');
};

actions.delete = function () {
	updateItem(input.value, 'DELETE');
};

actions.tme = function () {
	updateIds('tag=' + encodeURIComponent(input.value));
};

actions.date = function () {
	updateIds('date=' + input.value);
};

// Ingests or deletes a single item
function updateItem (id, method) {
	const url = '/api/item?apiKey=' + key.value;

	return fetch(url, {
		method: method,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id: id })
	})
		.then(function (res) {
			if (res.ok) {
				updateLog('Successfully updated ' + id);
			} else {
				return res.text().then((txt) => {
					throw new Error(txt);
				});
			}
		})
		.catch(function (err) {
			updateLog('Failed to update ' + id + ': ' + err.message);
		});
}

// Fetches a list of UUIDs filtered by query and ingests each
function updateIds (query) {
	const url = '/api/ids?count=100&' + query + '&apiKey=' + key.value;

	return fetch(url, {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	})
		.then(function (res) {
			if (res.ok) {
				return res.json();
			} else {
				return res.text().then((txt) => {
					throw new Error(txt);
				});
			}
		})
		.then(function (ids) {
			const requests = ids.map(function (id) {
				return updateItem(id, 'PUT');
			});

			return Promise.all(requests);
		})
		.then(function () {
			updateLog('Ingest complete!');
		})
		.catch(function (err) {
			updateLog('Ingest failed: ' + err.message);
		});
}

function updateLog (content) {
	log.innerHTML += content + '\n';
	// scroll to bottom
	log.scrollTo && log.scrollTo(0, log.scrollHeight);
}

function performAction () {
	updateLog('Doin\' stuff...');
	actions[action.value](input.value);
}

action.addEventListener('click', function () {
	if (input.value.length === 0) {
		return alert('Sorry, I can\'t work with nothing!');
	}

	if (input.checkValidity && input.checkValidity() === false) {
		return input.reportValidity();
	}

	if (action.classList.contains('js-confirm')) {
		confirm('Are you sure?') ? performAction() : updateLog('');
	} else {
		performAction();
	}
});
