var todaysDate = new Date();
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
                //Calculate Newest Date
                $scope.acquisition.newestDate = $scope.acquisition[0].date;
                $scope.acquisition.oldestDate = Date();
                for(var i = 0; i < $scope.acquisition.length; i++) {
                    if($scope.acquisition[i].date > $scope.acquisition.newestDate) {
                        $scope.acquisition.newestDate = $scope.acquisition[i].date;
                    }
                    if ($scope.acquisition[i].date < $scope.acquisition.oldestDate) {
                        $scope.acquisition.oldestDate = $scope.acquisition[i].date;
                    }
                }
                var endDate = new Date($scope.acquisition.oldestDate);
                $scope.acquisition.dateRange = (todaysDate.getFullYear() - endDate.getFullYear());
                return $scope.acquisition;
            })
        });
}]);
var acquiChartList = [];
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
            $scope.thisCompany.acquisition.oldestDate = Date();
            angular.forEach($scope.thisCompany.acquisition , function(value , key) {
                value.acquisitionPrice > -1 ? $scope.acquiPriceHistory += value.acquisitionPrice :
                $scope.undisclosed.push(value.acquisitionPrice);
                if($scope.thisCompany.acquisition[key].date < $scope.thisCompany.acquisition.oldestDate) {
                    $scope.thisCompany.acquisition.oldestDate = $scope.thisCompany.acquisition[key].date;
                }
                var endDate = new Date($scope.thisCompany.acquisition.oldestDate);
                $scope.thisCompany.acquisition.dateRange = (todaysDate.getFullYear() - endDate.getFullYear());

                var dateInMonths = new Date($scope.thisCompany.acquisition[key].date).getMonth()
                var acquiChartRow = ['', new Date($scope.thisCompany.acquisition[key].date), Number(dateInMonths), $scope.thisCompany.acquisition[key].acquisitionPrice, $scope.thisCompany.acquisition[key].acquisitionPrice];

                acquiChartList.splice(key, 0, acquiChartRow);
            });
            acquiChartList.splice(0, 0, ['ID', 'Years', 'Months', 'Is Disclosed', 'Valuation']);
        });

        google.charts.load('current' , {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawHistoryChart);

        function drawHistoryChart() {

            var data = google.visualization.arrayToDataTable(acquiChartList);
            //Color: Disclosed/Undisclosed
            //Opacity: Price of Acquisition
            //Size: Number of Acquisitions This Month
            var options = {
                backgroundColor: '#1B1B1B',
                chartArea: {
                    backgroundColor: '#1B1B1B',
                    left: 40,
                    width: 760,
                    height: 240
                },
                colorAxis: {
                    legend: {
                        position: 'none'
                    },
                    colors: ['#F20278' , '#00FFC9'],
                    minValue: -1,
                    maxValue: 1
                },
                sizeAxis: {
                    maxSize: 15
                },
                bubble: {
                    stroke: '#1B1B1B'
                },
                hAxis: {
                    baselineColor: '#1B1B1B',
                    gridlines: {
                        color: '#1B1B1B',
                    },
                    format: 'yyyy',
                    // format: 'long'
                },
                vAxis: {
                    direction: -1,
                    ticks: [{v: 1, f: 'Jan'}, {v: 2, f: 'Feb'}, {v: 3, f: 'Mar'}, {v: 4, f: 'Apr'}, {v: 5, f: 'May'}, {v: 6, f: 'Jun'}, {v: 7, f: 'Jul'}, {v: 8, f: 'Aug'}, {v: 9, f: 'Sep'}, {v: 10, f: 'Oct'}, {v: 11, f: 'Nov'}, {v: 12, f: 'Dec'}],
                    gridlines: {
                        color: '#1B1B1B',
                    },
                }
            };
            var chart = new google.visualization.BubbleChart(document.getElementById('acquisition-history-chart'));

            chart.draw(data, options);
        }
}]);