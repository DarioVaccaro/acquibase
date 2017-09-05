acquibaseApp.directive('navAccounts' , function() {
	return {
		restrict: 'E',
		template: '<ul ng-hide="isLoggedIn"><li id="login"><a href="/login">Login</a></li><li id="register"><a href="/register">Register</a></li></ul><ul ng-show="isLoggedIn"><li id="profile-link"><a href="/profile">Profile</a></li></ul>',
	}
});