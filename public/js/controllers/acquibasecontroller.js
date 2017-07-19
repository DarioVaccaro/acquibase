acquibaseApp.controller('acquibaseController' , ['$scope' , '$http' , 'acquibaseFactory', function($scope , $http , acquibaseFactory) {
	acquibaseFactory.get()
		.success(function(data) {
            angular.forEach(data, function(value, key) {

            })
            $scope.companys = data;
        });
        //If URL after / is the same as a company name
        console.log(company.company.name);
        if($location.path() === company.company.name) {
        	//set scope to only access the doucment with the
        	//url path as it's name WRONG CODE
        	$scope.thisCompany = this._id;
        	console.log(this);
        }
}]);