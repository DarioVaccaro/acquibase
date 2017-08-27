const todaysDate = new Date();
acquibaseApp.controller('dataAccessController' , ['$scope' , '$http' , 'acquibaseFactory', function($scope , $http , acquibaseFactory) {
    acquibaseFactory.get()
        .success(function(data) {
            //Sets $scope to the array of documents in the database
            $scope.companys = data;
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
            if($scope.searchArrayReturn.indexOf($scope.getSearchArray[index]) === -1) {
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

        //Controls visibility of lightbox and search bar
        $scope.disableScroll = false;
        $scope.searchToggle = false;
        $scope.searchCheck = function() {
            $scope.searchToggle === false ? $scope.searchToggle = true : $scope.searchToggle = false;
            if($scope.searchToggle === true) {
                $scope.disableScroll = true;
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
}]);
var endDate, dataArray = [], yearList = {};
acquibaseApp.controller('dataRestrictController' , ['$scope' , '$http' , '$location' , 'acquibaseFactory', function($scope , $http, $location , acquibaseFactory) {
    acquibaseFactory.get()
        .success(function(data) {
            //Set the $scope to the company found in the URL
            angular.forEach(data, function(value , key) {
                if(value.company.name === $location.path().replace('/' , '')) {
                    $scope.thisCompany = value.company;
                }
            })
            //Array of undisclosed companies
            $scope.undisclosed = [];
            //Array of Industries thisCompany has acquired from
            $scope.acquiredIndustries = [];
            //Sets total acquisition value
            $scope.acquiPriceHistory = 0;
            //Sets average time between acquisitions
            $scope.averageTime = 0;
            //Sets Object with year of most acquisitions
            $scope.mostAcquiredYear = {'number': 0};
            //Sets Object with months and their corresponding acquisition amounts
            $scope.mostAcquiredMonth = {'list': {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0}, 'number': 0};
            //Sets oldest acquisition date
            $scope.thisCompany.acquisition.oldestDate = Date();
            //Iterates through all of thisCompanies acquisitions
            angular.forEach($scope.thisCompany.acquisition , function(value , key) {
                //Calculates total acquisition value and amount of undisclosed deals
                value.acquisitionPrice > -1 ? $scope.acquiPriceHistory += value.acquisitionPrice :
                $scope.undisclosed.push(value.acquisitionPrice);
                //Sets oldest acquisition date
                if($scope.thisCompany.acquisition[key].date < $scope.thisCompany.acquisition.oldestDate) {
                    $scope.thisCompany.acquisition.oldestDate = $scope.thisCompany.acquisition[key].date;
                }
                //Sets rangs of acquisition dates
                endDate = new Date($scope.thisCompany.acquisition.oldestDate);
                $scope.thisCompany.acquisition.dateRange = (todaysDate.getFullYear() - endDate.getFullYear());
                //Fills array with industry names
                for(i = 0; i <$scope.thisCompany.acquisition[key].industry.length; i++ ) {
                    $scope.acquiredIndustries.push($scope.thisCompany.acquisition[key].industry[i]);
                }
                //Sets time between acquisitions to a number and adds all milliseconds together
                $scope.averageTime += Number(new Date($scope.thisCompany.acquisition[key].date).getTime());
                //Fills graph array with coordinates
                dataArray.push({
                    'x_axis': new Date($scope.thisCompany.acquisition[key].date),
                    'y_axis': new Date($scope.thisCompany.acquisition[key].date).getMonth(),
                    'radius': '20',
                    'color': 'red'
                });
                //Calculates most acquired year
                for(i = new Date($scope.thisCompany.acquisition.oldestDate).getFullYear(); i <= todaysDate.getFullYear(); i++) {
                    if(new Date($scope.thisCompany.acquisition[key].date).getFullYear() === i) {
                        if(yearList[i] >= 1) {
                            yearList[i] = yearList[i] + 1;
                        } else {
                            yearList[i] = 1;
                        }
                    }
                    if(yearList[i] > $scope.mostAcquiredYear['number']) {
                        $scope.mostAcquiredYear['date'] = i;
                        $scope.mostAcquiredYear['number'] = yearList[i];
                    }
                }
                //Calculates most acquired month
                for(j = 0; j < 12; j++) {
                    if(new Date($scope.thisCompany.acquisition[key].date).getMonth() === j) {
                        $scope.mostAcquiredMonth.list[new Date($scope.thisCompany.acquisition[key].date).getMonth()] = $scope.mostAcquiredMonth.list[new Date($scope.thisCompany.acquisition[key].date).getMonth()] + 1;
                    }
                    if($scope.mostAcquiredMonth.list[j] > $scope.mostAcquiredMonth['number']) {
                        $scope.mostAcquiredMonth['month'] = new Date(todaysDate.getFullYear() , j);
                        $scope.mostAcquiredMonth['number'] = $scope.mostAcquiredMonth.list[j];
                    }
                }
            });
            //Filters duplicates from industry list
            var filteredIndustries = [$scope.acquiredIndustries[0]];
            for(i = 0; i < $scope.acquiredIndustries.length; i++) {
               for(j = 0; j < filteredIndustries.length; j++) {
                    if(filteredIndustries.indexOf($scope.acquiredIndustries[i]) === -1) {
                        filteredIndustries.push($scope.acquiredIndustries[i]);
                    }
               }
            }
            $scope.acquiredIndustries = filteredIndustries;
            //Sets average time between acquisitions
            $scope.averageTime = ((todaysDate.getFullYear() - new Date($scope.averageTime / $scope.thisCompany.acquisition.length).getFullYear()) * 12)
                + (todaysDate.getMonth() - new Date($scope.averageTime / $scope.thisCompany.acquisition.length).getMonth());
            //Creaes D3 graph
            var foundedOn = new Date($scope.thisCompany.foundedOn);
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
    });
    $scope.disableScroll = false;
        $scope.searchToggle = false;
        $scope.searchCheck = function() {
            $scope.searchToggle === false ? $scope.searchToggle = true : $scope.searchToggle = false;
            if($scope.searchToggle === true) {
                $scope.disableScroll = true;
            }
        }
    $scope.quantity = 5;
    $scope.updateQuantity = function() {
        $scope.quantity += 10;
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
}]);
acquibaseApp.controller('stockGraphController' ,['$scope' , '$http', function($http, $scope) {
    var url;
    $http.jsonp(url).success(function(data) {
        $scope.stocPrices = {
            items: data.query.results.quote
        }
    }).error(function(data) {
        console.log('Error' + data);
    });
}]);