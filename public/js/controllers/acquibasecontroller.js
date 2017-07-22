acquibaseApp.controller('dataAccessController' , ['$scope' , '$http' , 'acquibaseFactory', function($scope , $http , acquibaseFactory) {
    acquibaseFactory.get()
        .success(function(data) {
            angular.forEach(data, function(value, key) {
            	$scope.acquisition = data[key].company.acquisition;
            })
            $scope.companys = data;
            console.log($scope.acquisition);
        });
}]);
acquibaseApp.controller('dataRestrictController' , ['$scope' , '$http' , '$location' , 'acquibaseFactory', function($scope , $http, $location , acquibaseFactory) {
    acquibaseFactory.get()
        .success(function(data) {
            var test;
            angular.forEach(data, function(value , key) {
                if(value.company.name === $location.path().replace('/' , '')) {
                     $scope.thisCompany = value.company;
                }
            })
            console.log($scope.thisCompany);
        });
}]);