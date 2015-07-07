'use strict'

describe('Cards controller tests', function(){

	beforeEach(module('cards'));

	var CardsCtrl,
		scope;

	beforeEach(inject(function($controller, $rootScope){

		scope = $rootScope.$new();
		CardsCtrl = $controller('CardsController', {
			$scope: scope
		});
	}))

	describe('Method: getCardsFromAPIs()', function() {

		it('should have a function named $getCardsFromAPIs()', function() {
			expect(angular.isFunction($scope.getCardsFromAPIs)).toBe(true);
		});
	});
	describe('Method: getInitialCards()', function() {

		it('should have a function named $getInitialCards()', function() {
			expect(angular.isFunction($scope.getInitialCards)).toBe(true);
		});
	});
	describe('Method: addCardsToMixedCardCollection()', function() {

		it('should have a function named $addCardsToMixedCardCollection()', function() {
			expect(angular.isFunction($scope.addCardsToMixedCardCollection)).toBe(true);
		});
	});
	describe('Method: addFDADetails()', function() {

		it('should have a function named $addFDADetails()', function() {
			expect(angular.isFunction($scope.addFDADetails)).toBe(true);
		});

	describe('Method: shuffleCards()', function() {

		it('should have a function named $shuffleCards()', function() {
			expect(angular.isFunction($scope.shuffleCards)).toBe(true);
		});

	describe('Method: outputMixedCards()', function() {

		it('should have a function named $outputMixedCards()', function() {
			expect(angular.isFunction($scope.outputMixedCards)).toBe(true);
		});

	describe('Method: removeHTMLTags()', function() {

		it('should have a function named $removeHTMLTags()', function() {
			expect(angular.isFunction($scope.removeHTMLTags)).toBe(true);
		});
	});
	describe('Method: shortenText()', function() {

		it('should have a function named $shortenText()', function() {
			expect(angular.isFunction($scope.shortenText)).toBe(true);
		});
	});
});