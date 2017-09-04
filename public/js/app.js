var acquibaseApp = angular.module('acquibaseApp' , ['ngRoute']);
var companyURL = '/api/companies';
acquibaseApp.config(function($routeProvider , $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: './ui/home.html',
		}).when('/compare', {
			templateUrl: './ui/compare.html',
		}).when('/contact', {
			templateUrl: './ui/contact.html',
		}).when('/login', {
			templateUrl: './ui/login.html',
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
      }
    });
});