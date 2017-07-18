acquibaseApp.factory('acquibaseFactory' , function($http) {
	return {
		get : function() {
			return $http.get(companyURL);
		}
	}
});