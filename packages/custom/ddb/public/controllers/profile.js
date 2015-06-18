'use strict';

/* jshint -W098 */
angular.module('mean.ddb').controller('DdbProfileController', ['$scope', '$stateParams', 'Global', 'Profile', 'DailyAnalysis', 'User', '$filter',
    function ($scope, $stateParams, Global, Profile, DailyAnalysis, User, $filter) {

        User.get($stateParams.userId).success(function (user) {
            $scope.user = user;
        });

        Profile.getUser($stateParams.userId).success(function (profile) {
            if (profile) {
                $scope.typeLabels = ["Pilsner", "Strong Beer", "Wine", "Liquor"];
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

        DailyAnalysis.get($stateParams.userId, moment().subtract(11, 'days').valueOf(), moment().valueOf()).success(function (dailyAnalyses) {
            $scope.dailyAnalyses = dailyAnalyses;
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
        }
    }
]);

