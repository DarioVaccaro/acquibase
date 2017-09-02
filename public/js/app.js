var acquibaseApp = angular.module('acquibaseApp' , []);
var companyURL = '/api/companies';
acquibaseApp.config(function($locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		rewriteLinks: false
	});
});