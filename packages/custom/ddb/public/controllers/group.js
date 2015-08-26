'use strict';

angular.module('mean.ddb').controller('DdbGroupController', ['$scope', '$stateParams', '$state', '$filter', '$rootScope', 'Group', 'Analysis', '$q',
    function ($scope, $stateParams, $state, $filter, $rootScope, Group, Analysis, $q) {

        $scope.usersToInvite = [];
        $scope.inviteUsers = function () {
            var promises = [];
            _.forEach($scope.usersToInvite, function (userToInvite) {
                promises.push(Group.addInvitation($stateParams.groupId, userToInvite._id));
            });

            $q.all(promises).then(function () {
                $scope.loadGroup();
                $scope.usersToInvite = [];
            });
        };

        $scope.uninviteUser = function (userId) {
            Group.removeInvitation($stateParams.groupId, userId).success(function () {
                $scope.loadGroup();
            })
        };

        $scope.loadGroup = function () {
            Group.getGroup($stateParams.groupId).success(function (group) {
                $scope.group = group;

                $scope.getDailyChart();
            });
        };

        $scope.leaveGroup = function () {
            Group.leaveGroup($stateParams.groupId).success(function () {
                $state.go('managegroups');
                $rootScope.$emit('beerkeeper.groups.update');
            })
        };

        $scope.groupTrendDataOptions = {
            datasetFill: false,
            scaleOverride: true,
            scaleShowVerticalLines: false,
            scaleSteps: 15,
            scaleStepWidth: 1,
            scaleStartValue: 0,
            bezierCurve: false,
            bezierCurveTension: 0.4,
            showScale: true,
            pointDot: false,
            pointHitDetectionRadius: 1
        };

        $scope.drawGroupChart = function () {
            $scope.groupTrendLabels = [];
            $scope.groupTrendData = [];

            $scope.groupTrendSeries = [];

            var fromDate;
            if ($scope.groupTrendGranularity === 'monthly') {
                fromDate = moment.utc().startOf('day').subtract(12, 'months');
            } else if ($scope.groupTrendGranularity === 'weekly') {
                fromDate = moment.utc().startOf('day').subtract(10, 'weeks');
            } else if ($scope.groupTrendGranularity === 'daily') {
                fromDate = moment.utc().startOf('day').subtract(30, 'days');
            }
            var today = moment.utc().startOf('day');
            var dataMap = {};

            _.forEach($scope.group.members, function (member) {
                var dataForMember = [];
                var i = 0;
                _.forEach($scope.groupProfiles[member.username].data, function (analysis) {
                    //var date = moment.utc(serie.date, 'YYYY-MM-DD hh:mm:ss');
                    var date;
                    if ($scope.groupTrendGranularity === 'monthly') {
                        date = moment.utc().month(analysis.month)
                    } else if ($scope.groupTrendGranularity === 'weekly') {
                        date = moment.utc().weeks(analysis.week)
                    } else if ($scope.groupTrendGranularity === 'daily') {
                        date = moment.utc(analysis.date, 'YYYY-MM-DD hh:mm:ss');
                    }
                    if (date >= fromDate && date < today) {
                        var formattedDate = date.format('YYYY-MM-DD');
                        if (!dataMap[formattedDate]) {
                            dataMap[formattedDate] = {}
                        }
                        dataMap[formattedDate][member.username] = $filter('number')(analysis.totAlc || analysis.todAlc, 2);
                    }
                });
            });

            var value;
            _.forEach($scope.group.members, function (member) {
                var dataForMember = [];
                var currentDate = moment.utc(fromDate);
                while (currentDate < today) {
                    var formattedDate = currentDate.format('YYYY-MM-DD');
                    if (dataMap[formattedDate]) {
                        value = dataMap[formattedDate][member.username];
                        if (!value) {
                            value = null;
                        }
                    } else {
                        value = null;
                    }
                    dataForMember.push(value);

                    if ($scope.groupTrendGranularity === 'monthly') {
                        currentDate = currentDate.add(1, 'months');
                    } else if ($scope.groupTrendGranularity === 'weekly') {
                        currentDate = currentDate.add(1, 'weeks');
                    } else if ($scope.groupTrendGranularity === 'daily') {
                        currentDate = currentDate.add(1, 'days');
                    }
                }
                $scope.groupTrendData.push(dataForMember);
                $scope.groupTrendSeries.push(member.username);
            });
            var currentDate = moment.utc(fromDate);
            var label;
            while (currentDate < today) {
                if ($scope.groupTrendGranularity === 'monthly') {
                    $scope.groupTrendLabels.push(currentDate.format('MMM'));
                    currentDate = currentDate.add(1, 'months');
                } else if ($scope.groupTrendGranularity === 'weekly') {
                    $scope.groupTrendLabels.push(currentDate.format('D MMM'));
                    currentDate = currentDate.add(1, 'weeks');
                } else if ($scope.groupTrendGranularity === 'daily') {
                    $scope.groupTrendLabels.push(currentDate.format('D MMM'));
                    currentDate = currentDate.add(1, 'days');
                }
            }
        };

        $scope.getDailyChart = function (nbDays) {
            $scope.groupTrendGranularity = 'daily';
            $scope.groupTrendDataOptions.scaleStepWidth = 2.5;

            $scope.groupProfiles = {};
            var promises = {};
            _.forEach($scope.group.members, function (member) {
                promises[member.username] = Analysis.getDaily(member._id);
            });

            $q.all(promises).then(function (result) {
                $scope.groupProfiles = result;
                $scope.drawGroupChart();
            });
        };

        $scope.getWeeklyChart = function () {
            $scope.groupTrendGranularity = 'weekly';
            $scope.groupTrendDataOptions.scaleStepWidth = 8;

            $scope.groupProfiles = {};
            var promises = {};
            _.forEach($scope.group.members, function (member) {
                promises[member.username] = Analysis.getWeekly(member._id);
            });

            $q.all(promises).then(function (result) {
                $scope.groupProfiles = result;
                $scope.drawGroupChart();
            });
        };

        $scope.getMonthlyChart = function () {
            $scope.groupTrendGranularity = 'monthly';
            $scope.groupTrendDataOptions.scaleStepWidth = 25;

            $scope.groupProfiles = {};
            var promises = {};
            _.forEach($scope.group.members, function (member) {
                promises[member.username] = Analysis.getMonthly(member._id);
            });

            $q.all(promises).then(function (result) {
                $scope.groupProfiles = result;
                $scope.drawGroupChart();
            });

        };

        $scope.loadMonthlyRanking = function() {
            $scope.groupRanking = null;
            Group.getMonthlyRanking($stateParams.groupId, $scope.month).success(function (groupRanking) {
                $scope.groupRanking = groupRanking;
            });
        };

        $scope.goToNextMonth = function () {
            $scope.month = $scope.nextMonth;
            $scope.setMonths();
            $scope.loadMonthlyRanking();
        };

        $scope.goToPrevMonth = function () {
            $scope.month = $scope.prevMonth;
            $scope.setMonths();
            $scope.loadMonthlyRanking();
        };

        $scope.setMonths = function () {
            $scope.nextMonth = moment.utc($scope.month).add(1, 'months').valueOf();
            $scope.prevMonth = moment.utc($scope.month).subtract(1, 'months').valueOf();
        };

        $scope.today = moment.utc().valueOf();
        $scope.month = moment.utc().valueOf();
        $scope.setMonths();
        $scope.loadGroup();
        $scope.loadMonthlyRanking();
    }
]);

