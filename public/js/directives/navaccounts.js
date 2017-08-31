acquibaseApp.directive('navAccounts' , function() {
	return {
		restrict: 'E',
		template: '<ul><li id="login"><a href="/login">Login</a></li><li id="register"><a href="/register">Register</a></li></ul>',
	}
});