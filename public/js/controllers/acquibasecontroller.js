acquibaseApp.controller('dataAccessController' , ['$scope' , '$http' , 'acquibaseFactory', function($scope , $http , acquibaseFactory) {
    acquibaseFactory.get()
        .success(function(data) {
            $scope.companys = data;
            $scope.acquisitionData = [];
            angular.forEach(data, function(value, key) {
                $scope.acquisition = $scope.companys[key].company.acquisition;
                $scope.acquisition.parentCompany = $scope.companys[key].company.name;
                angular.forEach($scope.acquisition, function(value, key) {
                    value.parentCompany = $scope.acquisition.parentCompany;
                    $scope.acquisitionData[$scope.acquisitionData.length] = value;
                });
            })
            //orderBy $scope.acquisitionData
            console.log(data[0].company.acquisition[0].date);
        });
}]);
acquibaseApp.controller('dataRestrictController' , ['$scope' , '$http' , '$location' , 'acquibaseFactory', function($scope , $http, $location , acquibaseFactory) {
    acquibaseFactory.get()
        .success(function(data) {
            angular.forEach(data, function(value , key) {
                if(value.company.name === $location.path().replace('/' , '')) {
                     $scope.thisCompany = value.company;
                }
            })
            $scope.undisclosed = [];
            $scope.acquiPriceHistory = 0;
            angular.forEach($scope.thisCompany.acquisition , function(value , key) {
                value.acquisitionPrice > -1 ? $scope.acquiPriceHistory += value.acquisitionPrice :
                $scope.undisclosed.push(value.acquisitionPrice);
            });
        });
        //scope.undisclsed function
}]);