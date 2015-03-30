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
			$scope.slides = [];
			var slideName = ['pic1','pic2','pic3','pic4','pic5','pic6'];
			$scope.isActive = [true,false,false,false,false,false];

			for (var i = 0; i < slideName.length; i++) {
				if($scope.photos[slideName[i]])
					$scope.slides.push($scope.photos[slideName[i]]);
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
		    }
		    //for Auto slide change uncomment the line below
			// var carouselInterval = $interval($scope.autoSlideChange,$scope.interval);
		}
	}
})

.directive("messageModal",function(){
	return{
		restrict: 'E',

		templateUrl: 'views/messageModal.html',

		controller: function($scope,$http,appData,searchService,inboxService){
				$scope.messageData = {
					uid: $scope.userData.id,
					sender: $scope.userData.firstName + ' ' + $scope.userData.lastName,
					content: ""
				};

				$scope.openMessageModal = function(){
					$scope.messageModal.isOpen = true;

				};
				$scope.closeModal = function(){
					$scope.messageModal.isOpen = false;
				}
					
				
				$scope.modalSendMessage = function(){
					console.log(searchService.getHomeSelect()._id);
					inboxService.sendMessage(searchService.getHomeSelect()._id,$scope.messageData)
						.then(function(data){
							console.log('Message sent!');
							$scope.closeModal();

						},
						function(err){
							console.error(err);
						});
				}

			}
	}
})
.directive("messageContent",function(){
	return{
		restrict: 'E',

		templateUrl: 'views/messageContent.html',

		controller: function($scope,$http,$interval,$location, $anchorScroll,appData,searchService,inboxService,socket){
				$scope.messageData = {
					uid: $scope.userData.id,
					sender: $scope.userData.firstName + ' ' + $scope.userData.lastName,
					content: ""
				};
				$scope.$emit('refresh inbox',{})
				var currentIndex = 0;
				$scope.openMessageContent = function(index){
					currentIndex = index;
					$scope.conversation = $scope.conversations[index]
					$http.put(appData.url + '/inbox/' + $scope.userData.id, {uid: $scope.conversation.uid})//promise in inbox servcie
						.then(function(result){
							$scope.unread.num -= result.data.read;
						})
						$scope.$emit('refresh inbox',{})
						$scope.conversation = $scope.conversations[index];
				};
									
				$scope.replyMessage = function(){
					$scope.messageData.uid = $scope.userData.id;
					$scope.messageData.sender = $scope.userData.firstName + ' ' + $scope.userData.lastName;

					console.log($scope.messageData)
					inboxService.sendMessage($scope.conversation.uid,$scope.messageData)
						.then(function(data){
							$scope.closeModal();
							$scope.$emit('refresh inbox',{})
							currentIndex = 0;
							$scope.messageData.content = "";
						},function(err){
							console.error(err);
						})
				}

				$scope.$on('inbox refreshed',function(conversations){
					$scope.conversation = $scope.conversations[currentIndex];
				})

				$scope.$on('new message',function(event,data){
					console.log(data.message);
					$scope.conversation.messages.push({content: data.message.content, sent: new Date(), iSent: false});
					console.log($scope.conversation.messages);
				})


			}
	}
})