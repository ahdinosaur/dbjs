'use strict';

var isFunction     = require('es5-ext/function/is-function')
  , mixin          = require('es5-ext/object/mixin')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , DbjsError      = require('../error')
  , isGetter       = require('../utils/is-function-getter')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (db) {
	var FunctionType = db.Base._extend_('Function');

	defineProperty(FunctionType, 'prototype', d('', FunctionType.prototype));
	try { mixin(FunctionType, Function); } catch (ignore) {}

	defineProperties(FunctionType, {
		is: d(function (value) {
			return (isFunction(value) && !isGetter(value) &&
				(getPrototypeOf(value) === this.prototype));
		}),
		normalize: d(function (value) {
			if (!isFunction(value)) return null;
			if (isGetter(value)) return null;
			setPrototypeOf(value, this.prototype);
			return value;
		}),
		validate: d(function (value) {
			if (!isFunction(value)) {
				throw new DbjsError(value + " is not a function",
					'INVALID_FUNCTION');
			}
			if (isGetter(value)) {
				throw new DbjsError(value + " is getter type of function",
					'FUNCTION_GETTER');
			}
			setPrototypeOf(value, this.prototype);
			return value;
		})
	});

	mixin(FunctionType.prototype, Function.prototype);
};
