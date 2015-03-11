angular.module("jewApp")
.service('appData', function($http){
	
	url = "http://ec2-52-10-151-222.us-west-2.compute.amazonaws.com:8080",

	imageUrl = 'https://s3-us-west-2.amazonaws.com/jewliday/',

	amenitiesHomeView = [
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
	amenitiesFilter = [
			   [{name:"TV"				,glyph:""	,dbName:"TV"},
				{name:"WI-FI"			,glyph:""	,dbName:"wifi"},
				{name:"Air Condition"	,glyph:""	,dbName:"AirCondition"}],
			   [{name:"Dryer"			,glyph:""	,dbName:"Dryer"},
			    {name:"Elevator"		,glyph:""	,dbName:"Elevator"},
				{name:"Essentials"		,glyph:""	,dbName:"Essentials"}],
			   [{name:"Free Parking"	,glyph:""	,dbName:"FreeParking"},
				{name:"Heating"			,glyph:""	,dbName:"Heating"},
			    {name:"Fireplace"		,glyph:""	,dbName:"Fireplace"}],
			   [{name:"Pets Allowed"	,glyph:""	,dbName:"PetsAllowed"},
				{name:"Pool"			,glyph:""	,dbName:"Pool"},
				{name:"Smoking Allowed" ,glyph:""	,dbName:"SmokingAllowed"}],
			   [{name:"Washer"			,glyph:""	,dbName:"Washer"},
				{name:"Accessibility"	,glyph:""	,dbName:"Accessibility"}]
	];
	amenitiesListHome = [
				["TV", "wifi", "AirCondition","Dryer"],
				["Elevator", "Essentials", "FreeParking","Heating"],
				["Fireplace", "PetsAllowed", "Pool","SmokingAllowed"],
				["Washer", "Accessibility"],
	];

	dropdownUserMenu =  [
	    {name:'Profile',url: "users/profile"},
	    {name:'My Home',url:"users/home"},
	    {name:'Inbox',url:"users/inbox/incoming"},
	    {name:'Log Out',url:"users/profile"}
	  ];

	  addressData = function(url){
								var promise = $http.get(url + '/login')								
									.then(function(result){
										
										if( result.data.user.house.city || result.data.user.house.city != undefined){
											var city = result.data.user.house.city.split(", ").join("+");
											var address =   result.data.user.house.homeNumber + '+' + result.data.user.house.street +',' + '+' + city;
											return address;
										}
										// throw 'Not listed properly';
									})
									.then(function(result){
										var location = $http.get('http://maps.google.com/maps/api/geocode/json?address='+ result +'&sensor=false')
										.then(function(result){
											return result.data.results[0].geometry.location;
										},function(err){
											console.error(err);
										})
										return location;
									})
									return promise;
							}
	return{
		url: url,

		imageUrl: imageUrl,

		amenitiesHomeView: amenitiesHomeView, //for homeCtrl

		amenitiesListHome: amenitiesListHome, //for newHomeCtrl

		dropdownUserMenu: dropdownUserMenu,	  //for mainCtrl - item for user dropdown menu

		addressData: addressData,

		amenitiesFilter: amenitiesFilter

	}
})

.factory('homeSearch',function(){
		var homeSelected = {};

		return{
			getHomeSelect: function(){
				return homeSelected;
			},

			homeSelect: function(home){
				homeSelected = home;
				return homeSelected;
			}
			
		}
})
.factory('userService',function($http,appData,$q){
		var userData = {
				id : {},
			 	isAuth :false,
			 	firstName :'',
			 	lastName : '',
			 	isListed : false
			 }
		var homeData = {};
		var photosUrl = {};


		return{
			getUserData: function(){
					var promise = $http.get(appData.url + '/login').
						then(function(result){
							userData.isAuth = result.data.isAuthenticated;
							if(userData.isAuth){
								userData.id = result.data.user._id;
								userData.firstName = result.data.user.firstName;
								userData.lastName = result.data.user.lastName;
								userData.isListed = result.data.user.house.listed;
								if(userData.isListed){ // if user listed a house, get photos & house
									homeData = result.data.user.house;
									photosUrl = result.data.user.photos;
								}
								console.log('userData Loaded');
							}
							return userData;
					});
				return promise;
			},

			getData: function(){
				var deferred = $q.defer();
				deferred.resolve({userData:userData, homeData: homeData, photosUrl: photosUrl});
				return deferred.promise;
			},
			login: function(credntials){
				var deferred = $q.defer();
				$http.post(appData.url + "/login",credntials)
					.success(function(data){
						console.log(data);
						if(data.message)
							deferred.reject(data.message)
						else{
							userData.id = data.data.user._id;
							userData.firstName = data.data.user.firstName;
							userData.lastName = data.data.user.lastName;
							userData.isListed = data.data.user.house.listed;
							if(userData.isListed){ // if user listed a house, get photos & house
								homeData = data.data.user.house;
								photosUrl = data.data.user.photos;
							}
							console.log('userData Loaded');
							deferred.resolve({userData:userData, homeData: homeData, photosUrl: photosUrl});
						}
					})

				return deferred.promise;
			},
			userData: userData
			
		}
})

.factory("inboxService", function($http,$filter,appData){
	var inbox = {conversations:{},unread: 0};
	var orderBy = $filter('orderBy');
	return {
		getInbox: function(inboxOwnerId){
			console.log('Loading inbox');	
			var promise = $http.get(appData.url + '/inbox/' + inboxOwnerId)// move to resolve //see how to pull messages
			.then(function(result){
				inbox.unread = 0;
				if(result.data[0]){
					inbox.conversations = result.data[0].conversations;
					 inbox.conversations = orderBy(inbox.conversations, 'lastMessage',true);
					 for (var i = 0; i < inbox.conversations.length; i++) { //check num of unread
					 	for (var j = 0; j < inbox.conversations[i].messages.length; j++) {
					 		if(!inbox.conversations[i].messages[j].read)
					 			inbox.unread += 1;
					 	};
					 };
					
				} else{
					console.log('No messages')
				}
				return inbox;
			})
			return promise;
		}
	}
})


