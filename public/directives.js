angular.module('jewApp')
.directive("jumbotron",function(){
	return{
		restrict: 'E',
		templateUrl: 'views/jumbotron.html',
		controller: function($scope,$interval){
			$scope.images = [ 
				{ image: "images/mountain.jpg", active: true  }, 
				{ image: "images/street.jpg", active: false }, 
				{ image: "images/beach.jpg", active: false }
			 ];

			 	$scope.changePic = function(){
					for (var i = 0; i < $scope.images.length; i++) {
						if($scope.images[i].active){
							$scope.images[i].active = false
							if(i === ($scope.images.length - 1)){
								$scope.images[0].active = true;
								break;
							} else {
								$scope.images[i + 1].active = true;
								break;
							}
						}
					};
				}

				$interval($scope.changePic,7000);
		}
	}
})

.directive("logModal",function(){
	return{
		restrict: 'E',

		templateUrl: function(element, attrs){
			return attrs['modal'] == 'sign' ? 'views/signModal.html' : 'views/logModal.html';
		},
		controller: function($scope){
				$scope.openModal = function(modalName){
					$scope.modal = true;
					if(modalName == 'sign'){
						$scope.sign = true;
						$scope.login = false;

					} else {
						$scope.sign = false;
						$scope.login = true;	
					}
				};
				$scope.closeModal = function(){
					$scope.modal = false;
					$scope.signMessage = "Enter email";
				}
					}
				}
})

.directive('navigationBar', function(){
	return {
		restrict: 'E',
		templateUrl: 'views/navigationBar.html',
        controller: function($scope, $element, $attrs){
        	$scope.logo = $attrs.logo;

        		$scope.tabs = [
					{name: "profile", active: true},
					{name: "inbox", active: false},
					{name: "home", active: false}
				];

				$scope.pickTab = function(tab){
					for (var i = 0; i < $scope.tabs.length; i++) {
						if($scope.tabs[i].name == tab){
							$scope.tabs[i].active = true;
							$scope.userTab.name = tab;
							if(tab == 'inbox')
								$scope.inbox.state = true;
							else
								$scope.inbox.state = false;
						} else {
							$scope.tabs[i].active = false;
						}
					};
				}

				$scope.activeTab = function(tab){
					for (var i = 0; i < $scope.tabs.length; i++) {
						if($scope.tabs[i].active == true && $scope.tabs[i].name == tab)
							return 'active';

					};
					return ' ';
				}
        }
	}
})

.directive("user", function(){
	return {
		restrict: 'E',
		templateUrl: function(elem,attrs){
			console.log(attra['content']);
			switch(attrs['content']){
				case 'profile':
					return 'views/profile.html';
				case 'yourHome':
					return 'views/yourHome.html';
				case 'inbox':
					return 'views/inbox.html';
				default:
					return 'views/profile.html';
			}
		}
	}
})