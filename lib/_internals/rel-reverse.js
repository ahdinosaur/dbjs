'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , forEach  = require('es5-ext/lib/Object/for-each')
  , callable = require('es5-ext/lib/Object/valid-callable')
  , values   = require('es5-ext/lib/Object/values')

  , call = Function.prototype.call
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf

  , readOnly = function () { throw new TypeError("Set is read-only"); }
  , getKey = function (obj) { return '0' + obj.__id; }

  , RelReverse, reverse = {};

exports.add = function (rel, value) {
	var id, relId, data, rev, obj, proto;
	id = value.__id;
	data = reverse[id];
	if (!data) data = reverse[id] = {};
	obj = rel.obj;
	data[obj.__id + ':' + rel.name] = obj;

	proto = getPrototypeOf(rel);
	while (proto.obj) {
		relId = proto.obj.__id + ':' + proto.name;
		rev = data[relId];
		if (!rev) rev = data[relId] = new RelReverse(proto);
		rev._add(obj);
		proto = getPrototypeOf(proto);
	}
};

exports.remove = function (rel, value) {
	var id, obj, data, proto;
	id = value.__id;
	data = reverse[id];
	obj = rel.obj;
	delete data[obj.__id + ':' + rel.name];

	proto = getPrototypeOf(rel);
	while (proto.obj) {
		data[proto.obj.__id + ':' + proto.name]._remove(obj);
		proto = getPrototypeOf(proto);
	}
};

exports.set = function (rel, name) {
	var ns = rel._ns, relId = rel.obj.__id + ':' + rel.name;
	defineProperty(ns.prototype, name, d.gs('c', function () {
		var id = this.__id, data = reverse[id], rev;
		if (!data) data = reverse[id] = {};
		rev = data[relId];
		if (!rev) rev = data[relId] = new RelReverse(rel);
		return rev.value;
	}));
};
exports.unset = function (rel, name) { delete rel._ns.prototype[name]; };

RelReverse = function (rel) { defineProperty(this, '_rel', d('', rel)); };
defineProperties(RelReverse.prototype, {
	add: d(readOnly),
	delete: d(readOnly),
	__isSet: d.gs(function () { return !this._rel._unique; }),
	_assertSet: d(function () {
		if (!this.__isSet) throw new TypeError("Property is not a set");
	}),
	_initSet: d(function () {
		if (this._value) {
			defineProperty(this, 'count', d('cw', 1));
			defineProperty(this, getKey(this._value), d('ce', this._value));
		} else {
			defineProperty(this, 'count', d('cw', 0));
		}
	}),
	has: d(function (value) {
		var key;
		this._assertSet();
		if (value == null) return false;
		key = getKey(value);
		return (this.hasOwnProperty(key) && (this[key] === value)) || false;
	}),
	_last: d.gs(function () { return this.values[0] || null; }),
	_value: d(null),
	_add: d(function (value) {
		if (this.hasOwnProperty('count')) {
			defineProperty(this, getKey(value), d('ce', value));
			++this.count;
		} else if (this._value) {
			this._initSet();
			defineProperty(this, getKey(value), d('ce', value));
			++this.count;
		} else if (!this.hasOwnProperty('_value')) {
			defineProperty(this, '_value', d('w', value));
			return;
		}
		this._value = value;
	}),
	_remove: d(function (value) {
		if (this.hasOwnProperty('count')) {
			delete this[getKey(value)];
			--this.count;
			if (this._value === value) this._value = this._last;
			return;
		}
		this._value = null;
	}),
	value: d.gs(function () {
		if (!this._rel._unique) {
			if (!this.hasOwnProperty('count')) this._initSet();
			return this;
		}
		return this._value;
	}),
	forEach: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1], index = -1;
		this._assertSet();
		callable(cb);
		forEach(this, function (value) {
			call.call(cb, thisArg, value, null, this, ++index);
		}, this);
	}),
	values: d.gs(function () {
		this._assertSet();
		return values(this);
	})
});