'use strict';

/* jshint -W098 */
angular.module('mean.ddb').controller('DdbProfileController', ['$scope', '$stateParams', 'Global', 'Profile', 'DailyAnalysis', 'User', '$filter',
    function ($scope, $stateParams, Global, Profile, DailyAnalysis, User, $filter) {

        User.get($stateParams.userId).success(function (user) {
            $scope.user = user;
        });

        Profile.getUser($stateParams.userId).success(function (profile) {
            if (profile.length > 0 && profile[0]) {
                $scope.typeLabels = ["Pilsner", "Strong Beer", "Wine", "Liquor"];
                $scope.typeProfileData = [[profile[0].totAlcPilsner, profile[0].totAlcStrongbeer, profile[0].totAlcWine, profile[0].totAlcLiquor]];

                $scope.weekLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                $scope.weekProfileData = [[profile[0].totAlcMon, profile[0].totAlcTue, profile[0].totAlcWed, profile[0].totAlcThu, profile[0].totAlcFri, profile[0].totAlcSat, profile[0].totAlcSun]];

                $scope.profile = profile[0];
            }
        });

        DailyAnalysis.get($stateParams.userId).success(function (dailyAnalyses) {
            $scope.dailyAnalyses = dailyAnalyses;

            $scope.getSpreadAverageChartData(30);
            $scope.getCumulativeChartData(30);
        });

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
                bezierCurve : true,
                showScale: true,
                pointDot: false,
                pointHitDetectionRadius: 1
            };

            $scope.spreadAverageSeries = ['Spread Average'];
            var fromDate = moment.utc().subtract(nbDays, 'days');
            angular.forEach($scope.dailyAnalyses, function (analysis) {
                var date = moment.utc(analysis.date, 'YYYY-MM-DD hh:mm:ss');
                if (date >= fromDate) {
                    //var displayDate = date.format('MM/DD');
                    $scope.spreadAverageLabels.push('');
                    $scope.spreadAverageData[0].push($filter('number')(analysis.spreadAverage, 2));
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
                bezierCurve : true,
                showScale: true,
                pointDot: false,
                pointHitDetectionRadius: 1
            };
            $scope.cumulativeTrendSeries = ['Cumulative Trend'];
            var fromDate = moment.utc().subtract(nbDays, 'days');
            angular.forEach($scope.dailyAnalyses, function (analysis) {
                var date = moment.utc(analysis.date, 'YYYY-MM-DD hh:mm:ss');
                if (date >= fromDate) {
                    //var displayDate = date.format('MM/DD');
                    $scope.cumulativeTrendLabels.push('');
                    $scope.cumulativeTrendData[0].push($filter('number')(analysis.cumAlc, 2));
                }
            });
        }
    }
]);

