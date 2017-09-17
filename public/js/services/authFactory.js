acquibaseApp.factory('authenticationService',['$http', '$rootScope' , '$location' ,'$window', '$timeout', '$q' , function($http, $rootScope, $location , $window, $timeout, $q) {
	var saveToken = function(token){
		if(token !== undefined) {
			$window.localStorage['jwt'] = token;
		}
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
	    if(data.token) {
	  		saveToken(data.token);
	  	} else {
	  		$rootScope.formError = data.message;
	  	}
	  });
	};

	login = function(user) {
	  return $http.post('/api/login', user).success(function(data) {
	  	if(data.token) {
	  		saveToken(data.token);
	  	} else {
	  		$rootScope.formError = data.message;
	  	}
	  });
	};
	forgot = function(user) {
		return $http.post('/api/forgot', user).success(function(data) {
			$rootScope.formError = data.message;
		});
	};
	reset = function(user) {
		return $http.post('/api/reset/' + $location.path().replace('/login/reset/' , '') , user).success(function(data) {
			if(data.token) {
				saveToken(data.token);
			} else {
				$rootScope.formError = data.message;
			}
		})
	}
	return {
		saveToken: saveToken,
		getToken: getToken,
		isLoggedIn: isLoggedIn,
		currentUser: currentUser,
		register: register,
		login: login,
		logout: logout,
		forgot: forgot,
		reset: reset
	};
}]);