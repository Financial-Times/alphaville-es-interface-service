const schema = require('../../schema/content.json').mappings.item;

function setProperty (property, value) {
	if (value instanceof Promise) {
		this.async[property] = value;
		this.async[property].then((result) => this.set(property, result));
	} else if (value instanceof Function) {
		this.set(property, value.call(null));
	} else {
		this.model[property] = value;
	}
}

class Model {
	constructor () {
		this.model = {};
		this.async = {};
	}

	set (property, value) {
		if (schema.properties.hasOwnProperty(property)) {
			setProperty.call(this, property, value);
		} else {
			throw new Error(`No property named "${property}" in schema`);
		}
	}

	get (property) {
		return this.async[property] || Promise.resolve(this.model[property]);
	}

	done () {
		const async = Object.keys(this.async).map((key) => this.async[key]);
		return Promise.all(async).then(() => Object.freeze(this.model));
	}
}

module.exports = Model;
