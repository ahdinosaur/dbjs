'use strict';

var Database = require('../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object();

	a(t(), false, "Undefined");
	a(t(null), false, "Null");
	a(t('raz'), false, "String");
	a(t(2342), false, "Number");
	a(t(new Date()), false, "Date");
	a(t(new db.DateTime()), false, "Date out of database");
	a(t({}), false, "Plain object");
	a(t(obj), false, "Db object");
	obj.$getOwn('foo').nested = true;
	a(t(obj.foo), true, "Nested");
	a(t(obj.foo, new db.Object()), false, "Nested: Different owner");
	a(t(obj.foo, obj), true, "Nested: Different owner");
	a(t(obj.$getOwn('test')), false, "Db descriptor");
	a(t(obj.$getOwn('test').$getOwn('raz')), false, "Db descriptor's descriptor");
	a(t(obj._getMultiple_('test').$getOwn('raz')), false, "Db item");
};