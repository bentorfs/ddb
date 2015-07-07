'use strict';

angular.module('mean.ddb').controller('DdbNewsController', ['$rootScope', '$scope', 'smoothScroll', 'MeanUser', 'Measurement', 'Profile', 'Analysis',
    function ($rootScope, $scope, smoothScroll, MeanUser, Measurement, Profile, Analysis) {

        $scope.today = moment.utc().valueOf();

        $scope.loadData = function () {
            if ($scope.user._id) {
                Measurement.get(moment.utc().valueOf()).success(function (data) {
                    $scope.measurement = data;
                });

                Profile.getUser($scope.user._id).success(function (profile) {
                    $scope.profile = profile;
                    var dayOfWeek = moment.utc().day();
                    if (dayOfWeek === 0) {
                        $scope.dayOfWeek = 'Sunday';
                        $scope.benchmark = profile.avgAlcSun;
                    } else if (dayOfWeek === 1) {
                        $scope.dayOfWeek = 'Monday';
                        $scope.benchmark = profile.avgAlcMon;
                    } else if (dayOfWeek === 2) {
                        $scope.dayOfWeek = 'Tuesday';
                        $scope.benchmark = profile.avgAlcTue;
                    } else if (dayOfWeek === 3) {
                        $scope.dayOfWeek = 'Wednesday';
                        $scope.benchmark = profile.avgAlcWed;
                    } else if (dayOfWeek === 4) {
                        $scope.dayOfWeek = 'Thursday';
                        $scope.benchmark = profile.avgAlcThu;
                    } else if (dayOfWeek === 5) {
                        $scope.dayOfWeek = 'Friday';
                        $scope.benchmark = profile.avgAlcFri;
                    } else if (dayOfWeek === 6) {
                        $scope.dayOfWeek = 'Saturday';
                        $scope.benchmark = profile.avgAlcSat;
                    }
                });

                Analysis.getDaily($scope.user._id, moment.utc().startOf('day').valueOf(), moment.utc().startOf('day').valueOf()).success(function (data) {
                    $scope.dailyAnalysis = data[0];
                });
            }
        };

        $scope.onDrinkTracked = function () {
            $scope.loadData();
            $scope.scrollTo('today-consumptions');
        };

        $scope.scrollTo = function (location) {
            if (window.mobilecheck()) {
                smoothScroll(document.getElementById(location), {offset: 55});
            }
        };

        $scope.removeConsumption = function (consumption) {
            Measurement.removeConsumption(moment.utc().valueOf(), consumption._id
            ).success(function (data) {
                    $scope.loadData();
                });
        };

        $scope.user = MeanUser.get();
        $rootScope.$on('loggedin', function () {
            $scope.user = MeanUser.get();
            $scope.loadData();
        });
        $scope.loadData();

    }
]);

