acquibaseApp.factory('restrictData', function($http, authenticationService) {
	var getProfile = function() {
		return $http.get('/api/profile', {
			headers: {
				Authorization: 'Bearer ' + authenticationService.getToken()
			}
		});
	}
	return {
		getProfile: getProfile
	}
});