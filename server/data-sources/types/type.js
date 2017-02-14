class Type {
	constructor (data) {
		this.initialData = data;
		this.flags = {
			validate: false
		};
	}

	static get model () {
		throw new Error('Not implemented');
	}

	static match () {
		throw new Error('Not implemented');
	}

	static check () {
		throw new Error('Not implemented');
	}

	get validate () {
		this.flags.validate = true;
		return this;
	}

	data () {
		throw new Error('Not implemented');
	}

	model () {
		return this.data()
			.then(this.constructor.model)
			.then(result => {
				if (this.flags.validate) {
					return this.constructor.check(result);
				} else {
					return result;
				}
			});
	}
}

module.exports = Type;
