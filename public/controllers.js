angular.module("jewApp")

.controller("mainCtrl",function($scope,$interval,$http,$location){
	$scope.username = "";
	$scope.isAuth = false;
	$scope.sign = false;
	$scope.login = true;
	$scope.user = {};
	$scope.userLog = {};
	$scope.signMessage = "Enter email";
	$scope.inbox ={state: false};
	var url = "http://ec2-54-149-52-21.us-west-2.compute.amazonaws.com:8080";
	
	$http.get(url + '/login').
		success(function(data){
		$scope.isAuth = data.isAuthenticated;
		$scope.username = data.user.firstName;
		$scope.userLastName = data.user.lastName;
		$scope.userId = data.user._id;
		console.log($scope.userId);
	});

	$scope.logOut = function(){
		$http.get(url + '/logout')
			.success(function(data){
				$scope.isAuth = data.isAuthenticated;
				$location.path('/');
			})
	}
	$scope.signUp = function(){
		// console.log('sending: ' + $scope.user.firstName + $scope.user.lastName)
		$scope.user.firstName = $scope.user.firstName[0].toUpperCase() + $scope.user.firstName.substring(1).toLowerCase();
		$scope.user.lastName = $scope.user.lastName[0].toUpperCase() + $scope.user.lastName.substring(1).toLowerCase();
		$http.post(url + '/signup',$scope.user)
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
		$http.post(url + "/login",$scope.userLog)
			.success(function(data){
				if(data.message){
					$scope.message = data.message;
					console.log(data.message);
					$scope.userLog = {};
				} else {

						$http.get(url + '/login').
							success(function(data){
								$scope.isAuth = data.isAuthenticated;
								$scope.username = data.user.firstName;
								$scope.userLastName = data.user.lastName;
								$scope.userId = data.user._id;
								console.log(data);
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
	    'Profile',
	    'Inbox',
	    'Your Home',
	    'Log Out'
	  ];

	  $scope.userTab = {name:'inbox'};
})

.controller("inboxCtrl",function($scope,$http){
	var url = "http://ec2-54-149-52-21.us-west-2.compute.amazonaws.com:8080";
	$scope.messageData = {
		uid: $scope.userId,
		sender: $scope.username + ' ' + $scope.userLastName,
		subject: "",
		content: ""
	};

	$scope.tabs = [
		{name: "incoming", active: true},
		{name: "sent", active: false},
		{name: "saved", active: false}
	];
	$http.get(url + '/inbox/' + $scope.userId)
		.success(function(data){
			$scope.messages = data[0].messages;
			console.log(data);
		});

	$scope.sendMessage = function(){
		console.log('sending');
		$http.post(url + '/inbox/' + $scope.userId, $scope.messageData)
			.success(function(data){
				console.log(data);
			});
	}

	$scope.pickInboxTab = function(tab){
		console.log($scope.tabs);
		for (var i = 0; i < $scope.tabs.length; i++) {
			if($scope.tabs[i].name == tab){
				$scope.tabs[i].active = true;
			} else {
				$scope.tabs[i].active = false;
			}
		};
	}

	$scope.activeInboxTab = function(tab){
		for (var i = 0; i < $scope.tabs.length; i++) {
			if($scope.tabs[i].active == true && $scope.tabs[i].name == tab)
				return 'active';

		};
		return ' ';
	}
	
})

.controller("newHomeCtrl",function($scope,$http){
	$scope.home = {};
	$scope.options = {types: '(cities)'};
	$scope.amenities = [
				["TV", "Wi-fi", "AirCondition","Dryer"],
				["Elevator", "Essentials", "Free parking","Heating"],
				["Fireplace", "Pets allowed", "Pool","Smoking allowed"],
				["Washer", "Accessibility"],
	];

	$scope.step = [
		{level:"Address", active: true},
		{level:"Details & Amenities", active: false},
		{level:"Pictures & Description", active: false}
	];

	$scope.goToStep = function(stepName){
		for (var i = 0; i < $scope.step.length; i++) {
			if($scope.step[i].level == stepName){
				$scope.step[i].active = true;
			} else {
				$scope.step[i].active = false;
			}
		};
	}
	// {
 //      country: 'ca',
 //      types: '(cities)'
 //    };
})
