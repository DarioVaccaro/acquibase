acquibaseApp.controller('acquibaseController' , ['$scope' , '$http' , 'acquibaseFactory', function($scope , $http , acquibaseFactory) {
	acquibaseFactory.get()
		.success(function(data) {
            angular.forEach(data, function(value, key) {

            })
            $scope.companys = data;
        });
}]);