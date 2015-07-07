'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$rootScope', '$location', 'Authentication', 'Menus', 'UserPreferences',
	function ($scope, $rootScope, $location, Authentication, Menus, UserPreferences) {
	    $scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function () {
		    $scope.isCollapsed = false;
		    changeHeaderName();
		});


	
		function changeHeaderName()
		{

		    switch ($location.path()) {
		        case "/cards/pubmed/":
		            $scope.currentAPI = '- Cards for Pubmed'
		            break;
		        case "/cards/trials/":
		            $scope.currentAPI = '- Cards for Clinical Trials'
		            break;
		        case "/cards/medplus/":
		            $scope.currentAPI = '- Cards for MedlinePlus'
		            break;
		        case "/cards/medplusconnect/":
		            $scope.currentAPI = '- Cards for MedlinePlus Connect'
		            break;
		        case "/cards/digital/":
		            $scope.currentAPI = '- Cards for Digital Collections'
		            break;
		        case "/cards/daily/":
		            $scope.currentAPI = '- Cards for DailyMed'
		            break;
		        default:
		            $scope.currentAPI = ''
		    }

		}


		function getUserPreferences() {
		    $rootScope.userPreferences = UserPreferences.getUserPreferences();
		}

		getUserPreferences();

	}


]);