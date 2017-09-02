angular.module( 'acquibaseApp')
.filter('wordifyValuation',function() {
	return function(number) {
		number = Math.abs(number);
		number > 999999999999 ? number = "$" + (number / Math.pow(10 , 12)).toFixed(1) + " Trillion" :
		number > 999999999 ? number = "$" + (number / Math.pow(10 , 9)).toFixed(1) + " Billion" : 
		number > 999999 ? number = "$" + (number / Math.pow(10 , 6)).toFixed(1) + " Million" :
		number > 999 ? number = "$" + (number / Math.pow(10 , 3)).toFixed(1) + " Thousand" :
		number > 1 ? "$" + (number / Math.pow(10 , 1)) :
		number = "Undisclosed";
		return number;
	}
}).filter('reverse' , function() {
	return function(items) {
		return items.slice().reverse();
	}
}).filter('isInc', function() {
	return function(inc) {
		inc === true ? inc = 'Inc.' : inc = '';
		return inc;
	}
}).filter('absoluteCompare' , function() {
	return function(value) {
		if(value >= 0) {
			return ' more';
		} else {
			return ' less';
		}
	}
});