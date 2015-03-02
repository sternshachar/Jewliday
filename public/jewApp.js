angular.module("jewApp",["ngAnimate","ui.bootstrap","ngRoute","ngAutocomplete","ui.router",'uiGmapgoogle-maps','angularFileUpload'])
			.config(function($stateProvider,$urlRouterProvider,uiGmapGoogleMapApiProvider){
				    uiGmapGoogleMapApiProvider.configure({
				        //    key: 'your api key',
				        v: '3.17',
				        libraries: 'weather,geometry,visualization'
				    });
				    $urlRouterProvider
				      .when('/users/inbox', ['$state', function ($state) {
				            $state.go('usersArea.inbox.incoming');
				    }])
				     $urlRouterProvider
				      .when('/users/home', ['$state', function ($state) {
				            $state.go('usersArea.home.photos');
				    }])
				    $urlRouterProvider
				      .when('/users/search', ['$state', function ($state) {
				            $state.go('usersArea.search.list');
				    }])

    				$stateProvider
					.state('home',{
						url:'/',
						templateUrl: "views/main.html"
					})
					.state('usersArea',{
						url:'/users',
						templateUrl: "views/user.html"
					})
					.state('usersArea.profile',{
						url:'/profile',
						templateUrl:'views/users.profile.html'
					})
					.state('usersArea.inbox',{
						url:'/inbox',
						templateUrl:'views/users.inbox.html',
						controller: 'inboxCtrl'
					})
					.state('usersArea.home',{
						url:'/home',
						templateUrl:'views/users.home.html',
						controller: 'homeCtrl',
						resolve: {
							addressData : function(appData){
								appData.addressData();
							},

							photos: function($http,appData){
								var promise = $http.get(appData.url + '/login')
									.then(function(result){
										return result.data.user.photos;
									})

									return promise;
							}
						} 
					})
					.state('usersArea.search',{
						url:'/search',
						templateUrl:'views/users.search.html'
					})
					.state('usersArea.search.list',{
						url:'/search/list',
						templateUrl:'views/users.search.list.html'
					})
					.state('usersArea.search.map',{
						url:'/search/map',
						templateUrl:'views/users.search.map.html'
					})

					.state('usersArea.inbox.incoming',{
						url:'/incoming',
						templateUrl:'views/users.inbox.incoming.html'
					})
					.state('usersArea.inbox.sent',{
						url:'/sent',
						templateUrl:'views/users.inbox.sent.html'
					})
					.state('usersArea.inbox.saved',{
						url:'/saved',
						templateUrl:'views/users.inbox.saved.html'
					})
					.state('usersArea.home.location',{
						url:'/location',
						templateUrl:'views/users.home.locationDetails.html'
					})
					.state('usersArea.home.photos',{
						url:'/photos',
						templateUrl:'views/users.home.photosDescription.html'
					})
					.state('usersArea.home.reviews',{
						url:'/reviews',
						templateUrl:'views/users.home.reviews.html'
					})
					.state('listHome',{
						url: '/listHome',
						templateUrl: 'views/listHome.html',
						controller: 'newHomeCtrl',
						resolve: {
							homeData: function($http,appData){
								var promise = $http.get(appData.url + '/login')
									.then(function(result){
										return result.data.user.house;
									})
									return promise;
							}
						}
					})
					.state('listHome.address',{
						url: '/address',
						templateUrl: 'views/listHome.address.html'
					})
					.state('listHome.details',{
						url: '/details',
						templateUrl: 'views/listHome.details.html'
					})
					.state('listHome.photos',{
						url: '/photos',
						templateUrl: 'views/listHome.photos.html'
					})
			})