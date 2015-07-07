'use strict';

/**
 * Module dependencies.
 */
var proxy = require('../../app/controllers/proxy');

module.exports = function(app) {
	// Article Routes
    app.route('/proxy').get(proxy.read);
};