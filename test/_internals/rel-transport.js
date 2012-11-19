'use strict';

var root    = require('../../lib/types/root')
  , boolean = require('../../lib/types/boolean');

module.exports = function (a) {
	var ns = root.abstract('reltransporttest', {
		foo: boolean.rel({ value: true, required: true })
	});

	a(ns.foo, true, "Value");
	a(ns._foo.ns, boolean, "Namespace");
	a(ns._foo.required, true, "Property");

	ns = root.abstract('reltransporttest2', {
		foo: boolean.rel(true)
	});

	a(ns.foo, true, "Direct Value: Value");
	a(ns._foo.ns, boolean, "Direct Value: Namespace");
};
