/// <reference path="../services/cards.client.service.js" />


'use strict';

angular.module('cards').controller('DailyCardsController', ['$scope', '$stateParams', 'CardsFactory',
	function ($scope, $stateParams, CardsFactory) {

	    //var searchTerm = $stateParams.searchTerm;

	    $scope.doSearch = function (searchTerm) {
	        getSearchResults(searchTerm);
	    };
        
	    function getSearchResults(searchTerm) {
	        CardsFactory.getDailyMedRecords(searchTerm)
                .success(function (dailyMedRecords) {


                    var processedRecords = [];

                    for (var i = 0; i < dailyMedRecords.results.length; i++) {

                        if (dailyMedRecords.results[i].openfda.spl_set_id) {
                            processedRecords.push(dailyMedRecords.results[i]);
                        }
                    }


                    var totalRecords = processedRecords.length;
                    var remainder = totalRecords % 3;
                    var columnSize = (totalRecords - remainder) / 3;
                    //console.log(remainder > 0 ? 'true' : 'false');

                    var columns = [
                                    {
                                        collection: [],
                                        size: remainder > 0 ? columnSize + 1 : columnSize
                                    },
                                    {
                                        collection: [],
                                        size: remainder > 1 ? columnSize + 1 : columnSize
                                    },
	                                {
	                                    collection: [],
	                                    size: columnSize
                                    }
                                  ];

                    var columnIndex = 0;
                    var currentSize = 0;
                    var fullTitle = '';
                    var fullDescription = '';

                    for (var i = 0; i < processedRecords.length; i++) {
                        fullTitle = '';
                        fullDescription = '';

                        //console.log(processedRecords[i].openfda.generic_name.toString().toLowerCase());

                        //var setId = dailyMedRecords.data[i].setid.toString();

                        if (processedRecords[i].openfda.brand_name)
                        {
                            fullTitle = processedRecords[i].openfda.brand_name.toString() + ' ';
                        }
                        if (processedRecords[i].openfda.generic_name && processedRecords[i].openfda.generic_name.toString().toLowerCase() != processedRecords[i].openfda.brand_name.toString().toLowerCase())
                        {
                            fullTitle += '(' + processedRecords[i].openfda.generic_name + ') ';
                        }
                        if (processedRecords[i].openfda.manufacturer_name)
                        {
                            fullTitle += '[' + processedRecords[i].openfda.manufacturer_name.toString() + ']';
                        }

                        if (processedRecords[i].indications_and_usage && processedRecords[i].indications_and_usage.toString().toLowerCase() != 'INDICATIONS AND USAGE:')
                        {
                            fullDescription = processedRecords[i].indications_and_usage.toString();
                        }
                        if (fullDescription.length == 0 && processedRecords[i].description)
                        {
                            fullDescription = processedRecords[i].description.toString();
                        }

                        columns[columnIndex].collection.push({
                            id: processedRecords[i].openfda.spl_set_id,
                            title: fullTitle,
                            description: fullDescription.substring(0, 300) + '...'
                        });

                        if (currentSize == (columns[columnIndex].size - 1)) {
                            columnIndex++;
                            currentSize = 0;
                        }
                        else
                        {
                            currentSize++;
                        }
                    }

                    $scope.columns = columns;

                    console.log("success getting daily med records");

                    
                })
                .error(function (data, status, headers, config) {
                    console.log("an error occured getting daily med records");
                });

	    }

	    //init();

	    function getDailyMedParagraph(setId, collectionItem)
	    {
	        var p;

	        CardsFactory.getDailyMedRecord(setId)
                .success(function (dailyMedRecord) {

                    var component = dailyMedRecord.document.component[0].structuredBody[0].component;

                    for (var i = 0; i < component.length; i++) {
                        if (component[i].section[0].code[0].$.code == '34067-9') {
                            var description = '';

                            try {
                                if (component[i].section[0].text[0].paragraph.length != undefined)
                                {
                                    for (var j = 0; j < component[i].section[0].text[0].paragraph.length; j++) {
                                        if (typeof(component[i].section[0].text[0].paragraph[j]) != 'string')
                                        {
                                            break;
                                        }
                                        else if (j == 0) {
                                            description += component[i].section[0].text[0].paragraph[j].replace('■', '');
                                        }
                                        else {
                                            description += component[i].section[0].text[0].paragraph[j].replace('■', ';');
                                        }

                                    }
                                }
                                
                                

                                collectionItem.description = description;

                                
                                //Object.getOwnPropertyNames(component[i].section[0]).forEach(function (val, idx, array) {
                                //    console.log(component[i].section[0][val]);
                                //});
                            }
                            catch (err) {
                                console.log("error on " + collectionItem.id + '|' + component[i].section[0].code[0].$.code + '|');

                                //console.log('Error ' + err);
                            }
                        }
                    }

                })
                .error(function (data, status, headers, config) {
                    console.log("an error occured getting a single daily med record");
                });
	    }


	    function extractAllStringsFromJsonObject(jObject)
	    {
            
	    }


	}
]);