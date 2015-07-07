/// <reference path="../services/cards.client.service.js" />


'use strict';

angular.module('cards').controller('CardsController', ['$scope', '$rootScope', '$stateParams', '$q', 'CardsFactory', '$location', 'UserPreferences',
	function ($scope, $rootScope, $stateParams, $q, CardsFactory, $location, UserPreferences) {
	    var currentPage = 1;
	    var nextColumnIndexToReceiveCard = 0;
        
	    if (!$rootScope.userPreferences) {
	        $rootScope.userPreferences = UserPreferences.getUserPreferences();
	    }


	    function getCardsFromAPIs(page) {
	        var apiResults = [];
	        var searchTerm = '';
	        $scope.showPreLoader = true;
	        $scope.showLoadMoreButton = false;

	        if ($rootScope.searchTermAll) {
	            searchTerm = '"' + $rootScope.searchTermAll + '"';
	            $scope.showSearchType = true;
	        }
	        else {
	            $scope.showSearchType = false;
	            for (var i = 0; i < $rootScope.userPreferences.searchTerms.length; i++) {
	                searchTerm += '"' + $rootScope.userPreferences.searchTerms[i] + '" OR '
	            }
	            searchTerm = searchTerm.substring(0, searchTerm.length - 4);
	        }
	        

	        console.log(searchTerm);

	        for (var i = 0; i < $rootScope.userPreferences.sources.length; i++) {
	            if ($rootScope.userPreferences.sources[i].chosen || $rootScope.searchTermAll) {
	                var sourceId = $rootScope.userPreferences.sources[i].id;
	                var sourceName = $rootScope.userPreferences.sources[i].name;

	                if (sourceId == 'medlinePlusConnect' && page == 1 && !$rootScope.searchTermAll) {
	                    for (var j = 0; j < $rootScope.userPreferences.searchTerms.length; j++) {
	                        apiResults.push(CardsFactory.getCardRecords(sourceId, sourceName, $rootScope.userPreferences.searchTerms[j], currentPage));
	                    }
	                }
	                else if (sourceId == 'dailyMed') {
	                    var preventEmptyResponseSearchTerm = searchTerm;
	                    preventEmptyResponseSearchTerm += ' OR "741AE689-9A31-2CAB-5A68-4BA650BE4EFB"'
	                    apiResults.push(CardsFactory.getCardRecords(sourceId, sourceName, preventEmptyResponseSearchTerm, currentPage));
	                }
					else if (sourceId == 'fda') {
						var preventEmptyResponseSearchTerm = searchTerm;
						preventEmptyResponseSearchTerm += ' OR "741AE689-9A31-2CAB-5A68-4BA650BE4EFB"'
						apiResults.push(CardsFactory.getCardRecords(sourceId, sourceName, preventEmptyResponseSearchTerm, currentPage));
					}
	                else {
	                    apiResults.push(CardsFactory.getCardRecords(sourceId, sourceName, searchTerm, page));
	                }

	            }
	        }



	        $q.all(apiResults)
                .then(function (results) {
                    var mixedCardsCollection = [];
                    var noMoreResults = false;

                    console.log('processing all results');

                    for (var i = 0; i < results.length; i++) {
                        //console.log(results[i]);
                        addCardsToMixedCardCollection(mixedCardsCollection, results[i])
                    }

                    mixedCardsCollection = shuffleCards(mixedCardsCollection);

                    for (var i = 0; i < mixedCardsCollection.length; i++) {
                        //console.log(mixedCardsCollection[i].title + '|' + mixedCardsCollection[i].sourceName);
                    }

                    outputMixedCards(mixedCardsCollection);


                })
                .catch(function (results) {
                    console.log('$q.all - processing of card APIs failed: ');
                    outputMixedCards([]);
                    if (currentPage > 1) {
                        alert("No more results found 1");
                    }
                    else {
                        alert("No results found based on your search 25656");
                    }
                })
	    }


	    function getInitialCards() {
	        if ($rootScope.columns && $rootScope.columns.length > 0) {
	            $scope.columns = $rootScope.columns;
	            $rootScope.cardsScrollPos ? $(window).scrollTop($rootScope.cardsScrollPos) : $(window).scrollTop(0);
	            $rootScope.cardsCurrentPage ? currentPage = $rootScope.cardsCurrentPage : currentPage = 1;
	            $scope.showLoadMoreButton = !$rootScope.hideLoadMoreButton;
	            if ($rootScope.searchTermAll) {
	                $scope.showSearchType = true;
	            }
	            else {
	                $scope.showSearchType = false;
	            }
	        }
	        else {
	            getCardsFromAPIs(1);
	        }
	    }


	    getInitialCards();



	    $scope.moveNext = function () {
	        currentPage++;
	        getCardsFromAPIs(currentPage);
	    };


	    $(window).on('scroll', function () {
	        if ($scope.okSaveScroll) {
	            $rootScope.cardsScrollPos = parseInt($(window).scrollTop());
	        }
	    });


	    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $scope.okSaveScroll = false;
        })

	    $scope.$on('$stateChangeSuccess', function () {
	        $scope.okSaveScroll = true;
	    });



	    function addCardsToMixedCardCollection(mixedCardsCollection, results)
	    {

	        switch (results.config.data.sourceId) {
	            case "dailyMed":
	                addDailyMedCardsToMixedCardCollection(mixedCardsCollection, results);
	                break;
				case "fda":
					addDailyMedCardsToMixedCardCollection(mixedCardsCollection, results);
					break;
	            case "medlinePlusConnect":
	                addMedlinePlusConnectCardsToMixedCardCollection(mixedCardsCollection, results);
	                break;

	            case "medlinePlusHealthTopics":
	                addMedlinePlusHealthTopicsCardsToMixedCardCollection(mixedCardsCollection, results);
	                break;

	            case "pubMed":
	                addPubMedCardsToMixedCardCollection(mixedCardsCollection, results);
	                break;

	            case "digitalCollections":
	                addDigitalCollectionsToMixedCardCollection(mixedCardsCollection, results);
	                break;

	            case "clinicalTrials":
	                addClinicalTrialsToMixedCardCollection(mixedCardsCollection, results);
	                break;
	        }
	    }


	    function addDailyMedCardsToMixedCardCollection(mixedCardsCollection, results)
	    {
	        var data = results.data;
	        var processedRecords = [];
	        var fullTitle = '';
	        var fullDescription = '';

	        for (var i = 0; i < data.results.length; i++) {
	            if (data.results[i].openfda.spl_set_id) {
	                processedRecords.push(data.results[i]);
	            }
	        }

	        for (var i = 0; i < processedRecords.length; i++) {
	            fullTitle = '';
	            fullDescription = '';

	            if (processedRecords[i].openfda.brand_name) {
	                fullTitle = processedRecords[i].openfda.brand_name.toString() + ' ';
	            }
	            if (processedRecords[i].openfda.generic_name && processedRecords[i].openfda.generic_name.toString().toLowerCase() != processedRecords[i].openfda.brand_name.toString().toLowerCase()) {
	                fullTitle += '(' + processedRecords[i].openfda.generic_name + ') ';
	            }
	            if (processedRecords[i].openfda.manufacturer_name) {
	                fullTitle += '[' + processedRecords[i].openfda.manufacturer_name.toString() + ']';
	            }

	            if (processedRecords[i].indications_and_usage && processedRecords[i].indications_and_usage.toString().toLowerCase() != 'INDICATIONS AND USAGE:') {
	                fullDescription = processedRecords[i].indications_and_usage.toString();
	            }
	            if (fullDescription.length == 0 && processedRecords[i].description) {
	                fullDescription = processedRecords[i].description.toString();
	            }

	            mixedCardsCollection.push({
	                id: processedRecords[i].openfda.spl_set_id.toString(),
	                sourceId: results.config.data.sourceId,
	                sourceName: "FDA Drugs",
	                title: fullTitle,
	                description: shortenText(fullDescription)
	            });
	        }
	    }


	    function addMedlinePlusConnectCardsToMixedCardCollection(mixedCardsCollection, results) {
	        var data = results.data;

	        for (var i = 0; i < data.feed.entry.length; i++) {

	            mixedCardsCollection.push({
	                id: data.feed.entry[i].id["_value"],
	                sourceId: results.config.data.sourceId,
	                searchTerm: results.config.data.searchTerm,
	                sourceName: results.config.data.sourceName,
	                title: removeHTMLTags(data.feed.entry[i].title["_value"]),
	                description: shortenText(removeHTMLTags(data.feed.entry[i].summary["_value"]))
	            });

	        }
	    }


	    function addMedlinePlusHealthTopicsCardsToMixedCardCollection(mixedCardsCollection, results) {
	        var data = results.data;

	        if (!data.nlmSearchResult.list) {
	            return;
	        }

	        for (var i = 0; i < data.nlmSearchResult.list[0].document.length; i++) {

	            var snippet = "";


	            for (var j = 0; j < data.nlmSearchResult.list[0].document[i].content.length; j++) {

	                if (data.nlmSearchResult.list[0].document[i].content[j]['$'].name == 'FullSummary') {
	                    snippet = data.nlmSearchResult.list[0].document[i].content[j]["_"]
	                }
	            }

	            mixedCardsCollection.push({
	                id: data.nlmSearchResult.list[0].document[i]["$"].url,
	                sourceId: results.config.data.sourceId,
	                sourceName: results.config.data.sourceName,
	                title: removeHTMLTags(data.nlmSearchResult.list[0].document[i].content[0]["_"]),
	                description: shortenText(removeHTMLTags(snippet))
	            });

	        }
	    }



	    function addPubMedCardsToMixedCardCollection(mixedCardsCollection, results) {
	        var data = results.data;

	        if (!data.eSearchResult.IdList) {
	            return;
	        }

	        for (var i = 0; i < data.eSearchResult.IdList[0].Id.length; i++) {
	            var id = data.eSearchResult.IdList[0].Id[i].toString();

	            mixedCardsCollection.push({
	                id: id,
	                sourceId: results.config.data.sourceId,
	                sourceName: results.config.data.sourceName,
                    title: '',
                    description: ''
                });

	            getPubmedDetails(id, mixedCardsCollection[mixedCardsCollection.length - 1], results);
	        }
	    }


	    function getPubmedDetails(id, collectionItem, results) {

	        CardsFactory.getDetailedCardRecord(results.config.data.sourceId, id)
                .success(function (record) {
                    var articleTitle = record.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0].ArticleTitle[0].toString();
                    var abstract = '';

                    try {
                        if (record.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0].Abstract) {
                            abstract = record.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0].Abstract[0].AbstractText[0]['_'] ? record.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0].Abstract[0].AbstractText[0]['_'].toString() : record.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0].Abstract[0].AbstractText[0].toString();
                        }
                    } catch (e) {

                    }
                    

                    collectionItem.title = articleTitle;
                    collectionItem.description = shortenText(abstract);
                    
                })
                .error(function (data, status, headers, config) {
                    console.log("an error occured getting a single pubmed record");
                });
	    }


	    function addDigitalCollectionsToMixedCardCollection(mixedCardsCollection, results) {
	        var data = results.data;

	        if (!data.nlmSearchResult.list) {
	            return;
	        }

	        for (var i = 0; i < data.nlmSearchResult.list[0].document.length; i++) {

	            var snippet = "";

	            //console.log(digitalRecords.nlmSearchResult.list[0].document[i].content[0].name);

	            for (var j = 0; j < data.nlmSearchResult.list[0].document[i].content.length; j++) {

	                if (data.nlmSearchResult.list[0].document[i].content[j]['$'].name == 'dc:description') {
	                    snippet = data.nlmSearchResult.list[0].document[i].content[j]["_"]
	                }
	                else if (data.nlmSearchResult.list[0].document[i].content[j]['$'].name == 'snippet') {
	                    snippet = data.nlmSearchResult.list[0].document[i].content[j]["_"]
	                }
	            }

	            mixedCardsCollection.push({
	                id: data.nlmSearchResult.list[0].document[i]["$"].url,
	                sourceId: results.config.data.sourceId,
	                sourceName: results.config.data.sourceName,
	                title: shortenText(removeHTMLTags(data.nlmSearchResult.list[0].document[i].content[0]["_"])),
	                description: shortenText(removeHTMLTags(snippet))
	            });
	        }
	    }


	    function addClinicalTrialsToMixedCardCollection(mixedCardsCollection, results) {
	        var data = results.data;

	        if (!data.search_results.clinical_study) {
	            return false;
	        }

	        for (var i = 0; i < data.search_results.clinical_study.length; i++) {

	            mixedCardsCollection.push({
	                id: data.search_results.clinical_study[i].nct_id[0].toString(),
	                sourceId: results.config.data.sourceId,
	                sourceName: results.config.data.sourceName,
	                title: removeHTMLTags(data.search_results.clinical_study[i].title[0].toString()),
	                description: shortenText(removeHTMLTags(data.search_results.clinical_study[i].condition_summary[0].toString())),
	            });
	        }
	    }


	    function shuffleCards(array) {
	        var currentIndex = array.length, temporaryValue, randomIndex;

	        // While there remain elements to shuffle...
	        while (0 !== currentIndex) {

	            // Pick a remaining element...
	            randomIndex = Math.floor(Math.random() * currentIndex);
	            currentIndex -= 1;

	            // And swap it with the current element.
	            temporaryValue = array[currentIndex];
	            array[currentIndex] = array[randomIndex];
	            array[randomIndex] = temporaryValue;
	        }

	        return array;
	    }


	    function outputMixedCards(mixedCardsCollection) {
	        var totalRecords = mixedCardsCollection.length;
	        var remainder = totalRecords % 3;
	        var columnSize = (totalRecords - remainder) / 3;

	        var columns = [
                            {
                                collection: [],
                            },
                            {
                                collection: [],
                            },
                            {
                                collection: [],
                            }
	        ];

	        if (!$scope.columns) {
	            $scope.columns = columns;
	        }


	        var currentColumnIndex = nextColumnIndexToReceiveCard;
	        for (var i = 0; i < totalRecords; i++) {
	            $scope.columns[currentColumnIndex].collection.push(mixedCardsCollection[i]);
	            currentColumnIndex++
	            if (currentColumnIndex == 3) {
	                currentColumnIndex = 0;
	            }
	            nextColumnIndexToReceiveCard = currentColumnIndex;
	        }

	        $scope.showPreLoader = false;
	        if (mixedCardsCollection.length > 0)
	        {
	            $scope.showLoadMoreButton = true;
	            $rootScope.hideLoadMoreButton = false;
	        }
	        else {
	            $scope.showLoadMoreButton = false;
	            $rootScope.hideLoadMoreButton = true;
	        }
	        
	        $rootScope.columns = $scope.columns;
	        $rootScope.cardsCurrentPage = currentPage;
	        console.log("current page: " + currentPage);
	        console.log("next column to received card: " + nextColumnIndexToReceiveCard);
	        console.log("" + $scope.columns[0].collection.length + "|" + +$scope.columns[1].collection.length + "|" + + $scope.columns[2].collection.length);

	    }


	    $scope.searchAll = function (term) {
	        $rootScope.columns = undefined;
	        $rootScope.searchTermAll = term;
	        $rootScope.columns = undefined;
	        $scope.columns = undefined;
	        getCardsFromAPIs(1);
	    };


	    $scope.searchBasedOnPreferences = function myfunction() {
	        $scope.searchAllTerm = "";
	        $rootScope.columns = undefined;
	        $rootScope.searchTermAll = undefined;
	        $scope.columns = undefined;
	        currentPage = 1;
	        getCardsFromAPIs(1);
	    }


	    function removeHTMLTags(s) {
	        var rex = /(<([^>]+)>)/ig;

	        return s.replace(rex, "");
	    }


	    function shortenText(s) {
	        if(s.length > 300)
	        {
	            s = s.substring(0, 300) + '...';
	        }
            
	        return s;
	    }



	    $(document).ready(function () {

	        $(".search-reset").hide();
	        $(".search-input").keyup(function () {
	            if ($(this).val().length != 0) {
	                $(".search-reset").show();
	            } else {
	                $(".search-reset").hide();
	            }
	        });
	        $('.search-input').keydown(function (e) {
	            if (e.keyCode == 27) {
	                $(this).val("");
	                $(".search-reset").hide();
	            }
	            if (e.keyCode == 13) {
	                var searchInput = $('.search-input').val();
	                if (searchInput != '')
	                    $(".search_submit").trigger("click")
	            }
	        });


	        $(".search-reset").click(function (event) {
	            $(".search-reset").hide();
	            $(".search-input").val("");
	        });
	        $(document.body).on('click', '.dropdown-menu li', function (event) {
	            var $target = $(event.currentTarget);

	            $target.closest('.btn-group')
                   .find('[data-bind="label"]').text($target.text())
                      .end()
                   .children('.dropdown-toggle').dropdown('toggle');

	            return false;

	        });
	    });



	}
]);