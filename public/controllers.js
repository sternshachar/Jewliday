angular.module("jewApp")
.service('userData', function($http){
	url = "http://ec2-52-10-151-222.us-west-2.compute.amazonaws.com:8080"

	return{
		url: url
	}
})
.controller("mainCtrl",function($scope,$interval,$http,$location,$state,userData,uiGmapGoogleMapApi){
	$scope.username = $http.get(userData.url + '/login').then(function(data){
		console.log(data);
		return data.data.user.firstName;
	});
	$scope.isAuth = $http.get(userData.url + '/login').then(function(data){
		return data.data.isAuthenticated;
	});
	$scope.userId = $http.get(userData.url + '/login').then(function(data){
		return data.data.user._id;
	});
	$scope.userLastName = $http.get(userData.url + '/login').then(function(data){
		return data.data.user.lastName;
	});

	$scope.sign = false;
	$scope.login = true;
	$scope.inbox ={state: false};
	$scope.isListed = { listed: false};
	$scope.user = {};
	$scope.userLog = {};
	$scope.signMessage = "Enter email";


	$scope.logOut = function(){
		$http.get(userData.url + '/logout')
			.success(function(data){
				$scope.isAuth = data.isAuthenticated;
				$location.path('/');
			})
	}
	$scope.signUp = function(){
		$scope.user.firstName = $scope.user.firstName[0].toUpperCase() + $scope.user.firstName.substring(1).toLowerCase();
		$scope.user.lastName = $scope.user.lastName[0].toUpperCase() + $scope.user.lastName.substring(1).toLowerCase();
		$http.post(userData.url + '/signup',$scope.user)
			.success(function(data){
				if(data.message){
					$scope.signMessage = data.message;
					$scope.user.email = "";
				} else {
					$scope.userLog.password = $scope.user.password;
					$scope.userLog.username = $scope.user.email;
					$scope.signMessage = "Enter email";
					$scope.logIn();
					$scope.user = {};
				}
			})
	}

	$scope.logIn = function(){
		console.log($scope.userLog);
		$http.post(userData.url + "/login",$scope.userLog)
			.success(function(data){
				if(data.message){
					$scope.message = data.message;
					console.log(data.message);
					$scope.userLog = {};
				} else {

						$http.get(userData.url + '/login').
							success(function(data){
								$scope.isAuth = data.isAuthenticated;
								$scope.username = data.user.firstName;
								$scope.userLastName = data.user.lastName;
								$scope.userId = data.user._id;
								$scope.isListed ={ listed: data.user.house.listed};
								$http.get(userData.url + '/login').
								success(function(data){
									var city = data.user.house.city.split(", ").join("+");
									var address =   data.user.house.homeNumber + '+' + data.user.house.street +',' + '+' + city;
									$http.get('http://maps.google.com/maps/api/geocode/json?address='+ address +'&sensor=false')
										    .success(function(mapData) {
										    	console.log(mapData.results[0]);
												   $scope.mapData = mapData;
												   console.log($scope.mapData)
												   $scope.options = {scrollwheel: false};
												       $scope.map = {center: {latitude: $scope.mapData.results[0].geometry.location.lat,
     															longitude: $scope.mapData.results[0].geometry.location.lng }, zoom: 14 };
												       $scope.marker = {
													      id: 0,
													      coords: {
													        latitude: $scope.mapData.results[0].geometry.location.lat,
													        longitude: $scope.mapData.results[0].geometry.location.lng
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
									})
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

	  $scope.items = [
	    {name:'Profile',url: "users/profile"},
	    {name:'Your Home',url:"users/home"},
	    {name:'Inbox',url:"users/inbox/incoming"},
	    {name:'Log Out',url:"users/profile"}
	  ];

	  $scope.userTab = {name:'inbox'};

	  $scope.inboxActive = function(){
	  	if($state.includes('usersArea.inbox'))
	  	{return 'active';} else {return '';}
	  }
	  $scope.homeActive = function(){
	  	if($state.includes('usersArea.home'))
	  	{return 'active';} else {return '';}
	  }
})

.controller("inboxCtrl",function($scope,$http,$state,userData){
	$scope.messageData = {
		uid: $scope.userId,
		sender: $scope.username + ' ' + $scope.userLastName,
		subject: "",
		content: ""
	};

	$http.get(userData.url + '/inbox/' + $scope.userId)
		.success(function(data){
			$scope.messages = data[0].messages;
			console.log(data);
		});

	$scope.sendMessage = function(){
		console.log('sending');
		$http.post(userData.url + '/inbox/' + $scope.userId, $scope.messageData)
			.success(function(data){
				console.log(data);
			});
	}	
})

.controller("newHomeCtrl",function($scope,$http,userData){

	$scope.home = {listed: true};
	$scope.options = {types: '(cities)'};
	$scope.amenities = [
				["TV", "wifi", "AirCondition","Dryer"],
				["Elevator", "Essentials", "FreeParking","Heating"],
				["Fireplace", "PetsAllowed", "Pool","SmokingAllowed"],
				["Washer", "Accessibility"],
	];



	$scope.details = "";
	  $scope.file = {};
      
      $scope.$watch('file', function (newVal) {
        if (newVal)
          console.log(newVal);
      })
	$scope.upload = function () {
      console.log($scope.file); // This is where the file is linked to.
      $http.post(userData.url + '/photo',$scope.file)
      	.success(function(data){
      		console.log(data);
      	})
    };

    $scope.saveHome = function(){
    	console.log($scope.home);
    	$http.put(userData.url + '/listHome/' + $scope.userId,$scope.home)
    		.success(function(data){
    			$scope.listHomeMessage = data;
    					$http.get(userData.url + '/login').
							success(function(data){
								$scope.isListed.listed = data.user.house.listed;
							});

    		})
    }
	// {
 //      country: 'ca',
 //      types: '(cities)'
 //    };
})
.controller('homeCtrl', function($scope,$http,uiGmapGoogleMapApi,userData){
	var amenities = {};

		$http.get(userData.url + '/login').
				success(function(data){
					amenities = data.user.house.amenities;
					$scope.home = data.user.house;
					console.log(data);


				});


		
		console.log($scope.mapData);

		$scope.amenitiesOrdered = [
			   [{name:"TV"				,glyph:""	,dbName:"TV"},
				{name:"WI-FI"			,glyph:""	,dbName:"wifi"},
				{name:"Air Condition"	,glyph:""	,dbName:"AirCondition"},
				{name:"Dryer"			,glyph:""	,dbName:"Dryer"}],
			   [{name:"Elevator"		,glyph:""	,dbName:"Elevator"},
				{name:"Essentials"		,glyph:""	,dbName:"Essentials"},
				{name:"Free Parking"	,glyph:""	,dbName:"FreeParking"},
				{name:"Heating"			,glyph:""	,dbName:"Heating"}],
			   [{name:"Fireplace"		,glyph:""	,dbName:"Fireplace"},
				{name:"Pets Allowed"	,glyph:""	,dbName:"PetsAllowed"},
				{name:"Pool"			,glyph:""	,dbName:"Pool"},
				{name:"Smoking Allowed" ,glyph:""	,dbName:"SmokingAllowed"}],
			   [{name:"Washer"			,glyph:""	,dbName:"Washer"},
				{name:"Accessibility"	,glyph:""	,dbName:"Accessibility"}]
	];

	$scope.amenityCheck = function(name){
		if(!(typeof amenities === 'undefined')){
			if(!(typeof amenities[name] === 'undefined') && amenities[name]){
				return 'glyphicon glyphicon-check';
			} else {
				return 'glyphicon glyphicon-unchecked';
			}
		}
	}

	uiGmapGoogleMapApi.then(function(maps) {

    });


    

})
