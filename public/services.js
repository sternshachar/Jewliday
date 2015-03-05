angular.module("jewApp")
.service('appData', function($http){
	var homeSelected = {};
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
	    {name:'Your Home',url:"users/home"},
	    {name:'Inbox',url:"users/inbox/incoming"},
	    {name:'Log Out',url:"users/profile"}
	  ];

	  addressData = function(url){
								var promise = $http.get(url + '/login')								
									.then(function(result){
										
										if( result.data.user.house.city != undefined){
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
							},
		getHomeSelect = function(){
			console.log(homeSelected);
			return this.homeSelected;
		},

		homeSelect = function(home){
			this.homeSelected = home;
			return this.homeSelected;
		}



	return{
		url: url,

		imageUrl: imageUrl,

		amenitiesHomeView: amenitiesHomeView, //for homeCtrl

		amenitiesListHome: amenitiesListHome, //for newHomeCtrl

		dropdownUserMenu: dropdownUserMenu,	  //for mainCtrl - item for user dropdown menu

		addressData: addressData,

		amenitiesFilter: amenitiesFilter,

		getHomeSelect: getHomeSelect,

		homeSelect: homeSelect
	}
})
