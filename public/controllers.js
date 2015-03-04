angular.module("jewApp")
.controller("mainCtrl",function($scope,$interval,$http,$location,$state,appData,uiGmapGoogleMapApi,$filter,$rootScope){
	$scope.user = {};						// user data for SINGUP from form (logModal.html)
	$scope.userLog = {};					//user data for LOGIN up from form (signModal.html)

	$scope.items = appData.dropdownUserMenu;//item for user dropdown menu

	$scope.signMessage = "Enter email";  	//default text in email field in SIGNUP form

	$scope.isAuth = false;					//login Status
	$scope.username = "";					//name displayed in navigation bar
	$scope.isListed = { listed: false};		//submited a home?
	
	$http.get(appData.url + '/login').
		success(function(data){
		$scope.isAuth = data.isAuthenticated;
		$scope.username = data.user.firstName;
		$scope.userLastName = data.user.lastName;
		$scope.userId = data.user._id;
		if($scope.isAuth)
			$scope.isListed = {listed: data.user.house.listed == '' ? false : true };
		console.log($scope.userId);
	});

	$scope.searchTerm = {search: ''};//the search term from the search field in the navbar
	$scope.search = function(){
		$state.go('usersArea.search.list');
		$scope.$broadcast('serach',$scope.searchTerm);//send a search event to searchCtrl with searchTerm
	}

	$scope.$on('mapFiltered', function(events,args){
		console.log(args);
		$scope.markers = args;
	});

	$scope.logOut = function(){
		$http.get(appData.url + '/logout')
			.success(function(data){
				$scope.isAuth = data.isAuthenticated;
				$location.path('/');
			})
	}
	$scope.signUp = function(){
		$scope.user.firstName = $scope.user.firstName[0].toUpperCase() + $scope.user.firstName.substring(1).toLowerCase();
		$scope.user.lastName = $scope.user.lastName[0].toUpperCase() + $scope.user.lastName.substring(1).toLowerCase();
		$http.post(appData.url + '/signup',$scope.user)
			.success(function(data){
				if(data.message){
					$scope.signMessage = data.message;
					$scope.user.email = "";//reset email if signup fails (user exists already)
				} else {//LOGIN if SIGNUP ok
					$scope.userLog.password = $scope.user.password;
					$scope.userLog.username = $scope.user.email;
					$scope.signMessage = "Enter email";
					$scope.logIn();
					$scope.user = {};//reset SIGUP form
				}
			})
	}

	$scope.logIn = function(){
		console.log($scope.userLog);
		$http.post(appData.url + "/login",$scope.userLog)
			.success(function(data){
				if(data.message){
					$scope.message = data.message;
					console.log(data.message);
					$scope.userLog = {};
				} else {

						$http.get(appData.url + '/login').
							success(function(data){
								$scope.isAuth = data.isAuthenticated;
								$scope.username = data.user.firstName;
								$scope.userLastName = data.user.lastName;
								$scope.userId = data.user._id;
								$scope.isListed ={ listed: data.user.house.listed};
								$http.get(appData.url + '/login');
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

.controller("inboxCtrl",function($scope,$http,$state,appData){
	$scope.messageData = {
		uid: $scope.userId,
		sender: $scope.username + ' ' + $scope.userLastName,
		subject: "",
		content: ""
	};

	$http.get(appData.url + '/inbox/' + $scope.userId)// move to resolve
		.success(function(data){
			$scope.messages = data[0].messages;
			console.log(data);
		});

	$scope.sendMessage = function(){
		console.log('sending');
		$http.post(appData.url + '/inbox/' + $scope.userId, $scope.messageData)//userId change to the subjects id
			.success(function(data){
				console.log(data);
			});
	}	
})
.controller("newHomeCtrl",function($scope,$http, $window, appData,$upload,$state,homeData){
	if($scope.isListed.listed){
		$scope.home = homeData;
		console.log($scope.home)
	} else {
		$scope.home = {listed: true, location: {}};
	}

	$scope.options = {types: '(cities)'};
	$scope.amenities = appData.amenitiesListHome;

	$scope.details = "";

    $scope.saveHome = function(){
    	
    	var locationPromise = appData.addressData(appData.url)
    		.then(function(result){
    			$scope.home.location = result;
    			console.log(result);
    			console.log($scope.home.location);
    			$http.put(appData.url + '/listHome/' + $scope.userId,$scope.home)
		    		.success(function(data){
		    			$scope.listHomeMessage = data;
		    					$http.get(appData.url + '/login').
									success(function(data){
										$scope.isListed.listed = data.user.house.listed;
									});
									
						$state.go('listHome.photos');
		    		})
    		});
    }

    $scope.goToDetails = function(){
    	$state.go('listHome.details');
    }

    $scope.finishList = function(){
    	$state.go('usersArea.home.photos');
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
                    fields: {'id': $scope.userId},
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
.controller('homeCtrl', function($scope,$http,$state,uiGmapGoogleMapApi,appData,addressData,photos){
	var amenities = {};

	$scope.photosUrl = photos;

	$scope.homeImage = {
    	background: 'url(' + $scope.photosUrl.cover + ')'
	};

	$scope.imagePick = function(pic){
		return {
	    	'background-image': 'url(' + $scope.photosUrl[pic] + ')'
		}
	}

	$http.get(appData.url + '/login').
				success(function(data){
					amenities = data.user.house.amenities;
					$scope.home = data.user.house;
				});

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

	$scope.mapData = addressData;
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

	$scope.editHome = function(){
		$state.go('listHome.address');
	}
})
.controller('searchCtrl',function($scope,$http,$rootScope,$state,$filter,uiGmapGoogleMapApi,appData){


	var filter = $filter('amenFilter')
	$scope.filterAmen = appData.amenitiesFilter;
	$scope.homeFilter = {};
	$scope.filters = {TV: false, wifi: false, AirCondition: false,Dryer: false,
				Elevator: false, Essentials: false, FreeParking: false,Heating: false,
				Fireplace: false, PetsAllowed: false, Pool: false,SmokingAllowed: false,
				Washer: false, Accessibility: false}

	$scope.$on('serach',function(events,args){//waits for a search event from mainCtrl
		$scope.searchTerm = args;
		$scope.search();//calls search function
	});

	$scope.search = function(){
		var filterResult = [];
		// $state.go('usersArea.search.list');//goes to list view
		var results = $http.get(appData.url + '/search/' + $scope.searchTerm.search)//asks express for homes
			.then(function(result){
				console.log(result);
				$scope.results = result.data;
				$scope.markersCoord = [];

				// filterResult = filter($scope.results,$scope.filters,$scope.homeFilter);
				// $scope.filteredResultLength = filterResult.length;
				// $scope.numOfPages = Math.ceil($scope.filteredResultLength/$scope.step);
				// $scope.pageArray = new Array($scope.numOfPages);
				
				for (var i = 0; i < $scope.results.length; i++) {//builds markers object for google maps
					$scope.markersCoord.push({
						id: i,
						latitude: $scope.results[i].house.location.lat,
						longitude: $scope.results[i].house.location.lng
					});
				};
			
				$rootScope.$on('$stateChangeStart', //whenever entering map state, filters results
			     function(event, toState, toParams, fromState, fromParams){
				     	if(toState.name == 'usersArea.search.map'){

							filterResult = filter($scope.results,$scope.filters,$scope.homeFilter);
							$scope.chosen = filterResult[0];

							$scope.markersCoord = [];
							for (var i = 0; i < filterResult.length; i++) {
											$scope.markersCoord.push({
												id: i,
												latitude: filterResult[i].house.location.lat,
												longitude: filterResult[i].house.location.lng
											});
										};
						
							var sumLat = 0;
							var sumLng = 0;

							for (var i = 0; i < $scope.markersCoord.length; i++) {
								sumLat += $scope.markersCoord[i].latitude;
								sumLng += $scope.markersCoord[i].longitude;
							};

							$scope.markers = $scope.markersCoord;

							$scope.options = {scrollwheel: false};
							$scope.map = {
								center: {latitude: sumLat/$scope.markers.length,
		     							 longitude: sumLng/$scope.markers.length },
						     		zoom: 10,
						     		bounds: {}
						     };
						 }

				});
			})
	}

	$rootScope.$on('filterExec',function(event,args){//check size of filtered results and update page count
		$scope.filteredResultLength = args;
		$scope.numOfPages = Math.ceil($scope.filteredResultLength/$scope.step);
		$scope.pageArray = new Array($scope.numOfPages);
	})

	$scope.onClick = function(data) {
	    console.log(data);
	    $scope.chosen = $scope.results[data.key];
	};

	$scope.pageNum = 1;

	$scope.step = 5;

	$scope.setPage = function(page){
		$scope.pageNum = page;
	}
})