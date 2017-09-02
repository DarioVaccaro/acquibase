const todaysDate = new Date();
acquibaseApp.controller('dataAccessController' , ['$scope' , '$http' , '$location' , '$window', 'acquibaseFactory' , function($scope , $http , $location, $window , acquibaseFactory) {
    acquibaseFactory.get()
        .success(function(data) {
            //Sets $scope to the array of documents in the database
            $scope.companys = data;
            angular.forEach(data, function(value , key) {
                if(value.company.name === $location.path().replace('/' , '')) {
                    var dataArray = [];
                    $scope.thisCompany = value.company;
                    angular.forEach($scope.thisCompany.acquisition , function(value , key) {
                        dataArray.push({
                            'x_axis': new Date($scope.thisCompany.acquisition[key].date),
                            'y_axis': new Date(2012, new Date($scope.thisCompany.acquisition[key].date).getMonth()),
                            'radius': '10',
                            'color': '#00FFC9'
                        });
                    })
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
                        .attr('cx' , function(d) { return xScale(d.x_axis); })
                        .attr('cy' , function(d) { return yScale(d.y_axis); })
                        .attr('r' , function(d) { return d.radius; })
                        .style('fill' , function(d) { return d.color; });
                    selectGraph.append('g')
                        .attr('transform', 'translate(50, 260)')
                        .attr('class' , 'xAxis')
                        .call(xAxis);
                    selectGraph.append('g')
                        .attr('transform', 'translate(20, 35)')
                        .attr('class' , 'yAxis')
                        .call(yAxis);
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
        });
        //Controls compare page search functionality
        $scope._name;
        $scope.getSearchArray;
        $scope.companySearch = {
            name: function(newName) {
                if(arguments.length) {
                    $scope._name = newName;
                    console.log($scope._name);
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
            var url = '/' + $scope.getSearchArray[index].name;
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
        $scope.searchCheck = function() {
            $scope.getSearchArray = null;
            $scope.searchToggle === false ? $scope.searchToggle = true : $scope.searchToggle = false;
            if($scope.searchToggle === true) {
                $scope.disableScroll = true;
                $scope.mainSearchCheck = false;
            } else {
                $scope.disableScroll = false;
                $scope.mainSearchCheck = true;
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
            angular.forEach(companies , function(value , key) {
                angular.forEach(companies[key].company.acquisition , function(value , key) {
                    var dateify = new Date(value.date), compare;
                    todaysDate.getMonth() > 0 ? compare = todaysDate.getMonth() - 1 : compare = todaysDate.getMonth() + 12;
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
                })
            })
            monthCompare.difference['number'] = monthCompare.thisMonth.number - monthCompare.lastMonth.number;
            monthCompare.difference['value'] = monthCompare.thisMonth.value - monthCompare.lastMonth.value;
            return monthCompare.difference;
        }
}]);