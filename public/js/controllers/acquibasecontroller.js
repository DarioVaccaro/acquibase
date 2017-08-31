acquibaseApp.controller('dataAccessController' , ['$scope' , '$http' , '$location' , 'acquibaseFactory' , function($scope , $http , $location , acquibaseFactory) {
    acquibaseFactory.get()
        .success(function(data) {
            //Sets $scope to the array of documents in the database
            $scope.companys = data;
            if(!(['contact' , 'index' , 'about' , 'compare'].indexOf($location.path().replace('/' , '')) > -1)) {
                angular.forEach(data, function(value , key) {
                    if(value.company.name === $location.path().replace('/' , '')) {
                        $scope.thisCompany = value.company;
                    }
                })
            }
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
        const todaysDate = new Date();
        var dataArray = [];
        $scope.acquiGraph = function(company) {
            angular.forEach(company.acquisition , function(value , key) {
                dataArray.push({
                    'x_axis': new Date(company.acquisition[key].date),
                    'y_axis': new Date(company.acquisition[key].date).getMonth(),
                    'radius': '20',
                    'color': 'red'
                });
            })
            var foundedOn = new Date(company.foundedOn);
            const parseTime = d3.timeParse("%b");
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
                .data(dataArray)
                    .enter()
                    .append('circles');
            const circleAttributes = circles
                .attr('cx' , function(d) { return xScale(d.x_axis); })
                .attr('cy' , function(d) { return d.y_axis; })
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
        //Controls compare page search functionality
        var _name;
        $scope.getSearchArray;
        $scope.companySearch = {
            name: function(newName) {
                if(arguments.length) {
                    _name = newName;
                    var searchArray = [];
                    angular.forEach($scope.companys , function(value, key) {
                        for(i = 0; i < _name.length; i++) {
                            if(_name.toLowerCase().slice(0 , _name.length) === value.company.name.toLowerCase().slice(0 , _name.length)) {
                                searchArray.push(value.company);
                                angular.extend($scope.getSearchArray = searchArray);
                                break;
                            }
                        }
                    });
                    if(_name.length === 0 && $scope.getSearchArray.length > 0) {
                        angular.extend($scope.getSearchArray = searchArray);
                    }
                }
                return _name;
            }
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
        $scope.searchCheck = function() {
            $scope.searchToggle === false ? $scope.searchToggle = true : $scope.searchToggle = false;
            if($scope.searchToggle === true) {
                $scope.disableScroll = true;
            } else {
                $scope.disableScroll = false;
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
}]);