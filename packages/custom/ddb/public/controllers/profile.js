'use strict';

angular.module('mean.ddb').controller('DdbProfileController', ['$scope', '$stateParams', 'Global', 'Profile', 'Analysis', 'User', '$filter',
    function ($scope, $stateParams, Global, Profile, Analysis, User, $filter) {

        User.get($stateParams.userId).success(function (user) {
            $scope.user = user;
        });

        Profile.getUser($stateParams.userId).success(function (profile) {
            if (profile) {
                $scope.typeLabels = ["Beer", "Strong Beer", "Wine", "Liquor"];
                $scope.typeProfileData = [
                    [
                        $filter('number')(profile.totAlcPilsner, 2),
                        $filter('number')(profile.totAlcStrongbeer, 2),
                        $filter('number')(profile.totAlcWine, 2),
                        $filter('number')(profile.totAlcLiquor, 2)
                    ]
                ];

                $scope.weekLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                $scope.weekProfileData = [
                    [
                        $filter('number')(profile.totAlcMon, 2),
                        $filter('number')(profile.totAlcTue, 2),
                        $filter('number')(profile.totAlcWed, 2),
                        $filter('number')(profile.totAlcThu, 2),
                        $filter('number')(profile.totAlcFri, 2),
                        $filter('number')(profile.totAlcSat, 2),
                        $filter('number')(profile.totAlcSun, 2)
                    ]
                ];

                $scope.profile = profile;

                $scope.getSpreadAverageChartData(30);
                $scope.getCumulativeChartData(30);
            }
        });

        Profile.getFrequentDrinks($stateParams.userId).success(function (frequentDrinks) {
            $scope.frequentDrinks = frequentDrinks;
        });

        Analysis.getDaily($stateParams.userId, moment.utc().subtract(11, 'days').valueOf(), moment.utc().valueOf()).success(function (dailyAnalyses) {
            $scope.dailyAnalyses = dailyAnalyses;
        });

        $scope.trendDataOptions = {
            scaleOverride: true,
            scaleShowVerticalLines: false,
            bezierCurve: false,
            showScale: true,
            pointDot: false,
            scaleSteps: 15,
            scaleStartValue: 0,
            pointHitDetectionRadius: 1
        };

        $scope.getDailyChart = function (nbDays) {
            $scope.trendGranularity = 'daily';
            $scope.trendDataOptions.scaleStepWidth = 2.5;
            Analysis.getDaily($stateParams.userId, moment.utc().subtract(nbDays, 'days').valueOf(), moment.utc().valueOf()).success(function (analyses) {
                $scope.analyses = analyses;
                $scope.getTrendChartData();
            });
        };

        $scope.getWeeklyChart = function () {
            $scope.trendGranularity = 'weekly';
            $scope.trendDataOptions.scaleStepWidth = 8;
            Analysis.getWeekly($stateParams.userId).success(function (analyses) {
                $scope.analyses = analyses;
                $scope.getTrendChartData();
            });
        };

        $scope.getMonthlyChart = function () {
            $scope.trendGranularity = 'monthly';
            $scope.trendDataOptions.scaleStepWidth = 25;
            Analysis.getMonthly($stateParams.userId).success(function (analyses) {
                $scope.analyses = analyses;
                $scope.getTrendChartData();
            });
        };

        $scope.getTrendChartData = function () {
            $scope.trendLabels = [];
            $scope.trendData = [
                []
            ];

            $scope.trendSeries = ['Trend'];
            angular.forEach($scope.analyses, function (analysis) {
                $scope.trendLabels.push('');
                $scope.trendData[0].push($filter('number')(analysis.totAlc || analysis.todAlc, 2));
            });
        };

        $scope.getSpreadAverageChartData = function (nbDays) {
            $scope.nbSpreadAverageDaysShown = nbDays;
            $scope.spreadAverageLabels = [];
            $scope.spreadAverageData = [
                []
            ];
            $scope.spreadAverageDataOptions = {
                scaleOverride: true,
                scaleShowVerticalLines: false,
                scaleSteps: 15,
                scaleStepWidth: 1,
                scaleStartValue: 0,
                bezierCurve: true,
                showScale: true,
                pointDot: false,
                pointHitDetectionRadius: 1
            };

            $scope.spreadAverageSeries = ['Spread Average'];
            var fromDate = moment.utc().subtract(nbDays, 'days');
            angular.forEach($scope.profile.series, function (serie) {
                var date = moment.utc(serie.date, 'YYYY-MM-DD hh:mm:ss');
                if (date >= fromDate) {
                    //var displayDate = date.format('MM/DD');
                    $scope.spreadAverageLabels.push('');
                    $scope.spreadAverageData[0].push($filter('number')(serie.spreadAlc, 2));
                }
            });
        };

        $scope.getCumulativeChartData = function (nbDays) {
            $scope.nbCumulativeDaysShown = nbDays;
            $scope.cumulativeTrendLabels = [];
            $scope.cumulativeTrendData = [
                []
            ];
            $scope.cumulativeTrendDataOptions = {
                scaleOverride: false,
                scaleShowVerticalLines: false,
                bezierCurve: true,
                showScale: true,
                pointDot: false,
                pointHitDetectionRadius: 1
            };
            $scope.cumulativeTrendSeries = ['Cumulative Trend'];
            var fromDate = moment.utc().subtract(nbDays, 'days');
            angular.forEach($scope.profile.series, function (serie) {
                var date = moment.utc(serie.date, 'YYYY-MM-DD hh:mm:ss');
                if (date >= fromDate) {
                    //var displayDate = date.format('MM/DD');
                    $scope.cumulativeTrendLabels.push('');
                    $scope.cumulativeTrendData[0].push($filter('number')(serie.cumAlc, 2));
                }
            });
        };

        $scope.getWeeklyChart();
    }
]);

