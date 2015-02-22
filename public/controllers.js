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
		console.log($scope.userId);
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
.controller("newHomeCtrl",function($scope,$http,appData){
	$scope.home = {listed: true};
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
    		})
    }

                angular.extend($scope, {

                model: { file: null },

                // upload: function(model) {
                //     Files.prototype.$save.call(model.file, function(self, headers) {
                //         // Handle server response
                //     });
                // }
            });
            $scope.upload = function(){
                console.log($scope.model.file);
                $http.post(appData.url + '/photo',$scope.model.file)
                	.then(function(data){
                		console.log(data);
                	},function(err){
                		console.error(err);
                	})
            }
})
.controller('homeCtrl', function($scope,$http,uiGmapGoogleMapApi,appData,addressData){
	var amenities = {};

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
		options: { draggable: true },
		events: {
		  dragend: function (marker, eventName, args) {
		    $log.log('marker dragend');
		    var lat = marker.getPosition().lat();
		    var lon = marker.getPosition().lng();
		    $log.log(lat);
		    $log.log(lon);

		    $scope.marker.options = {
		      draggable: true,
		      labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
		      labelAnchor: "100 0",
		      labelClass: "marker-labels"
		    };
		  }
		}
	}
})