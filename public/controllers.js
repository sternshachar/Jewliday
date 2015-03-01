angular.module("jewApp")
.controller("mainCtrl",function($scope,$interval,$http,$location,$state,appData,uiGmapGoogleMapApi){
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
		$scope.isListed = {listed: data.user.house.listed == '' ? false : true };
		console.log($scope.userId);
	});

	$scope.searchTerm = {search: ''};
	$scope.search = function(){
		$state.go('usersArea.search.list');
		var results = $http.get(appData.url + '/search/' + $scope.searchTerm.search)
			.then(function(result){
				console.log(result);
				$scope.results = result.data;
			})
	}

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
		$http.post(appData.url + '/inbox/' + $scope.userId, $scope.messageData)
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
		$scope.home = {listed: true};
	}

	
	$scope.options = {types: '(cities)'};
	$scope.amenities = appData.amenitiesListHome;

	$scope.details = "";


    $scope.saveHome = function(){
    	console.log($scope.home);
    	$http.put(appData.url + '/listHome/' + $scope.userId,$scope.home)
    		.success(function(data){
    			$scope.listHomeMessage = data;
    					$http.get(appData.url + '/login').
							success(function(data){
								$scope.isListed.listed = data.user.house.listed;
							});
							
				$state.go('listHome.photos');
    		})
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
	console.log($scope.photosUrl);

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
					console.log(data);


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
	console.log($scope.mapData)
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
.controller('searchMapCtrl',function($scope,uiGmapGoogleMapApi,appData,addressData){
	$scope.mapData = addressData;
	console.log($scope.mapData)
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
		    	// labelClass: "marker-labels",
		     //  content: "<img class='map-info-pic' ng-src='" + $scope.photosUrl.profile + "'>",
		     //  zIndex: 99999
		    };
		  }
		}
	}
})