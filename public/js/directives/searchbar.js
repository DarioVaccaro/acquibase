acquibaseApp.directive('searchbar' , function() {
	return {
		restrict: 'E',
		template: '<div ng-show="searchToggle" searchinput id="search-bar"><div ng-click="!searchCheck()" id="lightbox"></div></div>',
	}
});
acquibaseApp.directive('searchinput' , function() {
	return function(scope, element, attrs) {
		angular.element(document.getElementById('search-bar')).append('<input placeholder="search"></input>');
	}
});