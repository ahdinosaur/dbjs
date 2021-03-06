'use strict';

var assign           = require('es5-ext/object/assign')
  , create           = require('es5-ext/object/create')
  , d                = require('d')
  , lazy             = require('d/lazy')
  , Set              = require('es6-set/polyfill')
  , setCopy          = require('es6-set/ext/copy')
  , setEvery         = require('es6-set/ext/every')
  , setSome          = require('es6-set/ext/some')
  , DbjsError        = require('../error')
  , Event            = require('../event')
  , serialize        = require('../serialize/key')
  , defineObservable = require('../utils/define-set-observable')
  , Iterator         = require('./iterator')

  , keys = Object.keys, defineProperties = Object.defineProperties
  , isTruthy, Multiple;

isTruthy = function (sKey) {
	var item = this[sKey];
	if (!item.hasOwnProperty('_value_')) return false;
	return item._value_;
};

module.exports = Multiple = function (obj, pSKey) {
	defineProperties(this, {
		object: d('', obj),
		dbId: d('', obj.__id__ + '/' + pSKey),
		__pSKey__: d('', pSKey),
		__setData__: d('', obj._getMultipleItems_(pSKey))
	});
};

Multiple.prototype = create(Set.prototype, assign({
	constructor: d(Multiple),
	_serialize: d(serialize),
	add: d(function (key) {
		var obj = this.object;
		key = obj._validateMultipleAdd_(this.__pSKey__, key);
		obj._multipleAdd_(this.__pSKey__, key, serialize(key));
		return this;
	}),
	clear: d(function () {
		this.object.database._postponed += 1;
		this._validateClear_().forEach(function (sKey) {
			var item = this.__setData__[sKey];
			if (!item.hasOwnProperty('_value_')) return;
			new Event(item, undefined); //jslint: ignore
		}, this);
		this.object.database._postponed -= 1;
	}),
	delete: d(function (key) {
		var obj = this.object;
		key = obj._validateMultipleDelete_(this.__pSKey__, key);
		if (key == null) return false;
		return obj._multipleDelete_(this.__pSKey__, key, serialize(key));
	}),
	entries: d(function () { return new Iterator(this, 'key+value'); }),
	has: d(function (key) {
		var item;
		if (key == null) return false;
		key = this.object._normalize_(this.__pSKey__, key);
		if (key == null) return false;
		item = this.__setData__[this._serialize(key)];
		if (item == null) return false;
		if (typeof item === 'number') return true;
		return Boolean(item._value_);
	}),
	size: d.gs(function () {
		if (this.hasOwnProperty('__size__')) return this.__size__;
		return this.object._getMultipleSize_(this.__pSKey__);
	}),
	values: d(function () { return new Iterator(this); }),
	copy: d(setCopy),
	every: d(setEvery),
	some: d(setSome),
	$getOwn: d(function (key) {
		key = this._validate_(key);
		return this.object._getOwnMultipleItem_(this.__pSKey__,
			key, this._serialize(key));
	}),
	$get: d(function (key) {
		key = this._validate_(key);
		return this.object._getMultipleItem_(this.__pSKey__,
			this._serialize(key));
	}),
	_get: d(function (key) {
		key = this._validate_(key);
		return this.object._getMultipleItemObservable_(this.__pSKey__,
			this._serialize(key), key);
	}),
	getLastModified: d(function (key) {
		var item;
		if (key == null) return null;
		key = this.object._normalize_(this.__pSKey__, key);
		if (key == null) return null;
		item = this.__setData__[key];
		if (!item) return 0;
		if (typeof item === 'number') return item;
		return item.lastModified;
	}),
	_validateClear_: d(function () {
		var desc, sKeys;
		this.object._assertWritable_(this.__pSKey__);
		desc = this.object._getDescriptor_(this.__pSKey__);
		sKeys = keys(this.__setData__);
		if (desc.required && (this.size === 1) &&
				sKeys.some(isTruthy, this.__setData__)) {
			throw new DbjsError("Property is required. List must not be empty",
				'MULTIPLE_REQUIRED');
		}
		return sKeys;
	}),
	_validate_: d(function (key) {
		var original = key;
		if (key == null) {
			throw new DbjsError(key + " is not a value", 'ITEM_NULL_VALUE');
		}
		key = this.object._normalize_(this.__pSKey__, key);
		if (key == null) {
			throw new DbjsError(original + " is an invalid value", 'INVALID_VALUE');
		}
		return key;
	}),
	toString: d(function (/*separator*/) {
		var data = [], sep = arguments[0];
		if (sep === undefined) sep = ", ";
		this.forEach(function (value) {
			data.push(String(value));
		});
		return data.join(sep);
	})
}, lazy({
	_dynamicListeners_: d(function () { return []; },
		{ cacheName: '__dynamicListeners__', desc: '' })
})));

defineObservable(Multiple.prototype);
