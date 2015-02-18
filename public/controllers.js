angular.module("jewApp")

.controller("mainCtrl",function($scope,$interval,$http,$location,$state){
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
	    {name:'Profile',url: "users/profile"},
	    {name:'Your Home',url:"users/home"},
	    {name:'Inbox',url:"users/inbox/incoming"},
	    {name:'Log Out',url:"users/profile"}
	  ];

	  $scope.userTab = {name:'inbox'};

	  $scope.inboxActive = function(){
	  	if($state.includes('usersArea.inbox.incoming') || $state.includes('usersArea.inbox.sent') || $state.includes('usersArea.inbox.saved'))
	  	{return 'active';} else {return '';}
	  }
})

.controller("inboxCtrl",function($scope,$http,$state){
	var url = "http://ec2-54-149-52-21.us-west-2.compute.amazonaws.com:8080";

	$scope.messageData = {
		uid: $scope.userId,
		sender: $scope.username + ' ' + $scope.userLastName,
		subject: "",
		content: ""
	};

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
	$scope.details = "";
	  $scope.file = null;
      
      $scope.$watch('file', function (newVal) {
        if (newVal)
          console.log(newVal);
      })
	$scope.upload = function () {
      console.log($scope.file); // This is where the file is linked to.
    };

    $scope.showHome = function(){
    	console.log($scope.home);
    }
	// {
 //      country: 'ca',
 //      types: '(cities)'
 //    };
})
