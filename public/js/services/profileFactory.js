acquibaseApp.factory('profileFactory' , ['$http' , function($http) {
	return {
		get : function(userID) {
			return $http.post('/api/profiles' , userID);
		}
	}
}]);