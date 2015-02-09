angular.module("jewApp")

.controller("mainCtrl",function($scope,$interval){
	$scope.picture = [ 
		{ active: true  }, 
		{ active: false }, 
		{ active: false }
	 ];

	 

	$scope.changePic = function(){
		for (var i = 0; i < $scope.picture.length; i++) {
			if($scope.picture[i].active){
				$scope.picture[i].active = false
				console.log($scope.picture[i].active)
				if(i === 2){
					$scope.picture[0].active = true;
					console.log($scope.picture[0].active)
					break;
				} else {
					$scope.picture[i + 1].active = true;
					console.log($scope.picture[i+1].active)
					break;
				}
			}
		};
		console.log($scope.picture);
	}

	$interval($scope.changePic,7000);
})