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
.controller("newHomeCtrl",function($scope,$http, $window, appData){


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
				$window.location.reload();
    		})
    }

    $scope.photos = [
		[	{ type: 'profile' , name: 'Profile', frameName: 'profileFrame'},
			{ type: 'cover'   , name: 'Cover Photo', frameName:'coverFrame'},
			{ type: 'pic1' 	  , name: 'Another Photo', frameName:'pic1Frame'},
			{ type: 'pic2' , name: 'Another Photo', frameName:'pic2Frame'}],
		[	{ type: 'pic3' , name: 'Another Photo', frameName:'pic3Frame'},
			{ type: 'pic4' , name: 'Another Photo', frameName:'pic4Frame'},
			{ type: 'pic5' , name: 'Another Photo', frameName:'pic5Frame'},
			{ type: 'pic6' , name: 'Another Photo', frameName:'pic6Frame'}
		]
	];

	$scope.frameName = ['profileFrame','coverFrame','pic1Frame','pic2Frame','pic3Frame','pic4Frame','pic5Frame','pic6Frame'];

	$scope.chooseFile = function(picType) {
      document.getElementById(picType).click();
    }

	$scope.submit = function(picType){
		document.forms[picType].submit();
	}

		//an array of files selected
	    $scope.files = [];

	    //listen for the file selected event
	    $scope.$on("fileSelected", function (event, args) {
	        $scope.$apply(function () {            
	            //add the file object to the scope's files collection
	            $scope.files.push(args.file);
	        });
	    });
	    
	    $scope.model = {
	        name: "",
	        comments: ""
	    };
	    //the save method
	    $scope.save = function() {
	        $http({
	            method: 'POST',
	            url: "/upload/pic5",
	            //IMPORTANT!!! You might think this should be set to 'multipart/form-data' 
	            // but this is not true because when we are sending up files the request 
	            // needs to include a 'boundary' parameter which identifies the boundary 
	            // name between parts in this multi-part request and setting the Content-type 
	            // manually will not set this boundary parameter. For whatever reason, 
	            // setting the Content-type to 'false' will force the request to automatically
	            // populate the headers properly including the boundary parameter.
	            headers: { 'Content-Type': false },
	            //This method will allow us to change how the data is sent up to the server
	            // for which we'll need to encapsulate the model data in 'FormData'
	            transformRequest: function (data) {
	                var formData = new FormData();
	                //need to convert our json object to a string version of json otherwise
	                // the browser will do a 'toString()' on the object which will result 
	                // in the value '[Object object]' on the server.
	                formData.append("model", angular.toJson(data.model));
	                //now add all of the assigned files
	                for (var i = 0; i < data.files; i++) {
	                    //add each file to the form data and iteratively name them
	                    formData.append("file" + i, data.files[i]);
	                }
	                return formData;
	            },
	            //Create an object that contains the model and files which will be transformed
	            // in the above transformRequest method
	            data: { model: $scope.model, files: $scope.files }
	        }).
	        success(function (data, status, headers, config) {
	            alert("success!");
	        }).
	        error(function (data, status, headers, config) {
	            alert("failed!");
	        });
	    };
})
.controller('homeCtrl', function($scope,$http,$state,uiGmapGoogleMapApi,appData,addressData,photos){
	var amenities = {};

	$scope.photosUrl = photos;
	console.log($scope.photosUrl);

	$scope.homeImage = {
    	background: 'url(' + $scope.photosUrl.cover + ')'
	};

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