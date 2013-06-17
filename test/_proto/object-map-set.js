'use strict';

var Db = require('../../')

  , byName = function (a, b) { return a.name.localeCompare(b.name); };

module.exports = function (t, a) {
	var obj, set, event, map;
	obj = new Db({ raz: 1, trzy: 3 });
	set = obj.getOwnPropertyNames().liveSetMap(map = function (name) {
		return this.get(name);
	});

	a.deep(set.values.sort(byName), [obj._raz, obj._trzy], "Mapped");

	set.once('add', function (e) { event = e; });
	obj.set('dwa', 2);
	a.deep(set.values.sort(byName), [obj._dwa, obj._raz, obj._trzy],
		"Update: Add");
	a(event, obj._dwa, "Update: Add: Event");

	event = null;
	set.once('delete', function (e) { event = e; });
	obj.raz = undefined;
	a.deep(set.values.sort(byName), [obj._dwa, obj._trzy], "Update: Delete");
	a(event, obj._raz, "Update: Delete: Event");

	a(set, obj.getOwnPropertyNames().liveSetMap(map), "Memoized");

	obj = new Db({ raz: 1, trzy: 3 });
	set = obj.getOwnPropertyNames().relMap();

	a.deep(set.values.sort(byName), [obj._raz, obj._trzy], "RelMap: Mapped");

	set.once('add', function (e) { event = e; });
	obj.set('dwa', 2);
	a.deep(set.values.sort(byName), [obj._dwa, obj._raz, obj._trzy],
		"Update: Add");
	a(event, obj._dwa, "RelMap: Update: Add: Event");

	event = null;
	set.once('delete', function (e) { event = e; });
	obj.raz = undefined;
	a.deep(set.values.sort(byName), [obj._dwa, obj._trzy],
		"RelMap: Update: Delete");
	a(event, obj._raz, "RelMap: Update: Delete: Event");

	a(set, obj.getOwnPropertyNames().relMap(), "RelMap: Memoized");
};
