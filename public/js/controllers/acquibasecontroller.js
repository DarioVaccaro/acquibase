const todaysDate = new Date();
acquibaseApp.controller('dataAccessController' , ['$scope' , '$http' , '$location' , '$window', 'acquibaseFactory' , function($scope , $http , $location, $window , acquibaseFactory) {
	acquibaseFactory.get()
		.success(function(data) {
			//Sets $scope to the array of documents in the database
			$scope.companys = data;
			angular.forEach(data, function(value , key) {
				if(value.company.name === $location.path().replace('/company/' , '')) {
					var dataArray = [];
					$scope.thisCompany = value.company;
					//Iterate through database and generate dataArray for each entry.
					//Save dataArray as a Blob with a /:company.name URL
					//Access Blob from homepage and render graphs
					angular.forEach($scope.thisCompany.acquisition , function(value , key) {
						dataArray.push({
							'x_axis': new Date($scope.thisCompany.acquisition[key].date),
							'y_axis': new Date(2012, new Date($scope.thisCompany.acquisition[key].date).getMonth()),
							'radius': $scope.thisCompany.acquisition[key].acquisitionPrice,
							'color': $scope.thisCompany.acquisition[key].acquisitionPrice
						});
					})
					//Opacity and Size 
					var foundedOn = new Date($scope.thisCompany.foundedOn);
					const selectGraph = d3.select('#acquisition-history-chart').append('svg')
						.attr('width' , '100%')
						.attr('height' , '100%');
					const xScale = d3.scaleTime()
						.domain([foundedOn , todaysDate])
						.range([0 , 700]);
					const yScale = d3.scaleTime()
						.domain([new Date(2012, 11, 31) , new Date(2012, 0, 1)])
						.range([240 , 0]);
					const xAxis = d3.axisBottom()
						.scale(xScale);
					const yAxis = d3.axisLeft()
						.scale(yScale)
						.tickFormat(d3.timeFormat("%b"));
					const circles = selectGraph.selectAll('circle')
						.data(dataArray);
					const drawCircles = circles.enter();
					drawCircles.append('circle')
						.attr('transform', 'translate(50, 35)')
						.attr('cx' , function(d) { return xScale(d.x_axis); })
						.attr('cy' , function(d) { return yScale(d.y_axis); })
						.attr('r' , function(d) { 
							if(d.radius <= 0) {
								return d.radius = 8;
							}
							d.radius = 19 / d.radius;
							return d.radius + 5; 
						})
						.style('fill' , function(d) { 
							d.color > -1 ? d.color = '#00FFC9' : d.color = '#F20278';
							return d.color; 
						});
					selectGraph.append('g')
						.attr('transform', 'translate(50, 260)')
						.attr('class' , 'xAxis')
						.call(xAxis);
					selectGraph.append('g')
						.attr('transform', 'translate(20, 35)')
						.attr('class' , 'yAxis')
						.call(yAxis);

					var stockArray = [];
					angular.forEach($scope.thisCompany.stock.historicalPrice, function(value, key) {
						stockArray.push({
							x_axis: new Date(value.date),
							y_axis: value.close
						});
					})
					const stockGraph = d3.select('#stock-history-chart').append('svg')
						.attr('width' , '100%')
						.attr('height' , '100%');
					const xScaleStock = d3.scaleTime()
						.domain([d3.min(stockArray, function(d) { return d.x_axis; })  , d3.max(stockArray, function(d) { return d.x_axis; })])
						.range([0 , 350]);
					const yScaleStock = d3.scaleLinear()
						.domain([0 , d3.max(stockArray, function(d) { return d.y_axis; })])
						.range([130 , 0]);
					const xAxisStock = d3.axisBottom()
						.scale(xScaleStock)
						.tickFormat(d3.timeFormat("%Y"));
					const yAxisStock = d3.axisLeft()
						.scale(yScaleStock);
					const dots = stockGraph.selectAll('circle')
						.data(dataArray);
					const drawDots = dots.enter();
					drawDots.append('circle')
						.attr('transform', 'translate(45, 0)')
						.attr('cx' , function(d) { return xScale(d.x_axis); })
						.attr('cy' , 0)
						.attr('r' , 2)
						.style('fill' , function(d) { 
							d.color > -1 ? d.color = '#00FFC9' : d.color = '#F20278';
							return d.color; 
						});
					var line = d3.line()
						.x(function(d) { return xScaleStock(d.x_axis); })
						.y(function(d) { return yScaleStock(d.y_axis); })
						.curve(d3.curveMonotoneX);
					stockGraph.append('g')
						.attr('transform', 'translate(35, 0)')
						.attr('class' , 'yAxis')
						.call(yAxisStock);
					stockGraph.append('g')
						.attr('transform', 'translate(45, 130)')
						.attr('class' , 'xAxis')
						.call(xAxisStock);
					stockGraph.append('path')
						.datum(stockArray)
						.attr('transform', 'translate(45, 0)')
						.attr("class", "line")
						.attr('stroke', '#F20278')
						.attr('stroke-width', '2')
						.attr('fill', '#1B1B1B')
						.attr("d", line);
				}
			})
			//Initalizes an array for all acquisitions
			$scope.acquisitionData = [];
			//Iterates through the entire database
			angular.forEach(data, function(value, key) {
				//Sets $scope to array of acquisitions for each company
				$scope.acquisition = $scope.companys[key].company.acquisition;
				//Sets a parent company for a callback to each parent document
				$scope.acquisition.parentCompany = $scope.companys[key].company.name;
				//Iterates through each acquisitions and adds all acquisitions to the acquisitionData array
				angular.forEach($scope.acquisition, function(value, key) {
					value.parentCompany = $scope.acquisition.parentCompany;
					$scope.acquisitionData[$scope.acquisitionData.length] = value;
					$scope.acquisitionData.sort(function(a , b) {
						return new Date(a.date) - new Date(b.date);
					});
					$scope.acquisitionData.reverse();
				});
			})
			var historyArray = [];
			for(i = 0; i <= 30; i++) {
				historyArray[i] = {
					x_axis: new Date(todaysDate - ((24*60*60*1000) * i)),
					y_axis: 0
				};
			}
			angular.forEach($scope.acquisitionData, function(value, key) {
				for(i = 0; i <= 30; i++) {
					if(new Date(value.date).getFullYear() === new Date(todaysDate - ((24*60*60*1000) * i)).getFullYear() && new Date(value.date).getMonth() === new Date(todaysDate - ((24*60*60*1000) * i)).getMonth() && new Date(value.date).getDate() === new Date(todaysDate - ((24*60*60*1000) * i)).getDate()) {
						historyArray[i].y_axis += 1;;
					}
				}
			}) 
			const historyGraph = d3.select('#compared-data-chart').append('svg')
				.attr('width' , '100%')
				.attr('height' , '100%');
			const xScaleHist = d3.scaleTime()
				.domain([new Date(todaysDate - (24*60*60*1000) * 30)  , todaysDate])
				.range([0 , 375]);
			const yScaleHist = d3.scaleLinear()
				.domain([0 , d3.max(historyArray, function(d) { return d.y_axis; })])
				.range([130 , 0]);
			const xAxisHist = d3.axisBottom()
				.scale(xScaleHist)
				.tickFormat(d3.timeFormat("%b %d"));
			const yAxisHist = d3.axisLeft()
				.scale(yScaleHist);
			var line = d3.line()
				.x(function(d) { return xScaleHist(d.x_axis); })
				.y(function(d) { return yScaleHist(d.y_axis); })
				.curve(d3.curveMonotoneX);
			historyGraph.append('g')
				.attr('transform', 'translate(-5, 140)')
				.attr('class' , 'xAxis')
				.call(xAxisHist);
			historyGraph.append('path')
				.datum(historyArray)
				.attr('transform', 'translate(-5, 0)')
				.attr("class", "line")
				.attr('stroke', '#F20278')
				.attr('stroke-width', '2')
				.attr('fill', '#F84B9B')
				.attr("d", line);
		});
		//Controls compare page search functionality
		$scope._name;
		$scope.getSearchArray;
		$scope.companySearch = {
			name: function(newName) {
				if(arguments.length) {
					$scope._name = newName;
					var searchArray = [];
					angular.forEach($scope.companys , function(value, key) {
						for(i = 0; i < $scope._name.length; i++) {
							if($scope._name.toLowerCase().slice(0 , $scope._name.length) === value.company.name.toLowerCase().slice(0 , $scope._name.length)) {
								searchArray.push(value.company);
								angular.extend($scope.getSearchArray = searchArray);
								break;
							}
						}
					});
					if($scope._name.length === 0 && $scope.getSearchArray.length > 0) {
						angular.extend($scope.getSearchArray = searchArray);
					}
				}
				return $scope._name;
			}
		}
		$scope.clearSearch = function() {
			$scope._name = '';
		}
		$scope.linkCheck = function(index) {
			var url = '/company/' + $scope.getSearchArray[index].name;
			$window.location.href = url;
		}
		//Select a name and load it into the new print array
		var checkerValidate = true;
		$scope.searchArrayReturn = [];
		$scope.nameCheck = function(index) {
			if($scope.searchArrayReturn.indexOf($scope.getSearchArray[index]) === -1 && $scope.getSearchArray[index].length === undefined) {
				$scope.searchArrayReturn.push($scope.getSearchArray[index]);
			}
		}
		$scope.compareCardCheck = function(checker) {
			checker < $scope.searchArrayReturn.length ? checkerValidate = false : checkerValidate = true;
			return checkerValidate;
		}
		//Removes button for each card
		$scope.removeCompany = function(index) {
			$scope.searchArrayReturn.splice(index, 1);
		}
		$scope.quantity = 5;
		$scope.updateQuantity = function() {
			$scope.quantity += 10;
		}
		//Controls visibility of lightbox and search bar
		$scope.disableScroll = false;
		$scope.searchToggle = false;
		$scope.mainSearchCheck = true;
		$scope.trackCompany = false;
		$scope.searchCheck = function(track) {
			$scope.getSearchArray = null;
			$scope.searchToggle === false ? $scope.searchToggle = true : $scope.searchToggle = false;
			if(track) {
				$scope.trackCompany = true;
				console.log($scope.trackCompany);
			} else if($scope.searchToggle === true) {
				$scope.disableScroll = true;
				$scope.mainSearchCheck = false;
				$scope.trackCompany = false;
				console.log($scope.trackCompany);
			} else {
				$scope.disableScroll = false;
				$scope.mainSearchCheck = true;
				$scope.trackCompany = false;
				console.log($scope.trackCompany);
			}
		}
		//Calculates when the last time a company was updated
		$scope.dateBounds = function(date) {
			var newestDate = date[0].date;
			for(var i = 0; i < date.length; i++) {
				if(date[i].date > newestDate) {
					newestDate = date[i].date;
				} if(date[i].date === newestDate) {
					newestDate = date[i].date;
				}
			}
			return newestDate
		}
		//Calculates total range of years each company has acquired from
		$scope.dateRange = function(date) {
			var oldestDate = Date();
			for(var i = 0; i < date.length; i++) {
				if (date[i].date < oldestDate) {
					oldestDate = date[i].date;
				}
			}
			return todaysDate.getFullYear() - new Date(oldestDate).getFullYear();
		}
		$scope.totalAcquisitionPrice = function(acquisitions) {
			acquisitions.totalAcquisitionPrice = 0;
			angular.forEach(acquisitions , function(value , key) {
				if(value.acquisitionPrice > -1) {
					acquisitions.totalAcquisitionPrice += value.acquisitionPrice
				}
			});
			return acquisitions.totalAcquisitionPrice;
		}
		$scope.totalUndisclosed = function(acquisitions) {
			acquisitions.totalUndisclosed = [];
			angular.forEach(acquisitions , function(value , key) {
				if(value.acquisitionPrice <= -1) {
					acquisitions.totalUndisclosed.push(value.acquisitionPrice);
				}
			});
			return acquisitions.totalUndisclosed;
		}
		$scope.acquiAverageTime = function(acquisitions) {
			acquisitions.averageTime = 0;
			angular.forEach(acquisitions , function(value , key) {
				acquisitions.averageTime += Number(new Date(acquisitions[key].date).getTime());
			});
			acquisitions.averageTime = ((todaysDate.getFullYear() - new Date(acquisitions.averageTime / acquisitions.length).getFullYear()) * 12)
				+ (todaysDate.getMonth() - new Date(acquisitions.averageTime / acquisitions.length).getMonth());
			return acquisitions.averageTime;
		}
		$scope.mostAcquired = function(acquisitions) {
			var acquireTimes = { year: { 'number': 0 }, month: { 'list': {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0}, 'number': 0 }},
			yearList = [];
			angular.forEach(acquisitions , function(value , key) {
				for(i = new Date($scope.dateRange(acquisitions)).getFullYear(); i <= todaysDate.getFullYear(); i++) {
					if(new Date(acquisitions[key].date).getFullYear() === i) {
						if(yearList[i] >= 1) {
							yearList[i] = yearList[i] + 1;
						} else {
							yearList[i] = 1;
						}
					}
					if(yearList[i] > acquireTimes.year['number']) {
						acquireTimes.year['date'] = i;
						acquireTimes.year['number'] = yearList[i];
					}
				}
				for(i = 0; i < 12; i++) {
					if(new Date(acquisitions[key].date).getMonth() === i) {
						acquireTimes.month.list[new Date(acquisitions[key].date).getMonth()] = acquireTimes.month.list[new Date(acquisitions[key].date).getMonth()] + 1;
					}
					if(acquireTimes.month.list[i] > acquireTimes.month['number']) {
						acquireTimes.month['date'] = new Date(todaysDate.getFullYear() , i);
						acquireTimes.month['number'] = acquireTimes.month.list[i];
					}
				}
			})
			return acquireTimes;
		}
		$scope.stockCalc = function(date , acquisitions) {
			var dateInYears = new Date(date).getFullYear(), dateInMonths = new Date(date).getMonth() , yearList = [], foundName;
			for(i = 0; i < acquisitions.length; i++) {
				if (new Date(acquisitions[i].date).getFullYear() <= dateInYears) {
					yearList.push(acquisitions[i]) 
				}
			}
			yearList.sort(function(a , b) {
				return new Date(b.date) - new Date(a.date);
			});
			return yearList[0].name;
		}
		$scope.acquiredIndustries = function(acquisitions) {
			var industries = [];
			angular.forEach(acquisitions , function(value , key) {
				for(i = 0; i < acquisitions[key].industry.length; i++ ) {
					industries.push(acquisitions[key].industry[i]);
				}
			})
			$scope.filteredIndustries = [industries[0]];
			for(i = 0; i < industries.length; i++) {
			   for(j = 0; j < $scope.filteredIndustries.length; j++) {
					if($scope.filteredIndustries.indexOf(industries[i]) === -1) {
						$scope.filteredIndustries.push(industries[i]);
					}
			   }
			}
			return $scope.filteredIndustries;
		}
		$scope.monthlyAcquisitions = function(companies) {
			var monthCompare = {
				thisMonth: {
					number: 0,
					value: 0
				},
				lastMonth: {
					number: 0,
					value: 0
				},
				difference: {
					number: 0,
					value: 0
				}
			}
			$scope.filterBar = function(filterReturn) {
				$scope.filterBarSelect === filterReturn ? $scope.filterBarSelect = '-' + filterReturn : $scope.filterBarSelect = filterReturn;
			}
			angular.forEach(companies , function(value , key) {
				angular.forEach(companies[key].company.acquisition , function(value , key) {
					var dateify = new Date(value.date), compare;
					todaysDate.getMonth() > 0 ? compare = todaysDate.getMonth() - 1 : compare = todaysDate.getMonth() + 12;
					if(dateify.getFullYear() === todaysDate.getFullYear()) {
						if(dateify.getMonth() === todaysDate.getMonth()) {
							monthCompare.thisMonth['number'] += 1;
							if(value.acquisitionPrice > 0) {
								monthCompare.thisMonth['value'] += value.acquisitionPrice;
							}
						} if(dateify.getMonth() === compare) {
							monthCompare.lastMonth['number'] += 1;
							if(value.acquisitionPrice > 0) {
								monthCompare.lastMonth['value'] += value.acquisitionPrice;
							}
						}
					}
				})
			})
			monthCompare.difference['number'] = monthCompare.thisMonth.number - monthCompare.lastMonth.number;
			monthCompare.difference['value'] = monthCompare.thisMonth.value - monthCompare.lastMonth.value;
			return monthCompare.difference;
		}
		$scope.drawHomeGraph = function(company) {
			angular.forEach(company.acquisition , function(value, key) {
				homeData.push({
					'x_axis': new Date(company.acquisition[key].date),
					'y_axis': new Date(2012, new Date(company.acquisition[key].date).getMonth()),
					'radius': company.acquisition[key].acquisitionPrice,
					'color': company.acquisition[key].acquisitionPrice
				});
			});
		}
}]);
acquibaseApp.controller('authController', ['$scope', '$rootScope' , '$http', '$location', '$cookies' , '$window', 'authenticationService', 'restrictData', function($scope, $rootScope , $http, $location, $cookies, $window, authenticationService, restrictData) {
	$scope.credentials = {
		name : "",
		email : "",
		password : ""
	}
	if($location.path() === '/profile') {
		restrictData.getProfile()
			.success(function(data) {
				$scope.user = data;
			}).error(function(e) {
				console.log(e);
			});
	}
	$scope.user = {};
	$scope.resetUrl = '/api/reset/' + $location.path().replace('/login/reset/' , '');
	$scope.socialLogin = function() {
		var jwtCookie = $cookies.get('jwt'), url = '/profile';
		$window.localStorage['jwt'] === undefined ? authenticationService.saveToken(jwtCookie) : $cookies.remove('jwt');
		if($window.localStorage['jwt'] !== undefined) {
			$window.location.href = url;
		}
	}
	$scope.regSubmit = function() {
		$rootScope.formError = undefined;
		authenticationService.register($scope.credentials)
			.error(function(err) {
				console.log(err);
			}).then(function() {
				if($rootScope.formError) {
					return $scope.formError;
				} else {
					var url = '/profile';
            		$window.location.href = url;
				}
			});
	}
	$scope.logSubmit = function() {
		$rootScope.formError = undefined;
		authenticationService.login($scope.credentials)
			.error(function(err) {
				console.log(err);
			}).then(function() {
				if($rootScope.formError) {
					return $scope.formError;
				} else {
					var url = '/profile';
            		$window.location.href = url;
				}
			});
	}
	$scope.forgotSubmit = function() {
		$rootScope.formError = undefined;
		authenticationService.forgot($scope.credentials)
			.error(function(err) {
				console.log(err);
			})
			.then(function() {
				return $scope.formError;
			});
	}
	$scope.resetSubmit = function() {
		$rootScope.formError = undefined;
		authenticationService.reset($scope.credentials)
			.error(function(err) {
				console.log(err);
			})
			.then(function() {
				if($rootScope.formError) {
					return $scope.formError;
				} else {
					var url = '/profile';
            		$window.location.href = url;
				}
			});
	}
	$scope.logout = function() {
		var url = '/';
		authenticationService.logout();
        $window.location.href = url;
	}
	$scope.isLoggedIn = authenticationService.isLoggedIn();
	$scope.currentUser = function() {
		return authenticationService.currentUser();
	}
	$scope.formValidate = function(form) {
		$scope.passwordNoMatch;
		if(form.password !== form.verifyPassword) {
			$scope.passwordNoMatch = true;
			return 'Passwords do not match';
		} else if(form.password.length <= 5) {
			return 'Passwords must be longer than 5 characters';
		} else {
			$scope.passwordNoMatch = false;
		}
	}
}]);
acquibaseApp.controller('profileController', ['$scope', '$http', '$location' , 'acquibaseFactory' , 'authenticationService' , 'profileFactory' , function($scope , $http , $location , acquibaseFactory , authenticationService , profileFactory) {
	$scope.userId = {
		userId: authenticationService.currentUser()._id
	};
	profileFactory.get($scope.userId).success(function(data) {
		$scope.profile = {
			currentProfile: data,
			savedCompanies: data.savedCompanies,
			downloadedCompanies: data.downloadedCompanies
		}
	});
	acquibaseFactory.get().success(function(data) {
		$scope.companies = data;
	});
	$scope.profileSettings = {
		userId: $scope.userId.userId,
		email: '',
		name: '',
		password: '',
		verifyPassword: ''
	};
	$scope.selectData = function(setting) {
		$scope.sendSettings = {
			userId: $scope.userId.userId,
		}
		$scope.sendSettings[setting] = $scope.profileSettings[setting];
	}
	$scope.profileSuccess;
	$scope.updateSettings = function() {
		$http.post('/api/profiles/updateSettings' , $scope.sendSettings)
		.error(function(err) {
			console.log(err);
		}).success(function(data) {
			if(data.token) {
		  		authenticationService.saveToken(data.token);
        		$scope.profileSuccess = 'You have successfully updated your profile settings';
		  	}
		});
	}
	// Update message when you click track this company
	// Click to remove company
	// Graph Tracked companies
	$scope.track = true;
	$scope.trackData = {
		userId: $scope.userId.userId,
		companyName: $location.path().replace('/company/' , '')
	}
	$scope.savedCompanies = function() {
		$scope.tracked = [];
		for(i = 0; i < $scope.profile.savedCompanies.length; i++) {
			angular.forEach($scope.companies , function(value , key) {
				if(value._id === $scope.profile.savedCompanies[i].companyID) {
					$scope.tracked.push(value);
				}
			});
		}
		return $scope.tracked;
	}
	$scope.trackCompany = function() {
		$http.post('/api/profiles/trackCompany' , $scope.trackData)
		.error(function(err) {
			console.log(err);
		}).success(function(data) {
			return;
		});
	}
	if($location.path() !== '/profile') {
		$scope.verifyTracked = function(data) {
			$http.post('/api/profiles/isTracked' , $scope.trackData)
			.error(function(err) {
				console.log(err);
			})
			.success(function(data) {
				$scope.trackedCheck = data;
			});
		}
		$scope.verifyTracked();
	}
	$scope.trackSuccess = function(data) {
		console.log(data);
		if(data.isTracked) {
			return 'Visit your profile to see tracked companies';
		} else {
			return 'Track this company on your profile';
		}
	}
}]);