'use strict';

module.exports = function (t, a) {
	var set = new t();

	a(set._isSet_, true, "Is set");
	a.throws(function () { set.add(1); }, 'SET_READ_ONLY', "No add allowed");
	a.throws(function () { set.delete(1); }, 'SET_READ_ONLY',
			"No delete allowed");
};