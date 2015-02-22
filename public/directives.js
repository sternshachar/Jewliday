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

    /**
    * The ng-thumb directive
    * @author: nerv
    * @version: 0.1.2, 2014-01-09
    */

.directive('ngThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.ngThumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                console.log(params.file);
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({ width: width, height: height });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
    }]);