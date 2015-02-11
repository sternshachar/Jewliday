angular.module("jewApp")

.controller("mainCtrl",function($scope,$interval,$http){
	$scope.username = "";
	$scope.isAuth = false;
	$scope.sign = false;
	$scope.login = true;
	$scope.user = {};
	$scope.userLog = {};
	var url = "http://ec2-54-149-52-21.us-west-2.compute.amazonaws.com:8080";
	
	$http.get(url + '/login').
		success(function(data){
			console.log(data);
		});

	$scope.signUp = function(){
		console.log('sending: ' + $scope.user.firstName)
		$http.post(url + '/signup',$scope.user)
			.success(function(data){
				console.log('signed');
			})
	}

	$scope.logIn = function(){
		console.log($scope.userLog);
		$http.post(url + "/login",$scope.userLog)
			.success(function(data){
				$scope.isAuth = data.isAuthenticated;
				$scope.username = data.user.name;
				$scope.closeModal();
				console.log($scope.isAuth);
					$http.get(url + '/login').
						success(function(data){
							console.log(data.user);
						});
			});	
	}
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
				}
					}
				}
})