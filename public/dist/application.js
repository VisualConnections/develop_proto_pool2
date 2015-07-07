'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'FBOpen';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ngCookies',
        'ngAnimate',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'ui.utils'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
      // Create angular module
      angular.module(moduleName, dependencies || []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('cards');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';
// Configuring the Articles module
angular.module('articles').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Articles', 'articles', 'dropdown', '/articles(/create)?');
    Menus.addSubMenuItem('topbar', 'articles', 'List Articles', 'articles');
    Menus.addSubMenuItem('topbar', 'articles', 'New Article', 'articles/create');
  }
]);'use strict';
// Setting up route
angular.module('articles').config([
  '$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider.state('listArticles', {
      url: '/articles',
      templateUrl: 'modules/articles/views/list-articles.client.view.html'
    }).state('createArticle', {
      url: '/articles/create',
      templateUrl: 'modules/articles/views/create-article.client.view.html'
    }).state('viewArticle', {
      url: '/articles/:articleId',
      templateUrl: 'modules/articles/views/view-article.client.view.html'
    }).state('editArticle', {
      url: '/articles/:articleId/edit',
      templateUrl: 'modules/articles/views/edit-article.client.view.html'
    });
  }
]);/// <reference path="~/public/lib/angular/angular.js" />
'use strict';
angular.module('articles').controller('ArticlesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Articles',
  function ($scope, $stateParams, $location, Authentication, Articles) {
    $scope.authentication = Authentication;
    $scope.create = function () {
      var article = new Articles({
          title: this.title,
          content: this.content
        });
      article.$save(function (response) {
        $location.path('articles/' + response._id);
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.remove = function (article) {
      if (article) {
        article.$remove();
        for (var i in $scope.articles) {
          if ($scope.articles[i] === article) {
            $scope.articles.splice(i, 1);
          }
        }
      } else {
        $scope.article.$remove(function () {
          $location.path('articles');
        });
      }
    };
    $scope.update = function () {
      var article = $scope.article;
      article.$update(function () {
        $location.path('articles/' + article._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.find = function () {
      $scope.articles = Articles.query();
    };
    $scope.findOne = function () {
      $scope.article = Articles.get({ articleId: $stateParams.articleId });
    };
  }
]);'use strict';
//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', [
  '$resource',
  function ($resource) {
    return $resource('articles/:articleId', { articleId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
angular.module('cards', ['users']);'use strict';
//Setting up route
angular.module('cards').config([
  '$stateProvider',
  function ($stateProvider) {
    // Cards state routing
    $stateProvider.state('mainCards', {
      url: '/cards?searchTermAll',
      templateUrl: 'modules/cards/views/cards.client.view.html'
    }).state('detailedCard', {
      url: '/cards/detail?sourceId&recordId&searchTerm',
      templateUrl: 'modules/cards/views/detailed.card.client.view.html'
    }).state('dailyMedCards', {
      url: '/cards/daily/:searchTerm',
      templateUrl: 'modules/cards/views/daily.cards.client.view.html'
    });
  }
]);/// <reference path="../services/cards.client.service.js" />
'use strict';
angular.module('cards').controller('CardsController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  '$q',
  'CardsFactory',
  '$location',
  'UserPreferences',
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
      } else {
        $scope.showSearchType = false;
        for (var i = 0; i < $rootScope.userPreferences.searchTerms.length; i++) {
          searchTerm += '"' + $rootScope.userPreferences.searchTerms[i] + '" OR ';
        }
        searchTerm = searchTerm.substring(0, searchTerm.length - 4);
      }
      console.log(searchTerm);
      for (var i = 0; i < $rootScope.userPreferences.sources.length; i++) {
        if ($rootScope.userPreferences.sources[i].chosen || $rootScope.searchTermAll) {
          console.log(sourceId);
          var sourceId = $rootScope.userPreferences.sources[i].id;
          var sourceName = $rootScope.userPreferences.sources[i].name;
          if (sourceId == 'medlinePlusConnect' && page == 1 && !$rootScope.searchTermAll) {
            for (var j = 0; j < $rootScope.userPreferences.searchTerms.length; j++) {
              apiResults.push(CardsFactory.getCardRecords(sourceId, sourceName, $rootScope.userPreferences.searchTerms[j], currentPage));
            }
          } else if (sourceId == 'dailyMed') {
            var preventEmptyResponseSearchTerm = searchTerm;
            preventEmptyResponseSearchTerm += ' OR "741AE689-9A31-2CAB-5A68-4BA650BE4EFB"';
            apiResults.push(CardsFactory.getCardRecords(sourceId, sourceName, preventEmptyResponseSearchTerm, currentPage));
          } else if (sourceId == 'fda') {
            var preventEmptyResponseSearchTerm = searchTerm;
            preventEmptyResponseSearchTerm += ' OR "741AE689-9A31-2CAB-5A68-4BA650BE4EFB"';
            apiResults.push(CardsFactory.getCardRecords(sourceId, sourceName, preventEmptyResponseSearchTerm, currentPage));
          }
          else {
            apiResults.push(CardsFactory.getCardRecords(sourceId, sourceName, searchTerm, page));
          }
        }
      }
      $q.all(apiResults).then(function (results) {
        var mixedCardsCollection = [];
        var noMoreResults = false;
        console.log('processing all results');
        for (var i = 0; i < results.length; i++) {
          console.log(results[i]);
          addCardsToMixedCardCollection(mixedCardsCollection, results[i]);
        }
        mixedCardsCollection = shuffleCards(mixedCardsCollection);
        for (var i = 0; i < mixedCardsCollection.length; i++) {
        }
        outputMixedCards(mixedCardsCollection);
      }).catch(function (results) {
        console.log('$q.all - processing of card APIs failed: ');
        outputMixedCards([]);
        if (currentPage > 1) {
          alert('No more results found');
        } else
        {
          alert('No results found based on your search 3');
        }
      });
    }
    function getInitialCards() {
      if ($rootScope.columns && $rootScope.columns.length > 0) {
        $scope.columns = $rootScope.columns;
        $rootScope.cardsScrollPos ? $(window).scrollTop($rootScope.cardsScrollPos) : $(window).scrollTop(0);
        $rootScope.cardsCurrentPage ? currentPage = $rootScope.cardsCurrentPage : currentPage = 1;
        $scope.showLoadMoreButton = !$rootScope.hideLoadMoreButton;
        if ($rootScope.searchTermAll) {
          $scope.showSearchType = true;
        } else {
          $scope.showSearchType = false;
        }
      } else {
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
    });
    $scope.$on('$stateChangeSuccess', function () {
      $scope.okSaveScroll = true;
    });
    function addCardsToMixedCardCollection(mixedCardsCollection, results) {
      switch (results.config.data.sourceId) {
      case 'dailyMed':
        addDailyMedCardsToMixedCardCollection(mixedCardsCollection, results);
        break;
        case 'fda':
          addDailyMedCardsToMixedCardCollection(mixedCardsCollection, results);
          break;
      }
    }
    function addDailyMedCardsToMixedCardCollection(mixedCardsCollection, results) {
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
          sourceName: results.config.data.sourceName,
          title: fullTitle,
          description: shortenText(fullDescription)
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
          { collection: [] },
          { collection: [] },
          { collection: [] }
        ];
      if (!$scope.columns) {
        $scope.columns = columns;
      }
      var currentColumnIndex = nextColumnIndexToReceiveCard;
      for (var i = 0; i < totalRecords; i++) {
        $scope.columns[currentColumnIndex].collection.push(mixedCardsCollection[i]);
        currentColumnIndex++;
        if (currentColumnIndex == 3) {
          currentColumnIndex = 0;
        }
        nextColumnIndexToReceiveCard = currentColumnIndex;
      }
      $scope.showPreLoader = false;
      if (mixedCardsCollection.length > 0) {
        $scope.showLoadMoreButton = true;
        $rootScope.hideLoadMoreButton = false;
      } else {
        $scope.showLoadMoreButton = false;
        $rootScope.hideLoadMoreButton = true;
      }
      $rootScope.columns = $scope.columns;
      $rootScope.cardsCurrentPage = currentPage;
      console.log('current page: ' + currentPage);
      console.log('next column to received card: ' + nextColumnIndexToReceiveCard);
      console.log('' + $scope.columns[0].collection.length + '|' + +$scope.columns[1].collection.length + '|' + +$scope.columns[2].collection.length);
    }
    $scope.searchAll = function (term) {
      $rootScope.columns = undefined;
      $rootScope.searchTermAll = term;
      $rootScope.columns = undefined;
      $scope.columns = undefined;
      getCardsFromAPIs(1);
    };
    $scope.searchBasedOnPreferences = function myfunction() {
      $scope.searchAllTerm = '';
      $rootScope.columns = undefined;
      $rootScope.searchTermAll = undefined;
      $scope.columns = undefined;
      currentPage = 1;
      getCardsFromAPIs(1);
    };
    function removeHTMLTags(s) {
      var rex = /(<([^>]+)>)/gi;
      return s.replace(rex, '');
    }
    function shortenText(s) {
      if (s.length > 300) {
        s = s.substring(0, 300) + '...';
      }
      return s;
    }
    $(document).ready(function () {
      $('.search-reset').hide();
      $('.search-input').keyup(function () {
        if ($(this).val().length != 0) {
          $('.search-reset').show();
        } else {
          $('.search-reset').hide();
        }
      });
      $('.search-input').keydown(function (e) {
        if (e.keyCode == 27) {
          $(this).val('');
          $('.search-reset').hide();
        }
        if (e.keyCode == 13) {
          var searchInput = $('.search-input').val();
          if (searchInput != '')
            $('.search_submit').trigger('click');
        }
      });
      $('.search-reset').click(function (event) {
        $('.search-reset').hide();
        $('.search-input').val('');
      });
      $(document.body).on('click', '.dropdown-menu li', function (event) {
        var $target = $(event.currentTarget);
        $target.closest('.btn-group').find('[data-bind="label"]').text($target.text()).end().children('.dropdown-toggle').dropdown('toggle');
        return false;
      });
    });
  }
]);/// <reference path="../services/cards.client.service.js" />
'use strict';
angular.module('cards').controller('DailyCardsController', [
  '$scope',
  '$stateParams',
  'CardsFactory',
  function ($scope, $stateParams, CardsFactory) {
    //var searchTerm = $stateParams.searchTerm;
    $scope.doSearch = function (searchTerm) {
      getSearchResults(searchTerm);
    };
    function getSearchResults(searchTerm) {
      CardsFactory.getDailyMedRecords(searchTerm).success(function (dailyMedRecords) {
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
          columns[columnIndex].collection.push({
            id: processedRecords[i].openfda.spl_set_id,
            title: fullTitle,
            description: fullDescription.substring(0, 300) + '...'
          });
          if (currentSize == columns[columnIndex].size - 1) {
            columnIndex++;
            currentSize = 0;
          } else {
            currentSize++;
          }
        }
        $scope.columns = columns;
        console.log('success getting daily med records');
      }).error(function (data, status, headers, config) {
        console.log('an error occured getting daily med records');
      });
    }
    //init();
    function getDailyMedParagraph(setId, collectionItem) {
      var p;
      CardsFactory.getDailyMedRecord(setId).success(function (dailyMedRecord) {
        var component = dailyMedRecord.document.component[0].structuredBody[0].component;
        for (var i = 0; i < component.length; i++) {
          if (component[i].section[0].code[0].$.code == '34067-9') {
            var description = '';
            try {
              if (component[i].section[0].text[0].paragraph.length != undefined) {
                for (var j = 0; j < component[i].section[0].text[0].paragraph.length; j++) {
                  if (typeof component[i].section[0].text[0].paragraph[j] != 'string') {
                    break;
                  } else if (j == 0) {
                    description += component[i].section[0].text[0].paragraph[j].replace('\u25a0', '');
                  } else {
                    description += component[i].section[0].text[0].paragraph[j].replace('\u25a0', ';');
                  }
                }
              }
              collectionItem.description = description;  //Object.getOwnPropertyNames(component[i].section[0]).forEach(function (val, idx, array) {
                                                         //    console.log(component[i].section[0][val]);
                                                         //});
            } catch (err) {
              console.log('error on ' + collectionItem.id + '|' + component[i].section[0].code[0].$.code + '|');  //console.log('Error ' + err);
            }
          }
        }
      }).error(function (data, status, headers, config) {
        console.log('an error occured getting a single daily med record');
      });
    }
    function extractAllStringsFromJsonObject(jObject) {
    }
  }
]);/// <reference path="../services/cards.client.service.js" />
'use strict';
angular.module('cards').controller('DetailedCardController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  'CardsFactory',
  function ($scope, $rootScope, $stateParams, CardsFactory) {
    var detailedRecordData = [];
    function getDetailedCard() {
      $(window).scrollTop(0);
      getSourceName();
      var singleRecordApiParam = $stateParams.recordId;
      if ($stateParams.sourceId == 'medlinePlusConnect') {
        singleRecordApiParam = $stateParams.searchTerm;
      }
      $scope.showPreLoader = true;
      CardsFactory.getDetailedCardRecord($stateParams.sourceId, singleRecordApiParam).success(function (data) {
        switch ($stateParams.sourceId) {
        case 'dailyMed':
          fillInDailyMedCard(data.results[0]);
          break;
          case 'fda':
            fillInDailyMedCard(data.results[0]);
            break;
        case 'medlinePlusConnect':
          fillInMedlinePlusConnectCard(data.feed.entry);
          break;
        case 'medlinePlusHealthTopics':
          fillInMedlinePlusHealthTopicsCard(data.nlmSearchResult.list[0].document[0].content[0]['health-topic'][0]);
          break;
        case 'pubMed':
          fillInPubMedCard(data.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0], data.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].DateCreated[0]);
          break;
        case 'digitalCollections':
          fillInDigitalCollectionsCard(data.nlmSearchResult.list[0].document[0].content);
          break;
        case 'clinicalTrials':
          fillInClinicalTrialsCard(data.clinical_study);
          break;
        }
        $scope.detailedRecordData = detailedRecordData;
        $scope.showDetailedCardContainer = true;
        $scope.showPreLoader = false;
        console.log('success getting a detailed record');
      }).error(function (data, status, headers, config) {
        console.log('an error occured getting a detailed record');
      });
    }
    getDetailedCard();
    function getSourceName() {
      for (var i = 0; i < $rootScope.userPreferences.sources.length; i++) {
        if ($rootScope.userPreferences.sources[i].id == $stateParams.sourceId) {
          $scope.sourceName = $rootScope.userPreferences.sources[i].name;
          console.log('source name is here ' + $rootScope.userPreferences.sources[i].name);
        }
      }
    }
    function fillInDailyMedCard(record) {
      var fullTitle = '';
      if (record.openfda.brand_name) {
        fullTitle = record.openfda.brand_name.toString() + ' ';
      }
      if (record.openfda.generic_name && record.openfda.generic_name.toString().toLowerCase() != record.openfda.brand_name.toString().toLowerCase()) {
        fullTitle += '(' + record.openfda.generic_name + ') ';
      }
      if (record.openfda.manufacturer_name) {
        fullTitle += '[' + record.openfda.manufacturer_name.toString() + ']';
      }
      detailedRecordData = [{
          name: 'Title',
          value: fullTitle,
          mainDisplay: false
        }];
      if (record.information_for_patients) {
        detailedRecordData.push({
          name: 'Information for Patients',
          value: record.information_for_patients,
          mainDisplay: true
        });
      }
      //if (record.dosage_and_administration_table) {
      //    detailedRecordData.push({
      //        name: "Dosage",
      //        value: record.dosage_and_administration_table,
      //        mainDisplay: true
      //    });
      //}
      if (record.indications_and_usage) {
        detailedRecordData.push({
          name: 'Indications and Usage',
          value: record.indications_and_usage,
          mainDisplay: true
        });
      }
      if (record.contraindications) {
        detailedRecordData.push({
          name: 'Contraindications',
          value: record.contraindications,
          mainDisplay: true
        });
      }
      if (record.how_supplied) {
        detailedRecordData.push({
          name: 'How Supplied',
          value: record.how_supplied,
          mainDisplay: true
        });
      }
      if (record.pharmacokinetics) {
        detailedRecordData.push({
          name: 'Pharmacokinetics',
          value: record.pharmacokinetics,
          mainDisplay: true
        });
      }
      if (record.dosage_and_administration) {
        detailedRecordData.push({
          name: 'Dosage and Administration',
          value: record.dosage_and_administration,
          mainDisplay: true
        });
      }
      if (record.storage_and_handling) {
        detailedRecordData.push({
          name: 'Storage and Handling',
          value: record.storage_and_handling,
          mainDisplay: true
        });
      }
      if (record.description) {
        detailedRecordData.push({
          name: 'Description',
          value: record.description,
          mainDisplay: true
        });
      }
      if (record.warnings_and_cautions) {
        detailedRecordData.push({
          name: 'Warnings and Cautions',
          value: record.warnings_and_cautions,
          mainDisplay: true
        });
      }
      if (record.pediatric_use) {
        detailedRecordData.push({
          name: 'Pediatric Use',
          value: record.pediatric_use,
          mainDisplay: true
        });
      }
      if (record.recent_major_changes) {
        detailedRecordData.push({
          name: 'Recent Major Changes',
          value: record.recent_major_changes,
          mainDisplay: true
        });
      }
      if (record.geriatric_use) {
        detailedRecordData.push({
          name: 'Geriatric Use',
          value: record.geriatric_use,
          mainDisplay: true
        });
      }
      if (record.adverse_reactions) {
        detailedRecordData.push({
          name: 'Adverse Reactions',
          value: record.adverse_reactions,
          mainDisplay: true
        });
      }
      if (record.overdosage) {
        detailedRecordData.push({
          name: 'Overdosage',
          value: record.overdosage,
          mainDisplay: true
        });
      }
      if (record.drug_interactions) {
        detailedRecordData.push({
          name: 'Drug Interactions',
          value: record.drug_interactions,
          mainDisplay: true
        });
      }
      if (record.nonclinical_toxicology) {
        detailedRecordData.push({
          name: 'Nonclinical Toxicology',
          value: record.nonclinical_toxicology,
          mainDisplay: true
        });
      }
      if (record.use_in_specific_populations) {
        detailedRecordData.push({
          name: 'Use in Specific Populations',
          value: record.use_in_specific_populations,
          mainDisplay: true
        });
      }
      if (record.use_in_specific_populations) {
        detailedRecordData.push({
          name: 'Use in Specific Populations',
          value: record.use_in_specific_populations,
          mainDisplay: true
        });
      }
      if (record.clinical_studies) {
        detailedRecordData.push({
          name: 'Clinical Studies',
          value: record.clinical_studies,
          mainDisplay: true
        });
      }
      detailedRecordData.push({
        name: 'Resource URL',
        value: formatURL('http://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=' + $stateParams.recordId),
        mainDisplay: true
      });
    }
    function fillInMedlinePlusConnectCard(records) {
      var record;
      for (var i = 0; i < records.length; i++) {
        if (records[i].id['_value'] == $stateParams.recordId) {
          record = records[i];
        }
      }
      detailedRecordData = [{
          name: 'Title',
          value: record.title['_value'],
          mainDisplay: false
        }];
      if (record.link) {
        detailedRecordData.push({
          name: 'URL',
          value: formatURL(record.link[0].href),
          mainDisplay: true
        });
      }
      if (record.summary) {
        detailedRecordData.push({
          name: 'Summary',
          value: record.summary['_value'],
          mainDisplay: true
        });
      }
    }
    function fillInMedlinePlusHealthTopicsCard(record) {
      console.log(record);
      detailedRecordData = [{
          name: 'Title',
          value: record['$']['title'],
          mainDisplay: false
        }];
      if (record['full-summary']) {
        detailedRecordData.push({
          name: 'Summary',
          value: record['full-summary'][0],
          mainDisplay: true
        });
      }
      if (record['also-called']) {
        var alsoCalled = '';
        for (var i = 0; i < record['also-called'].length; i++) {
          alsoCalled += record['also-called'][i] + ', ';
        }
        alsoCalled = alsoCalled.substring(0, alsoCalled.length - 2);
        detailedRecordData.push({
          name: 'Also Called',
          value: alsoCalled,
          mainDisplay: true
        });
      }
      if (record['primary-institute']) {
        detailedRecordData.push({
          name: 'Primary Institute',
          value: record['primary-institute'][0]['_'],
          mainDisplay: true
        });
      }
      if (record['site']) {
        var websites = '';
        for (var i = 0; i < record['site'].length; i++) {
          websites += '<a target="blank" href="' + record['site'][i]['$']['url'] + '">' + record['site'][i]['$']['title'] + '</a><br />';
        }
        //alsoCalled = alsoCalled.substring(0, alsoCalled.length - 2);
        detailedRecordData.push({
          name: 'Related Websites',
          value: websites,
          mainDisplay: true
        });
      }
      detailedRecordData.push({
        name: 'Resource URL',
        value: formatURL($stateParams.recordId),
        mainDisplay: true
      });
    }
    function fillInPubMedCard(record, recordDate) {
      console.log(record);
      detailedRecordData = [{
          name: 'Title',
          value: record.ArticleTitle[0],
          mainDisplay: false
        }];
      if (recordDate) {
        try {
          var dateCreated = recordDate.Month[0].toString() + '/' + recordDate.Day[0].toString() + '/' + recordDate.Year[0].toString();
          detailedRecordData.push({
            name: 'Date Created',
            value: dateCreated,
            mainDisplay: true
          });
        } catch (err) {
        }
      }
      if (record.Journal) {
        try {
          var pubDate = record.Journal[0].JournalIssue[0].PubDate[0].Month[0].toString() + ' ' + record.Journal[0].JournalIssue[0].PubDate[0].Day[0].toString() + ', ' + record.Journal[0].JournalIssue[0].PubDate[0].Year[0].toString();
          detailedRecordData.push({
            name: 'Journal',
            value: record.Journal[0].Title[0] + ', Volume ' + record.Journal[0].JournalIssue[0].Volume[0] + ' Issue ' + record.Journal[0].JournalIssue[0].Issue[0] + ', Published on ' + pubDate,
            mainDisplay: true
          });
        } catch (err) {
        }
      }
      if (record.Abstract) {
        detailedRecordData.push({
          name: 'Abstract',
          value: record.Abstract[0].AbstractText[0]['_'] ? record.Abstract[0].AbstractText[0]['_'].toString() : record.Abstract[0].AbstractText[0].toString(),
          mainDisplay: true
        });
      }
      if (record.AuthorList && record.AuthorList[0].Author) {
        console.log(record.AuthorList);
        try {
          var authors = '';
          for (var i = 0; i < record.AuthorList[0].Author.length; i++) {
            authors += record.AuthorList[0].Author[i].LastName + ', ' + record.AuthorList[0].Author[i].ForeName + ' ' + record.AuthorList[0].Author[i].Initials;
            if (record.AuthorList[0].Author[i].Affiliation) {
              authors += '<br /> ' + record.AuthorList[0].Author[i].Affiliation[0];
            }
            authors += '<br /><br />';
          }
          //alsoCalled = alsoCalled.substring(0, alsoCalled.length - 2);
          detailedRecordData.push({
            name: 'Author(s)',
            value: authors,
            mainDisplay: true
          });
        } catch (e) {
        }
      }
      detailedRecordData.push({
        name: 'Resource URL',
        value: formatURL('http://www.ncbi.nlm.nih.gov/pubmed/' + $stateParams.recordId),
        mainDisplay: true
      });
    }
    function fillInDigitalCollectionsCard(record) {
      console.log(record);
      detailedRecordData = [{
          name: 'Title',
          value: record[0]['_'],
          mainDisplay: false
        }];
      var authors = '';
      var pubDate = '';
      var publisher = '';
      var format = '';
      var subject = '';
      var description = '';
      try {
        for (var i = 0; i < record.length; i++) {
          if (record[i]['$'].name == 'dc:creator') {
            authors += record[i]['_'] + '<br />';
          }
          if (record[i]['$'].name == 'dc:date') {
            pubDate += record[i]['_'] + '<br />';
          }
          if (record[i]['$'].name == 'dc:publisher') {
            publisher += record[i]['_'] + '<br />';
          }
          if (record[i]['$'].name == 'dc:format') {
            format += record[i]['_'] + '<br />';
          }
          if (record[i]['$'].name == 'dc:subject') {
            subject += record[i]['_'] + '<br />';
          }
          if (record[i]['$'].name == 'dc:description') {
            description += record[i]['_'] + '<p></p>';
          }
        }
      } catch (e) {
      }
      if (authors.length > 0) {
        detailedRecordData.push({
          name: 'Author(s)',
          value: authors,
          mainDisplay: true
        });
      }
      if (pubDate.length > 0) {
        detailedRecordData.push({
          name: 'Publication Date',
          value: pubDate,
          mainDisplay: true
        });
      }
      if (publisher.length > 0) {
        detailedRecordData.push({
          name: 'Publisher',
          value: publisher,
          mainDisplay: true
        });
      }
      if (format.length > 0) {
        detailedRecordData.push({
          name: 'Format',
          value: format,
          mainDisplay: true
        });
      }
      if (subject.length > 0) {
        detailedRecordData.push({
          name: 'Subject(s)',
          value: subject,
          mainDisplay: true
        });
      }
      if (description.length > 0) {
        detailedRecordData.push({
          name: 'Description)',
          value: description,
          mainDisplay: true
        });
      }
      detailedRecordData.push({
        name: 'Resource URL',
        value: formatURL($stateParams.recordId),
        mainDisplay: true
      });
    }
    function fillInClinicalTrialsCard(record) {
      console.log(record);
      detailedRecordData = [{
          name: 'Title',
          value: record.brief_title[0],
          mainDisplay: false
        }];
      if (record.official_title) {
        detailedRecordData.push({
          name: 'Official Title',
          value: record.official_title[0],
          mainDisplay: true
        });
      }
      if (record.overall_status) {
        detailedRecordData.push({
          name: 'Status',
          value: record.overall_status[0],
          mainDisplay: true
        });
      }
      if (record.condition) {
        detailedRecordData.push({
          name: 'Condition',
          value: record.condition[0],
          mainDisplay: true
        });
      }
      if (record.sponsors) {
        try {
          var sponsors = '';
          if (record.sponsors[0].lead_sponsor) {
            sponsors += record.sponsors[0].lead_sponsor[0].agency[0] + '<br />';
          }
          if (record.sponsors[0].collaborator) {
            for (var i = 0; i < record.sponsors[0].collaborator.length; i++) {
              sponsors += record.sponsors[0].collaborator[i].agency[0] + '<br />';
            }
          }
          detailedRecordData.push({
            name: 'Sponsor(s)',
            value: sponsors,
            mainDisplay: true
          });
        } catch (e) {
        }
      }
      if (record.firstreceived_date) {
        detailedRecordData.push({
          name: 'First Received Date',
          value: record.firstreceived_date[0],
          mainDisplay: true
        });
      }
      if (record.lastchanged_date) {
        detailedRecordData.push({
          name: 'Last Updated Date',
          value: record.lastchanged_date[0],
          mainDisplay: true
        });
      }
      if (record.start_date) {
        detailedRecordData.push({
          name: 'Start Date',
          value: record.start_date[0],
          mainDisplay: true
        });
      }
      if (record.primary_completion_date) {
        detailedRecordData.push({
          name: 'Primary Completion Date',
          value: record.primary_completion_date[0]['_'],
          mainDisplay: true
        });
      }
      if (record.brief_summary) {
        detailedRecordData.push({
          name: 'Brief Summary',
          value: record.brief_summary[0].textblock[0],
          mainDisplay: true
        });
      }
      if (record.detailed_description) {
        detailedRecordData.push({
          name: 'Detailed Description',
          value: record.detailed_description[0].textblock[0],
          mainDisplay: true
        });
      }
      if (record.eligibility && record.eligibility[0].criteria) {
        detailedRecordData.push({
          name: 'Eligibility Criteria',
          value: record.eligibility[0].criteria[0].textblock[0],
          mainDisplay: true
        });
      }
      detailedRecordData.push({
        name: 'Resource URL',
        value: formatURL('http://clinicaltrials.gov/ct2/show/' + $stateParams.recordId),
        mainDisplay: true
      });
    }
    function formatURL(url) {
      return '<a class="field_link" target="_blank" href=' + url + '>' + url + '</a>';
    }
  }
]);/// <reference path="../services/cards.client.service.js" />
'use strict';
angular.module('cards').controller('DigitalCardsController', [
  '$scope',
  '$stateParams',
  'CardsFactory',
  function ($scope, $stateParams, CardsFactory) {
    //var searchTerm = $stateParams.searchTerm;
    $scope.doSearch = function (searchTerm) {
      getSearchResults(searchTerm);
    };
    function getSearchResults(searchTerm) {
      CardsFactory.getDigitalCollectionRecords(searchTerm).success(function (digitalRecords) {
        var totalRecords = digitalRecords.nlmSearchResult.list[0].document.length;
        var remainder = totalRecords % 3;
        var columnSize = (totalRecords - remainder) / 3;
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
        for (var i = 0; i < digitalRecords.nlmSearchResult.list[0].document.length; i++) {
          var snippet = '';
          //console.log(digitalRecords.nlmSearchResult.list[0].document[i].content[0].name);
          for (var j = 0; j < digitalRecords.nlmSearchResult.list[0].document[i].content.length; j++) {
            if (digitalRecords.nlmSearchResult.list[0].document[i].content[j]['$'].name == 'dc:description') {
              snippet = digitalRecords.nlmSearchResult.list[0].document[i].content[j]['_'];
            } else if (digitalRecords.nlmSearchResult.list[0].document[i].content[j]['$'].name == 'snippet') {
              snippet = digitalRecords.nlmSearchResult.list[0].document[i].content[j]['_'];
            }
          }
          columns[columnIndex].collection.push({
            title: removeHTMLTags(digitalRecords.nlmSearchResult.list[0].document[i].content[0]['_']),
            description: removeHTMLTags(snippet)
          });
          if (currentSize == columns[columnIndex].size - 1) {
            columnIndex++;
            currentSize = 0;
          } else {
            currentSize++;
          }
        }
        $scope.columns = columns;
        console.log('success getting digital collection records');
      }).error(function (data, status, headers, config) {
        console.log('an error occured getting digital collection');
      });
    }
    //init();
    function removeHTMLTags(s) {
      var rex = /(<([^>]+)>)/gi;
      return s.replace(rex, '');
    }
  }
]);/// <reference path="../services/cards.client.service.js" />
'use strict';
angular.module('cards').controller('MedPlusCardsController', [
  '$scope',
  '$stateParams',
  'CardsFactory',
  function ($scope, $stateParams, CardsFactory) {
    //var searchTerm = $stateParams.searchTerm;
    $scope.doSearch = function (searchTerm) {
      getSearchResults(searchTerm);
    };
    function getSearchResults(searchTerm) {
      CardsFactory.getMedPlusRecords(searchTerm).success(function (digitalRecords) {
        var totalRecords = digitalRecords.nlmSearchResult.list[0].document.length;
        var remainder = totalRecords % 3;
        var columnSize = (totalRecords - remainder) / 3;
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
        for (var i = 0; i < digitalRecords.nlmSearchResult.list[0].document.length; i++) {
          var snippet = '';
          //console.log(digitalRecords.nlmSearchResult.list[0].document[i].content[0].name);
          for (var j = 0; j < digitalRecords.nlmSearchResult.list[0].document[i].content.length; j++) {
            if (digitalRecords.nlmSearchResult.list[0].document[i].content[j]['$'].name == 'FullSummary') {
              snippet = digitalRecords.nlmSearchResult.list[0].document[i].content[j]['_'];
            }
          }
          columns[columnIndex].collection.push({
            title: removeHTMLTags(digitalRecords.nlmSearchResult.list[0].document[i].content[0]['_']),
            description: removeHTMLTags(snippet)
          });
          if (currentSize == columns[columnIndex].size - 1) {
            columnIndex++;
            currentSize = 0;
          } else {
            currentSize++;
          }
        }
        $scope.columns = columns;
        console.log('success getting digital collection records');
      }).error(function (data, status, headers, config) {
        console.log('an error occured getting digital collection');
      });
    }
    //init();
    function removeHTMLTags(s) {
      var rex = /(<([^>]+)>)/gi;
      return s.replace(rex, '');
    }
  }
]);/// <reference path="../services/cards.client.service.js" />
'use strict';
angular.module('cards').controller('MedPlusConnectCardsController', [
  '$scope',
  '$stateParams',
  'CardsFactory',
  function ($scope, $stateParams, CardsFactory) {
    //var searchTerm = $stateParams.searchTerm;
    $scope.doSearch = function (searchTerm) {
      getSearchResults(searchTerm);
    };
    function getSearchResults(searchTerm) {
      CardsFactory.getMedPlusConnectRecords(searchTerm).success(function (records) {
        var totalRecords = records.feed.entry.length;
        var remainder = totalRecords % 3;
        var columnSize = (totalRecords - remainder) / 3;
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
        for (var i = 0; i < records.feed.entry.length; i++) {
          columns[columnIndex].collection.push({
            title: removeHTMLTags(records.feed.entry[i].title['_value']),
            description: removeHTMLTags(records.feed.entry[i].summary['_value'])
          });
          if (currentSize == columns[columnIndex].size - 1) {
            columnIndex++;
            currentSize = 0;
          } else {
            currentSize++;
          }
        }
        $scope.columns = columns;
        console.log('success getting records');
      }).error(function (data, status, headers, config) {
        console.log('an error occured getting digital collection');
      });
    }
    //init();
    function removeHTMLTags(s) {
      var rex = /(<([^>]+)>)/gi;
      return s.replace(rex, '');
    }
  }
]);/// <reference path="../services/cards.client.service.js" />
'use strict';
angular.module('cards').controller('PubmedCardsController', [
  '$scope',
  '$stateParams',
  'CardsFactory',
  function ($scope, $stateParams, CardsFactory) {
    //var searchTerm = $stateParams.searchTerm;
    $scope.doSearch = function (searchTerm) {
      getSearchResults(searchTerm);
    };
    function getSearchResults(searchTerm) {
      CardsFactory.getPubmedRecords(searchTerm).success(function (records) {
        var idList = records.eSearchResult.IdList[0].Id;
        var totalRecords = idList.length;
        var remainder = totalRecords % 3;
        var columnSize = (totalRecords - remainder) / 3;
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
        for (var i = 0; i < idList.length; i++) {
          var id = idList[i].toString();
          columns[columnIndex].collection.push({ id: id });
          getPubmedDetails(id, columns[columnIndex].collection[columns[columnIndex].collection.length - 1]);
          if (currentSize == columns[columnIndex].size - 1) {
            columnIndex++;
            currentSize = 0;
          } else {
            currentSize++;
          }
        }
        $scope.columns = columns;  //console.log("success getting pubmed records");
      }).error(function (data, status, headers, config) {
        console.log('an error occured getting daily med records');
      });
    }
    //init();
    function getPubmedDetails(id, collectionItem) {
      var p;
      CardsFactory.getPubmedRecord(id).success(function (record) {
        console.log(id);
        var articleTitle = record.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0].ArticleTitle[0].toString();
        var abstract = record.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0].Abstract ? record.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].Article[0].Abstract[0].AbstractText[0]['_'].toString() : '';
        var dateArray = record.PubmedArticleSet.PubmedArticle[0].MedlineCitation[0].DateCreated[0];
        var dateCreated = dateArray.Month[0].toString() + '/' + dateArray.Day[0].toString() + '/' + dateArray.Year[0].toString();
        collectionItem.title = articleTitle;
        collectionItem.abstract = abstract;
        collectionItem.dateCreated = dateCreated;
      }).error(function (data, status, headers, config) {
        console.log('an error occured getting a single daily med record');
      });
    }
  }
]);/// <reference path="../services/cards.client.service.js" />
'use strict';
angular.module('cards').controller('TrialsCardsController', [
  '$scope',
  '$stateParams',
  'CardsFactory',
  function ($scope, $stateParams, CardsFactory) {
    //var searchTerm = $stateParams.searchTerm;
    $scope.doSearch = function (searchTerm) {
      getSearchResults(searchTerm);
    };
    function getSearchResults(searchTerm) {
      CardsFactory.getTrialRecords(searchTerm).success(function (records) {
        var totalRecords = records.search_results.clinical_study.length;
        var remainder = totalRecords % 3;
        var columnSize = (totalRecords - remainder) / 3;
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
        for (var i = 0; i < records.search_results.clinical_study.length; i++) {
          console.log(records.search_results.clinical_study[i].title[0].toString());
          columns[columnIndex].collection.push({
            title: removeHTMLTags(records.search_results.clinical_study[i].title[0].toString()),
            description: removeHTMLTags(records.search_results.clinical_study[i].condition_summary[0].toString()),
            status: records.search_results.clinical_study[i].status[0]['_']
          });
          if (currentSize == columns[columnIndex].size - 1) {
            columnIndex++;
            currentSize = 0;
          } else {
            currentSize++;
          }
        }
        $scope.columns = columns;
        console.log('success getting records');
      }).error(function (data, status, headers, config) {
        console.log('an error occured getting digital collection');
      });
    }
    //init();
    function removeHTMLTags(s) {
      var rex = /(<([^>]+)>)/gi;
      return s.replace(rex, '');
    }
  }
]);/// <reference path="~/public/lib/angular/angular.js" />
'use strict';
angular.module('cards').factory('CardsFactory', [
  '$http',
  '$resource',
  function ($http, $resource) {
    var factory = {};
    factory.getCardRecords = function (sourceId, sourceName, searchTerm, currentPage) {
      return $http.get('proxy?sourceId=' + sourceId + '&currentPage=' + currentPage + '&searchTerm=' + searchTerm, {
        data: {
          sourceId: sourceId,
          sourceName: sourceName,
          searchTerm: searchTerm
        },
        cache: true,
        timeout: 20000
      });
    };
    factory.getDetailedCardRecord = function (sourceId, recordId) {
      return $http.get('proxy?sourceId=' + sourceId + '&recordId=' + recordId, { cache: true });
    };
    return factory;
  }
]);'use strict';
angular.module('core', ['users']);'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/cards');  // Home state routing
                                             //$stateProvider.
                                             //state('home', {
                                             //	url: '/',
                                             //	templateUrl: 'modules/core/views/home.client.view.html'
                                             //});
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  '$rootScope',
  '$location',
  'Authentication',
  'Menus',
  'UserPreferences',
  function ($scope, $rootScope, $location, Authentication, Menus, UserPreferences) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
      changeHeaderName();
    });
    function changeHeaderName() {
      switch ($location.path()) {
      case '/cards/pubmed/':
        $scope.currentAPI = '- Cards for Pubmed';
        break;
      case '/cards/trials/':
        $scope.currentAPI = '- Cards for Clinical Trials';
        break;
      case '/cards/medplus/':
        $scope.currentAPI = '- Cards for MedlinePlus';
        break;
      case '/cards/medplusconnect/':
        $scope.currentAPI = '- Cards for MedlinePlus Connect';
        break;
      case '/cards/digital/':
        $scope.currentAPI = '- Cards for Digital Collections';
        break;
      case '/cards/daily/':
        $scope.currentAPI = '- Cards for DailyMed';
        break;
      default:
        $scope.currentAPI = '';
      }
    }
    function getUserPreferences() {
      $rootScope.userPreferences = UserPreferences.getUserPreferences();
    }
    getUserPreferences();
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);function getUrlVars() {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['*'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].isPublic : isPublic,
        roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].roles : roles,
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].items[itemIndex].isPublic : isPublic,
            roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].items[itemIndex].roles : roles,
            position: position || 0,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              // Redirect to signin page
              $location.path('signin');
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider.state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/authentication/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    }).state('forgot', {
      url: '/password/forgot',
      templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).state('reset-invlaid', {
      url: '/password/reset/invalid',
      templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).state('reset-success', {
      url: '/password/reset/success',
      templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).state('reset', {
      url: '/password/reset/:token',
      templateUrl: 'modules/users/views/password/reset-password.client.view.html'
    }).state('preferences', {
      url: '/preferences',
      templateUrl: 'modules/users/views/preferences.client.view.html'
    });
  }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    // If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('PasswordController', [
  '$scope',
  '$stateParams',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    // Submit forgotten password account id
    $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;
      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };
    // Change user password
    $scope.resetUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;
        // Attach user profile
        Authentication.user = response;
        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);/// <reference path="../services/cards.client.service.js" />
'use strict';
angular.module('cards').controller('PreferencesController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  '$location',
  'CardsFactory',
  'UserPreferences',
  function ($scope, $rootScope, $stateParams, $location, CardsFactory, UserPreferences) {
    function init() {
      if (!$rootScope.userPreferences) {
        $rootScope.userPreferences = UserPreferences.getUserPreferences();
      }
      $scope.sources = $rootScope.userPreferences.sources;
      $scope.searchTerms = $rootScope.userPreferences.searchTerms;
    }
    init();
    $scope.changeSources = function (sourceId, chosen) {
      for (var i = 0; i < $scope.sources.length; i++) {
        if ($scope.sources[i].id == sourceId) {
          $scope.sources[i].chosen = chosen;
        }
      }
    };
    $scope.deleteSearchTerm = function (index) {
      $scope.searchTerms.splice(index, 1);
    };
    $scope.addSearchTerm = function (term) {
      var dup = false;
      $scope.searchTermToAdd = '';
      for (var i = 0; i < $scope.searchTerms.length; i++) {
        if ($scope.searchTerms[i] == term) {
          dup = true;
          break;
        }
      }
      if (dup)
        return false;
      $scope.searchTerms.push(term);
      $scope.searchTermToAdd = '';
    };
    $scope.savePreferences = function (sourceId, chosen) {
      $rootScope.userPreferences.sources = $scope.sources;
      $rootScope.columns = undefined;
      $location.url('/cards');
    };
  }
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);
        user.$update(function (response) {
          $scope.success = true;
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };
    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
  }]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);
angular.module('users').factory('UserPreferences', [function () {
    var factory = {};
    factory.getUserPreferences = function () {
      var userPreferences = {
          sources: [
            {
              id: 'dailyMed',
              name: 'DailyMed',
              chosen: true
            },
            {
              id: 'fda',
              name: 'FDA Drugs',
              chosen: true
            }
          ],
          searchTerms: [
            'a00',
            'q90',
            'cancer',
            'hiv'
          ]
        };
      return userPreferences;
    };
    return factory;
  }]);