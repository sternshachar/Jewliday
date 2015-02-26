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

        }
	}
})
.directive('myCarousel',function(){
	return {
		restrict: 'E',

		templateUrl: 'views/carousel.html',

		scope:{
			photos: '=',
			interval:'='
		} ,

		controller: function($scope,$interval){
			console.log($scope.photos);
			$scope.slides = ['','','','','',''];
			var slideName = ['pic1','pic2','pic3','pic4','pic5','pic6'];
			$scope.isActive = [true,false,false,false,false,false];

			for (var i = 0; i < slideName.length; i++) {
				$scope.slides[i] = $scope.photos[slideName[i]];
			};

			$scope.autoSlideChange = function(){
				   for (var i = 0; i < $scope.slides.length; i++) {
			          if($scope.isActive[i]){
			            $scope.isActive[i] = false;
			              if(i + 1 < $scope.slides.length)
			                $scope.isActive[i + 1] = true;
			              else
			                $scope.isActive[0] = true;
			              break;
			            
			            }
			          }
			}

			$scope.changeSlide = function(direction){
		        for (var i = 0; i < $scope.slides.length; i++) {
		          if($scope.isActive[i]){
		            $scope.isActive[i] = false;
		            if(direction == 'next'){
		              console.log('next');
		              if(i + 1 < $scope.slides.length)
		                $scope.isActive[i + 1] = true;
		              else
		                $scope.isActive[0] = true;
		              break;
		            }
		            if(direction == 'prev'){
		              console.log('prev');
		              if(i - 1 >= 0)
		                $scope.isActive[i - 1] = true;
		              else
		                $scope.isActive[$scope.slides.length - 1] = true;
		              break;
		            }

		          }
		        };
		        $interval.cancel(carouselInterval);
		        var carouselInterval = $interval($scope.autoSlideChange,$scope.interval);
		    }

			var carouselInterval = $interval($scope.autoSlideChange,$scope.interval);
		}
	}
})