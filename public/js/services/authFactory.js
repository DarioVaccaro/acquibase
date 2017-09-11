acquibaseApp.factory('authenticationService',['$http', '$window', '$timeout', '$q' , function($http, $window, $timeout, $q) {
	var saveToken = function(token){
		$window.localStorage['jwt'] = token;
	}
	var getToken = function(){
		return $window.localStorage['jwt'];
	}
	var logout = function(){
		$window.localStorage.removeItem('jwt');
	}
	var isLoggedIn = function() {
		var token = getToken();
		var payload;

		if(token) {
			payload = token.split('.')[1];
		    payload = $window.atob(payload);
		    payload = JSON.parse(payload);

		    return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	}
	var currentUser = function() {
		if(isLoggedIn()) {
			var token = getToken();
		    var payload = token.split('.')[1];
		    payload = $window.atob(payload);
		    payload = JSON.parse(payload);
		    if(payload.name) {
		    	return {
			      email : payload.email,
			      name : payload.name
			    };
		    } else if(payload.username) {
		    	return {
			      username : payload.username,
			      displayName : payload.displayName
			    };
		    }
		}
	}
	register = function(user) {
	  return $http.post('/api/register', user).success(function(data){
	    saveToken(data.token);
	  });
	};

	login = function(user) {
	  return $http.post('/api/login', user).success(function(data) {
	    saveToken(data.token);
	  });
	};
	return {
		saveToken: saveToken,
		getToken: getToken,
		isLoggedIn: isLoggedIn,
		currentUser: currentUser,
		register: register,
		login: login,
		logout: logout
	};
}]);