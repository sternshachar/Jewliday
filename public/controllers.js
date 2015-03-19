angular.module("jewApp")
.controller("mainCtrl",function($scope,$interval,$timeout,$http,$location,$state,appData,uiGmapGoogleMapApi,$filter,$rootScope,userService,inboxService,searchService){
	$scope.user = {};						// user data for SINGUP from form (logModal.html)
	$scope.userLog = {};					//user data for LOGIN up from form (signModal.html)
	$scope.items = appData.dropdownUserMenu;//item for user dropdown menu
	$scope.signMessage = "Enter email";  	//default text in email field in SIGNUP form
	$scope.unread = {num: 0};
	$scope.warning = {message: ''};
	
					//indicates number of unread messages
		userService.getUserData()				//gets user datails
			.then(function(result){
				return userService.getData();		
			})
			.then(function(result){
				$scope.userData = result.userData;
				return inboxService.getInbox($scope.userData.id)
			})
	 		.then(function(result){
	 			$scope.unread.num = result.unread;
	 			if ($location.search()!= {}) {
	 				searchService.searchHomeById($location.search().id);
	 				$state.go('browse.photos');
	 			};
	 		});

	$scope.searchTerm = {search: ''};//the search term from the search field in the navbar
	$scope.search = function(){
		$state.go('usersArea.search.list');
		$scope.$broadcast('search',$scope.searchTerm);//send a search event to searchCtrl with searchTerm
	}

	$scope.$on('mapFiltered', function(events,args){
		console.log(args);
		$scope.markers = args;
	});

	$scope.logOut = function(){
		userService.logOut()
			.then(function(data){
				$scope.userData = {isAuth: data};
				$location.path('/');
			},function(err){
				console.log(err);
			})
	}

	$scope.signUp = function(){
		userService.signUp($scope.user).then(function(signed){
			$scope.userLog = {password: $scope.user.password, username: $scope.user.email};
			$scope.logIn();
			$scope.signMessage = "Enter email";
			$scope.user = {};//reset SIGUP form
		},function(message){
			$scope.signMessage = data.message;
			$scope.user.email = "";//reset email if signup fails (user exists already)
		})
	}

	$scope.logIn = function(){
		userService.login($scope.userLog)
			.then(function(data){
				return userService.getUserData()
			})				//gets user datails
			.then(function(result){
				return userService.getData();		
			})
			.then(function(result){
				$scope.userData = result.userData;
				$scope.closeModal();
				$scope.userLog = {};
				$scope.message = '';
				$scope.warning.message = '';
				return inboxService.getInbox($scope.userData.id)
			})
			.then(function(result){
 			$scope.unread.num = result.unread;
 			}, function(message){
				$scope.message = message;
			})
	}

	$scope.redAlert = function(){
		return $scope.signMessage == "Enter email" ? ' ' : 'red-alert';
	}	  
	$scope.inboxActive = function(){			//sets relevant tab active
		if($state.includes('usersArea.inbox'))
		{return 'active';} else {return '';}
	}
	$scope.homeActive = function(){
	  	if($state.includes('usersArea.home'))
	  	{return 'active';} else {return '';}
	}
	$scope.searchActive = function(){
	  	if($state.includes('usersArea.search'))
	  	{return 'active';} else {return '';}
	}

})

.controller("inboxCtrl",function($scope,$http,$state,$filter,$timeout,appData,inboxService,getInbox,userService){
	$scope.warning.message = '';
	if(!$scope.userData || !$scope.userData.isAuth){
		$timeout(function(){$scope.warning.message = ''}, 3000);
		$scope.warning.message = 'Please Log in ';
		$state.go('home');
	}

	var orderBy = $filter('orderBy');
	$scope.messageData = {
					uid: $scope.userData.id,
					sender: $scope.username + ' ' + $scope.userLastName,
					content: ""
				};

	var inboxData = getInbox; 
	$scope.conversations = inboxData.conversations;
	$scope.unread.num = inboxData.unread;
	
	$scope.$on('refresh inbox', function(data){
		inboxData = inboxService.getInbox($scope.userData.id)
			.then(function(result){
				console.log(result)
				$scope.conversations = result.conversations;
				$scope.unread.num = result.unread;
				$scope.$broadcast('inbox refreshed',$scope.conversations);
			})

	})

	$scope.unreadMessage = function(unreadMessage){
		return unreadMessage ? 'unread' : '';
	}
})
.controller("newHomeCtrl",function($scope,$http, appData,$upload,$state,$timeout,homeData,userService){
	if(!$scope.userData || !$scope.userData.isAuth){
		$timeout(function(){$scope.warning.message = ''}, 3000);
		$scope.warning.message = 'Please Log in ';
		$state.go('home');
	}
	$scope.warning.message = '';
	if($scope.userData.isListed){
		$scope.home = homeData;
		console.log($scope.home)
	} else {
		$scope.home = {listed: true, location: {}};
	}

	$scope.options = {types: '(cities)'};
	$scope.amenities = appData.amenitiesListHome;

	$scope.details = "";

    $scope.saveHome = function(){
    	userService.getCoord($scope.home)
    		.then(function(data){
    			$scope.home.location = data;
    			return userService.saveHome(data,$scope.home)
    		})
    		.then(function(data){
    			$scope.userData.isListed = true;
    			console.log(data);
    		},function(err){
    			console.error(err);
    		})
    }

    $scope.goToDetails = function(){
    	$state.go('listHome.details');
    }

    $scope.finishList = function(){
    	$state.go('listHome.done');
    }

    $scope.goHome = function(){
    	userService.getUserData()
    	.then(function(){
    		$state.go('usersArea.home.photos');
    	});
    }

    $scope.limit = 3;
    $scope.photos = [
			{ type: 'profile' , name: 'Profile' 	 ,done: false, show: true},
			{ type: 'cover'   , name: 'Cover Photo'	 ,done: false, show: true},
			{ type: 'pic1' 	  , name: 'Another Photo',done: false, show: true},
			{ type: 'pic2' 	  , name: 'Another Photo',done: false, show: false},
			{ type: 'pic3' 	  , name: 'Another Photo',done: false, show: false},
			{ type: 'pic4'    , name: 'Another Photo',done: false, show: false},
			{ type: 'pic5'    , name: 'Another Photo',done: false, show: false},
			{ type: 'pic6'    , name: 'Another Photo',done: false, show: false}
	];
	$scope.anotherPic = function(){
		if($scope.limit < 8)
			$scope.limit = $scope.limit + 1;
	}

	$scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    $scope.upload = function (files,type,index) {
    	var picIndex = index;
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                $upload.upload({
                    url: 'upload/' + type,
                    fields: {'id': $scope.userData.id},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.progress = progressPercentage;
                    $scope.bar = {width: progressPercentage + '%'};
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                     $scope.photos[picIndex].done = true;
                });
            }
            
        }
    };
})
.controller('homeCtrl', function($scope,$http,$state,$timeout,uiGmapGoogleMapApi,appData,userService){
	$scope.warning.message = '';
	if(!$scope.userData || !$scope.userData.isAuth){
		$timeout(function(){$scope.warning.message = ''}, 3000);
		$scope.warning.message = 'Please Log in ';
		$state.go('home');
	} else {
		if(!$scope.userData.isListed){
			$scope.warning.message = 'Your home is not listed. Please list your home ';
			console.log($scope.warning.message);
			$state.go('home');
		}
	}

	$scope.browseMode = false;
	$scope.amenitiesOrdered = appData.amenitiesHomeView;
	var amenities = {};
	userService.getData().then(function(result){
			amenities = result.homeData.amenities;
			$scope.home = result.homeData.house;
			$scope.photosUrl = result.photosUrl;
			$scope.homeImage = {
		    	background: 'url(' + $scope.photosUrl.cover + ')'
			};
		})

	$scope.imagePick = function(pic){
		return {
	    	'background-image': 'url(' + $scope.photosUrl[pic] + ')'
		}
	}

	$scope.amenityCheck = function(name){
		if(!(typeof amenities === 'undefined')){
			if(!(typeof amenities[name] === 'undefined') && amenities[name]){
				return 'glyphicon glyphicon-check';
			} else {
				return 'glyphicon glyphicon-unchecked';
			}
		}
	}
	if($scope.userData.isListed)
		userService.getData()
			.then(function(data){
				console.log(data);
				$scope.mapData = data.homeData.location;
				$scope.map = {center: {latitude: $scope.mapData.lat,
	     					   longitude: $scope.mapData.lng }, zoom: 14 };
	     			$scope.marker = {
						id: 0,
						coords: {
						  latitude: $scope.mapData.lat,
						  longitude: $scope.mapData.lng
						},
						options: { draggable: false },
						events: {
						  click: function (marker, eventName, args) {
						    var lat = marker.getPosition().lat();
						    var lon = marker.getPosition().lng();

						    $scope.marker.options = {
						    	labelClass: "marker-labels",
						      content: "<img class='map-info-pic' ng-src='" + $scope.photosUrl.profile + "'>",
						      zIndex: 99999
						    };
						  }
						}
					}
			})
	
	$scope.options = {scrollwheel: false};



	$scope.editHome = function(){
		$state.go('listHome.address');
	}
})
.controller('searchCtrl',function($scope,$http,$rootScope,$state,$filter,$timeout,$window,uiGmapGoogleMapApi,appData,searchService){
	$scope.warning.message = '';
	if(!$scope.userData || !$scope.userData.isAuth){
		$timeout(function(){$scope.warning.message = ''}, 3000);
		$scope.warning.message = 'Please Log in ';
		$state.go('home');
	}
	
	$scope.homeFilter = {kosher: null, synagouge: 0, beds: 0, bedrooms:0};
	$scope.amenities = {TV: false, wifi: false, AirCondition: false,Dryer: false,
				Elevator: false, Essentials: false, FreeParking: false,Heating: false,
				Fireplace: false, PetsAllowed: false, Pool: false,SmokingAllowed: false,
				Washer: false, Accessibility: false}

	var filterResult = [];

	$scope.options = {scrollwheel: false};

	$scope.openHome = function(data){//data is the house only in list
		var url = $state.href('browse', {parameter: data});
		console.log(url)
		if(data){		
			var selectedHome = searchService.homeSelect(data); 
			$window.open(appData.url + '/#/search?id=' + data._id, '_blank');
		} else {
			var selectedHome = searchService.homeSelect($scope.chosen); 
			$window.open(appData.url + '/#/search?id=' + $scope.chosen._id, '_blank');
		}
		$state.go('browse.photos');
	}

	$scope.searchMode =	$state.includes('usersArea.search');
	var filter = $filter('amenFilter')
	$scope.filterAmen = appData.amenitiesFilter;


	$scope.$on('search',function(events,args){//waits for a search event from mainCtrl
		$scope.searchTerm = args;
		$scope.search();//calls search function
	});

	$scope.$watchCollection('homeFilter',function(newData,oldData){ //fix bug
		searchService.filterSearchResults($scope.amenities,newData)
			.then(function(data){
				filterResult = data;
				$scope.chosen = filterResult[0];
				return searchService.mapDataPrepare();
			})
			.then(function(mapData){
				$scope.markers = mapData.markers;
				$scope.map = mapData.mapView;
			})
			
	});

	$scope.$watchCollection('amenities',function(newData,oldData){
		searchService.filterSearchResults(newData,$scope.homeFilter)
			.then(function(data){
				filterResult = data;
				$scope.chosen = filterResult[0];
				return searchService.mapDataPrepare();
			})
			.then(function(mapData){
				$scope.markers = mapData.markers;
				$scope.map = mapData.mapView;
			})
			
	});

	$scope.search = function(){
		searchService.searchHomes($scope.searchTerm.search)
			.then(function(results){
				return searchService.filterSearchResults($scope.amenities,$scope.homeFilter);
			})
			.then(function(results){
				$scope.results = results;
				filterResult = results;
				$scope.chosen = filterResult[0];
				return searchService.mapDataPrepare();
			})
			.then(function(mapData){
				$scope.markers = mapData.markers;
				$scope.map = mapData.mapView;
			},function(err){
				console.error(err);
			});	
	}

	if($scope.searchTerm.search != '')
		$scope.search();

	$rootScope.$on('filterExec',function(event,args){//check size of filtered results and update page count
		$scope.filteredResultLength = args;
		if(args != $scope.oldLength)
			$scope.pageNum = 1;
		$scope.oldLength = args;
		$scope.numOfPages = Math.ceil($scope.filteredResultLength/$scope.step);
		$scope.pageArray = new Array($scope.numOfPages);	
	})

	$scope.onClick = function(data) {
		console.log(filterResult);
		console.log(data.key);
	    $scope.chosen = filterResult[data.key];
	    $scope.chosenKey = data.key;
	};

	$scope.pageNum = 1;

	$scope.step = 5;

	$scope.setPage = function(page){
		$scope.pageNum = page;
	}
})

.controller('browseCtrl', function($scope,$http,$state,$location,uiGmapGoogleMapApi,appData, searchService){
	if(!$scope.userData || !$scope.userData.isAuth)
		$state.go('home');

	$scope.warning.message = '';
	$scope.browseMode = true;
	$scope.messageModal = {isOpen: false};

	var home = searchService.getHomeSelect();
	$scope.photosUrl = home.photos;
	var amenities = home.house.amenities;


	$scope.homeImage = {
    	background: 'url(' + $scope.photosUrl.cover + ')'
	};

	$scope.imagePick = function(pic){
		return {
	    	'background-image': 'url(' + $scope.photosUrl[pic] + ')'
		}
	}

	
	$scope.amenitiesOrdered = appData.amenitiesHomeView;

	$scope.amenityCheck = function(name){
		if(!(typeof amenities === 'undefined')){
			if(!(typeof amenities[name] === 'undefined') && amenities[name]){
				return 'glyphicon glyphicon-check';
			} else {
				return 'glyphicon glyphicon-unchecked';
			}
		}
	}

	$scope.mapData = home.house.location;
	$scope.options = {scrollwheel: false};
	$scope.map = {center: {latitude: $scope.mapData.lat,
     					   longitude: $scope.mapData.lng }, zoom: 14 };
	$scope.marker = {
		id: 0,
		coords: {
		  latitude: $scope.mapData.lat,
		  longitude: $scope.mapData.lng
		},
		options: { draggable: false },
		events: {
		  click: function (marker, eventName, args) {
		    var lat = marker.getPosition().lat();
		    var lon = marker.getPosition().lng();

		    $scope.marker.options = {
		    	labelClass: "marker-labels",
		      content: "<img class='map-info-pic' ng-src='" + $scope.photosUrl.profile + "'>",
		      zIndex: 99999
		    };
		  }
		}
	}

	$scope.sendMessage = function(){
		$scope.messageModal.isOpen = true;
	}
})