angular.module("jewApp")

.controller("mainCtrl",function($scope,$interval,$http,$location){
	$scope.username = "";
	$scope.isAuth = false;
	$scope.sign = false;
	$scope.login = true;
	$scope.user = {};
	$scope.userLog = {};
	$scope.signMessage = "Enter email";
	var url = "http://ec2-54-149-52-21.us-west-2.compute.amazonaws.com:8080";
	
	$http.get(url + '/login').
		success(function(data){
		$scope.isAuth = data.isAuthenticated;
		$scope.username = data.user.firstName;
		console.log(data);
	});

	$scope.logOut = function(){
		$http.get(url + '/logout')
			.success(function(data){
				$scope.isAuth = data.isAuthenticated;
				$location.path('/');
			})
	}
	$scope.signUp = function(){
		console.log('sending: ' + $scope.user.firstName + $scope.user.lastName)
		$scope.user.firstName = $scope.user.firstName[0].toUpperCase() + $scope.user.firstName.substring(1).toLowerCase();
		$scope.user.lastName = $scope.user.lastName[0].toUpperCase() + $scope.user.lastName.substring(1).toLowerCase();
		$http.post(url + '/signup',$scope.user)
			.success(function(data){
				if(data.message){
					$scope.signMessage = data.message;
					$scope.user.email = "";
				} else {
					$scope.userLog.password = $scope.user.password;
					$scope.userLog.username = $scope.user.email;
					$scope.signMessage = "Enter email";
					$scope.logIn();
					$scope.user = {};
				}
				


			})
	}

	$scope.logIn = function(){
		console.log($scope.userLog);
		$http.post(url + "/login",$scope.userLog)
			.success(function(data){
				if(data.message){
					$scope.message = data.message;
					console.log(data.message);
					$scope.userLog = {};
				} else {

						$http.get(url + '/login').
							success(function(data){
								$scope.isAuth = data.isAuthenticated;
								$scope.username = data.user.firstName;
								console.log(data);
							});

					$scope.closeModal();
					$scope.userLog = {};
					$scope.message = '';

				}

			});
	}

	$scope.redAlert = function(){
		return $scope.signMessage == "Enter email" ? ' ' : 'red-alert';
	}

	  $scope.items = [
	    'Profile',
	    'Inbox',
	    'Your Home',
	    'Log Out'
	  ];
})

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
        }
	}
})