'use strict';

var remove         = require('es5-ext/array/#/remove')
  , assign         = require('es5-ext/object/assign')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , contains       = require('es5-ext/string/#/contains')
  , d              = require('d/d')
  , autoBind       = require('d/auto-bind')
  , Iterator       = require('es6-iterator')
  , byLastModified = require('../utils/compare-by-last-modified')

  , push = Array.prototype.push
  , defineProperties = Object.defineProperties
  , unBind = Iterator.prototype._unBind
  , MultiplePropertyIterator;

MultiplePropertyIterator = module.exports = function (set, kind) {
	var sKey, sKeys, data;
	if (!(this instanceof MultiplePropertyIterator)) {
		return new MultiplePropertyIterator(set, kind);
	}
	sKeys = [];
	data = set.__setData__;
	for (sKey in data) {
		if (!data[sKey]._value_) continue;
		sKeys.push(sKey);
	}
	Iterator.call(this, sKeys.sort(byLastModified.bind(data)));
	kind = (!kind || !contains.call(kind, 'key+value')) ? 'value' : 'key+value';
	defineProperties(this, {
		__kind__: d('', kind),
		__set__: d('w', set)
	});
	set.__master__._getMultipleIterators_(set.__pKey__).push(this);
};
if (setPrototypeOf) setPrototypeOf(MultiplePropertyIterator, Iterator);

MultiplePropertyIterator.prototype = Object.create(Iterator.prototype, assign({
	constructor: d(MultiplePropertyIterator),
	_confirm: d(function (i) {
		var set = this.__set__;
		if (set.__master__._normalize_(set.__pKey__,
				set.__setData__[this.__list__[i]]._key_) == null) {
			return this._next();
		}
		return i;
	}),
	_next: d(function () {
		if (!this.__list__) return;
		if (this.__nextIndex__ < this.__list__.length) {
			return this._confirm(this.__nextIndex__++);
		}
		this._unBind();
	}),
	_resolve: d(function (i) {
		var value = this.__set__.__setData__[this.__list__[i]]._key_;
		return (this.__kind__ === 'value') ? value : [value, value];
	}),
	_unBind: d(function () {
		if (!this.__set__) return;
		remove.call(this.__set__.__master__
			._getMultipleIterators_(this.__set__.__pKey__), this);
		this.__set__ = null;
		unBind.call(this);
	}),
	'@@toStringTag': d('c', 'Set Iterator'),
	toString: d(function () { return '[object Set Iterator]'; })
}, autoBind({
	_onDelete: d(function (sKey) {
		var index = this.__list__.indexOf(sKey);
		if (index >= this.__nextIndex__) this.__list__.splice(index, 1);
	}),
	_onAdd: d(function (sKey, stamp) {
		var index = this.__list__.indexOf(sKey);
		if (index === -1) {
			this.__list__.push(sKey);
		} else if (index < this.__nextIndex__) {
			this.__list__.splice(index, 1);
			--this.__nextIndex__;
			this.__list__.push(sKey);
		}
		push.apply(this.__list__,
			this.__list__.splice(this.__nextIndex__)
			.sort(byLastModified.bind(this.__set__.__setData__)));
	})
})));