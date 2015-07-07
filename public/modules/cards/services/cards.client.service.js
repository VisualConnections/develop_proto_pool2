/// <reference path="~/public/lib/angular/angular.js" />

'use strict';

angular.module('cards').factory('CardsFactory', ['$http', '$resource',
	function ($http, $resource) {
		
	    var factory = {};

	    factory.getCardRecords = function (sourceId, sourceName, searchTerm, currentPage) {
	        return $http.get('proxy?sourceId=' + sourceId + '&currentPage=' + currentPage + '&searchTerm=' + searchTerm, { data: { sourceId: sourceId, sourceName: sourceName, searchTerm: searchTerm }, cache: true, timeout: 20000 });
	    };


	    factory.getDetailedCardRecord = function (sourceId, recordId) {
	        return $http.get('proxy?sourceId=' + sourceId + '&recordId=' + recordId, { cache: true });
	    };


	    return factory;
	}
]);