angular.module("jewApp")

.controller("mainCtrl",function($scope,$interval){

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
								console.log($scope.images[0].active)
								break;
							} else {
								$scope.images[i + 1].active = true;
								console.log($scope.images[i+1].active)
								break;
							}
						}
					};
					console.log($scope.images);
				}

				$interval($scope.changePic,7000);
		}
	}
});