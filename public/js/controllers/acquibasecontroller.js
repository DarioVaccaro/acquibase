acquibaseApp.controller('dataAccessController' , ['$scope' , '$http' , 'acquibaseFactory', function($scope , $http , acquibaseFactory) {
	acquibaseFactory.get()
		.success(function(data) {
            angular.forEach(data, function(value, key) {

            })
            $scope.companys = data;
            console.log($scope.companys);
        });
}]);
acquibaseApp.controller('dataRestrictController' , ['$scope' , '$http' , '$location' , '$filter', function($scope, $http, $location, $filter) {
        //set scope to only access the doucment with the
        //url path as it's name WRONG CODE
        console.log($location.path().replace('/' , ''));
        // $scope.thisCompany = companys.findOne($location.path);
        $scope.findUrlInDatabase = function(){
        	var filter = $filter('urlDataFilter')($scope.companys, {name: $location.path().replace('/' , '')}); 
        	console.log(filter);
        	if(filter.length) {
        		$scope.companys = filter;
        	}
        	console.log($scope.companys);
        };
}]);