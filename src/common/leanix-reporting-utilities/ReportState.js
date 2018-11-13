/* The MIT License (MIT)

Copyright (c) 2018 LeanIX GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

// from https://github.com/leanix/leanix-custom-reports

import Utilities from './Utilities';
import TypeUtilities from './TypeUtilities';

class ReportState {

	constructor() {
		this._defaultValues = {};
		this._validators = {};
		this._state = {};
	}

	prepareValue(key, validator, defaultValue) {
		if (!key) {
			return;
		}
		if (typeof validator !== 'function') {
			throw 'Validator must be a function.';
		}
		this._validators[key] = validator;
		// this call omits state change vars, b/c it's a preparing step
		_checkValue(key, validator, defaultValue);
		this._defaultValues[key] = defaultValue;
		// also set one for the state
		const currentValue = this._state[key];
		if (currentValue !== undefined) {
			// is the previous value still valid? if so, leave it
			try {
				// this call omits state change vars, b/c it's a preparing step
				_checkValue(key, validator, currentValue);
			} catch (err) {
				// previous value not valid, so reset it
				this._state[key] = undefined;
			}
		} else {
			this._state[key] = undefined;
		}
	}

	prepareBooleanValue(key, defaultValue) {
		this.prepareValue(key, (v, k, nS, cS) => {
			if (!TypeUtilities.isBoolean(v)) {
				return 'Provided value must be a boolean.';
			}
		}, defaultValue);
	}

	prepareRangeValue(key, min, max, steps, defaultValue) {
		this.prepareValue(key, (v, k, nS, cS) => {
			if (!TypeUtilities.isNumber(v) || Number.isNaN(v)) {
				return 'Provided value must be a number.';
			}
			if (v < min) {
				return 'Provided value must be greater than or equal to ' + min + '.';
			}
			if (v > max) {
				return 'Provided value must be lower than or equal to ' + max + '.';
			}
			if (v % steps > 0) {
				return 'Provided value must be a multiple of ' + steps + '.';
			}
		}, defaultValue);
	}

	prepareEnumValue(key, enums, defaultValue) {
		this.prepareValue(key, (v, k, nS, cS) => {
			if (!enums.includes(v)) {
				return 'Provided value must be one of ' + enums.join(', ') + '.';
			}
		}, defaultValue);
	}

	prepareComplexEnumValue(key, enums, enumKeyGetter, defaultValue) {
		const includes = (v) => {
			return enums.some((e) => {
				return enumKeyGetter(e) === enumKeyGetter(v);
			});
		};
		this.prepareValue(key, (v, k, nS, cS) => {
			if (!includes(v)) {
				const props = enums.map((e) => {
					return enumKeyGetter(e);
				});
				return 'Provided value must be one of ' + props.join(', ') + '.';
			}
		}, defaultValue);
	}

	prepareStringValue(key, defaultValue) {
		this.prepareValue(key, (v, k, nS, cS) => {
			if (!TypeUtilities.isString(v) || v.trim().length < 1) {
				return 'Provided value must be a non-empty string.';
			}
		}, defaultValue);
	}

	prepareOptionalStringValue(key, defaultValue) {
		this.prepareValue(key, (v, k, nS, cS) => {
			if (!TypeUtilities.isString(v)) {
				return 'Provided value must be a string.';
			}
		}, defaultValue);
	}

	prepareRegExpValue(key, regExp, defaultValue, errorMessage) {
		this.prepareValue(key, (v, k, nS, cS) => {
			const str = TypeUtilities.toString(v).trim();
			if (!regExp.test(str)) {
				return errorMessage;
			}
		}, defaultValue);
	}

	prepareOptionalRegExpValue(key, regExp, defaultValue, errorMessage) {
		this.prepareValue(key, (v, k, nS, cS) => {
			const str = TypeUtilities.toString(v).trim();
			if (str.length > 0 && !regExp.test(str)) {
				return errorMessage;
			}
		}, defaultValue);
	}

	get(key) {
		if (key !== undefined && key !== null) {
			const value = this._state[key];
			return value === undefined ? this._defaultValues[key] : value;
		}
		// no key given, therefore get all
		const result = {};
		for (let key in this._state) {
			const value = this.get(key);
			if (Array.isArray(value)) {
				result[key] = Utilities.copyArray(value, true);
			} else if (typeof value === 'object') {
				result[key] = Utilities.copyObject(value, true);
			} else {
				result[key] = value;
			}
		}
		return result;
	}

	set(key, value) {
		if (!key) {
			return;
		}
		const currentState = this.get();
		const newState = Utilities.copyObject(currentState, true);
		newState[key] = value;
		const validator = this._validators[key];
		_checkValue(key, validator, value, newState, currentState);
		return _setValue(this._state, key, value);
	}

	update(obj) {
		if (!obj) {
			return;
		}
		const currentState = this.get();
		const newState = Utilities.copyObject(currentState, true);
		for (let key in obj) {
			newState[key] = obj[key];
		}
		// first check all values before updating anything
		const errors = {};
		for (let key in obj) {
			const validator = this._validators[key];
			try {
				_checkValue(key, validator, obj[key], newState, currentState);
			} catch (err) {
				errors[key] = err;
			}
		}
		if (Object.keys(errors).length > 0) {
			throw errors;
		}
		const oldValues = {};
		for (let key in obj) {
			oldValues[key] = _setValue(this._state, key, obj[key]);
		}
		return oldValues;
	}

	reset(key) {
		if (key) {
			this._state[key] = undefined;
			return;
		}
		// no key given, therefore reset all
		for (let key in this._state) {
			this._state[key] = undefined;
		}
	}

	publish() {
		lx.publishState(this.get());
	}
}

function _checkValue(key, validator, value, newState, currentState) {
	if (validator) {
		const error = validator(value, key, newState, currentState);
		if (error) {
			throw error;
		}
	}
}

function _setValue(state, key, value) {
	const oldValue = state[key];
	state[key] = value;
	return oldValue;
}

export default ReportState;
