'use strict';


//Setting up route
angular.module('cards').config(['$stateProvider',
	function($stateProvider) {
		// Cards state routing
	    $stateProvider.

        state('mainCards', {
            url: '/cards?searchTermAll',
            templateUrl: 'modules/cards/views/cards.client.view.html'
        }).


        state('detailedCard', {
            url: '/cards/detail?sourceId&recordId&searchTerm',
            templateUrl: 'modules/cards/views/detailed.card.client.view.html'
        }).

		state('dailyMedCards', {
			url: '/cards/daily/:searchTerm',
			templateUrl: 'modules/cards/views/daily.cards.client.view.html'
		}).


        state('medPlusConnect', {
            url: '/cards/medplusconnect/:searchTerm',
            templateUrl: 'modules/cards/views/medplusconnect.cards.client.view.html'
        }).


        state('medPlus', {
            url: '/cards/medplus/:searchTerm',
            templateUrl: 'modules/cards/views/medplus.cards.client.view.html'
        }).


        state('trials', {
            url: '/cards/trials/:searchTerm',
            templateUrl: 'modules/cards/views/trials.cards.client.view.html'
        }).


        state('pubmed', {
            url: '/cards/pubmed/:searchTerm',
            templateUrl: 'modules/cards/views/pubmed.cards.client.view.html'
        }).


		state('digitalCollections', {
		    url: '/cards/digital/:searchTerm',
		    templateUrl: 'modules/cards/views/digital.cards.client.view.html'
		});
	}
]);