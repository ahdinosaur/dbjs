'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , protoDesc, protoSet, set, item;

	protoDesc = proto.$get('foo');
	protoDesc.multiple = true;

	set = obj.foo;
	item = set.$get('foo');
	protoSet = proto.foo;
	protoSet.$get('foo');

	a(item._resolveValue_(), undefined, "Initial value");
	protoSet.add('foo');
	a(item._resolveValue_(), true, "Prototype: Add");
	protoSet.delete('foo');
	a(item._resolveValue_(), undefined, "Prototype: Delete");
	set.add('foo');
	a(item._resolveValue_(), true, "Set: Add");
};
