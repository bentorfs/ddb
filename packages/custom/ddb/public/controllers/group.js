'use strict';

angular.module('mean.ddb').controller('DdbGroupController', ['$scope', '$stateParams', '$state', '$filter', '$rootScope', 'Group', 'Profile', '$q',
    function ($scope, $stateParams, $state, $filter, $rootScope, Group, Profile, $q) {

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

                $scope.loadTrendData();
            });
        };

        $scope.leaveGroup = function () {
            Group.leaveGroup($stateParams.groupId).success(function () {
                $state.go('managegroups');
                $rootScope.$emit('beerkeeper.groups.update');
            })
        };

        $scope.drawGroupChart = function (nbDays) {
            $scope.nbGroupDaysShown = nbDays;
            $scope.groupTrendLabels = [];
            $scope.groupTrendData = [];
            $scope.groupTrendDataOptions = {
                datasetFill: false,
                scaleOverride: true,
                scaleShowVerticalLines: false,
                scaleSteps: 15,
                scaleStepWidth: 1,
                scaleStartValue: 0,
                bezierCurve: true,
                bezierCurveTension: 0.4,
                showScale: true,
                pointDot: false,
                pointHitDetectionRadius: 1
            };
            $scope.groupTrendSeries = [];
            var fromDate = moment.utc().startOf('day').subtract(nbDays, 'days');
            var today = moment.utc().startOf('day');
            var dataMap = {};

            _.forEach($scope.group.members, function (member) {
                var dataForMember = [];
                var i = 0;
                _.forEach($scope.groupProfiles[member.username].data.series, function (serie) {
                    var date = moment.utc(serie.date, 'YYYY-MM-DD hh:mm:ss');
                    if (date >= fromDate && date < today) {
                        var formattedDate = date.format('YYYY-MM-DD');
                        if (!dataMap[formattedDate]) {
                            dataMap[formattedDate] = {}
                        }
                        dataMap[formattedDate][member.username] = $filter('number')(serie.spreadAlc, 2);
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
                    currentDate = currentDate.add(1, 'days');
                }
                $scope.groupTrendData.push(dataForMember);
                $scope.groupTrendSeries.push(member.username);
            });
            var currentDate = moment.utc(fromDate);
            while (currentDate < today) {
                $scope.groupTrendLabels.push('');
                currentDate = currentDate.add(1, 'days');
            }
        };

        $scope.loadTrendData = function () {
            $scope.groupProfiles = {};
            var promises = {};
            _.forEach($scope.group.members, function (member) {
                promises[member.username] = Profile.getUser(member._id)
            });

            $q.all(promises).then(function (result) {
                $scope.groupProfiles = result;
                $scope.drawGroupChart(30);
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

