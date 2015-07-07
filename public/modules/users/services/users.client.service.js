'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);


angular.module('users').factory('UserPreferences', [
	function () {

	    var factory = {};

	    factory.getUserPreferences = function () {
	        var userPreferences = {
	            sources: [
                            {
                                id: 'fda',
                                name: 'FDA Drugs',
                                chosen: true
                            }
	            ],
	            searchTerms: ["Clarithromycin"]
	        };

	        return userPreferences;
	    };

	    return factory;
	}


]);