var acquibaseApp = angular.module('acquibaseApp' , ['ngRoute' , 'ngCookies']);
var companyURL = '/api/companies';
acquibaseApp.config(function($routeProvider , $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: './ui/index.html',
		}).when('/compare', {
			templateUrl: './ui/compare.html',
		}).when('/about', {
			templateUrl: './ui/about.html',
		}).when('/contact', {
			templateUrl: './ui/contact.html',
		}).when('/login', {
			templateUrl: './ui/login.html',
		}).when('/login/forgot', {
			templateUrl: './ui/forgot.html',
		}).when('/login/reset/:resetToken?' , {
			templateUrl: './ui/reset.html'
		}).when('/register', {
			templateUrl: './ui/register.html',
		}).when('/profile', {
			templateUrl: './ui/profile.html',
		});
	$locationProvider.html5Mode(true);
});
acquibaseApp.run(function($rootScope, $location, authenticationService) {
	$rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
      if ($location.path() === '/profile' && !authenticationService.isLoggedIn()) {
        $location.path('/');
      } if ($location.path() === '/register' && authenticationService.isLoggedIn()){
      	$location.path('/');
      } if ($location.path() === '/login' && authenticationService.isLoggedIn()){
      	$location.path('/');
      } if ($location.path() === '/login/forgot' && authenticationService.isLoggedIn()){
      	$location.path('/');
      }
    });
});