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
            }
        });

        Profile.getFrequentDrinks($stateParams.userId).success(function (frequentDrinks) {
            $scope.frequentDrinks = frequentDrinks;
        });

        $scope.recentActivityLimit = 10;
        $scope.getRecentActivity = function () {
            $scope.gettingRecentActivity = true;
            Analysis.getDaily($stateParams.userId, moment.utc().subtract($scope.recentActivityLimit, 'days').valueOf(), moment.utc().valueOf()).success(function (dailyAnalyses) {
                $scope.dailyAnalyses = dailyAnalyses;
                $scope.gettingRecentActivity = false;
            });
        };


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
                if (analyses.length > 30) {
                    analyses = analyses.slice(analyses.length - 30)
                }
                $scope.analyses = analyses;
                $scope.getTrendChartData();
            });
        };

        $scope.getWeeklyChart = function () {
            $scope.trendGranularity = 'weekly';
            $scope.trendDataOptions.scaleStepWidth = 8;
            Analysis.getWeekly($stateParams.userId).success(function (analyses) {
                if (analyses.length > 30) {
                    analyses = analyses.slice(analyses.length - 30)
                }
                $scope.analyses = analyses;
                $scope.getTrendChartData();
            });
        };

        $scope.getMonthlyChart = function () {
            $scope.trendGranularity = 'monthly';
            $scope.trendDataOptions.scaleStepWidth = 25;
            Analysis.getMonthly($stateParams.userId).success(function (analyses) {
                if (analyses.length > 24) {
                    analyses = analyses.slice(analyses.length - 30)
                }
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
            var label;
            angular.forEach($scope.analyses, function (analysis) {
                if ($scope.trendGranularity === 'monthly') {
                    label = moment.utc().month(analysis.month);
                    $scope.trendLabels.push(label.format('MMM'));
                } else if ($scope.trendGranularity === 'weekly') {
                    label = moment.utc().week(analysis.week);
                    $scope.trendLabels.push(label.format('D MMM'));
                } else if ($scope.trendGranularity === 'daily') {
                    label = moment.utc(analysis.date);
                    $scope.trendLabels.push(label.format('D MMM'));
                }
                if (analysis.ignore) {
                    $scope.trendData[0].push(null);
                } else {
                    $scope.trendData[0].push($filter('number')(analysis.totAlc || analysis.todAlc, 2));
                }

            });
        };

        $scope.getDiffFromAvg = function (dailyAnalysis) {
            if (dailyAnalysis.dayOfWeek == 0) {
                return $scope.profile.avgAlcSun - dailyAnalysis.todAlc;
            } else if (dailyAnalysis.dayOfWeek == 1) {
                return $scope.profile.avgAlcMon - dailyAnalysis.todAlc;
            } else if (dailyAnalysis.dayOfWeek == 2) {
                return $scope.profile.avgAlcTue - dailyAnalysis.todAlc;
            } else if (dailyAnalysis.dayOfWeek == 3) {
                return $scope.profile.avgAlcWed - dailyAnalysis.todAlc;
            } else if (dailyAnalysis.dayOfWeek == 4) {
                return $scope.profile.avgAlcThu - dailyAnalysis.todAlc;
            } else if (dailyAnalysis.dayOfWeek == 5) {
                return $scope.profile.avgAlcFri - dailyAnalysis.todAlc;
            } else if (dailyAnalysis.dayOfWeek == 6) {
                return $scope.profile.avgAlcSat - dailyAnalysis.todAlc;
            }
        };

        $scope.abs = function (val) {
            return Math.abs(val);
        };

        $scope.getWeeklyChart();
        $scope.getRecentActivity();
    }
]);

