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

        $scope.loadRanking = function () {
            Group.getRanking($stateParams.groupId).success(function (ranking) {
                $scope.ranking = ranking;
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
                showScale: true,
                pointDot: false,
                pointHitDetectionRadius: 1
            };
            $scope.groupTrendSeries = [];
            var fromDate = moment.utc().subtract(nbDays, 'days');
            var today = moment.utc().startOf('day');
            var maxLength = 0;
            _.forEach($scope.group.members, function (member) {
                var dataForMember = [];
                var i = 0;
                _.forEach($scope.groupProfiles[member.username].data.series, function (serie) {
                    var date = moment.utc(serie.date, 'YYYY-MM-DD hh:mm:ss');
                    if (date >= fromDate && date < today) {
                        i++;
                        dataForMember.push($filter('number')(serie.spreadAlc, 2));
                    }
                });
                if (i > maxLength) {
                    maxLength = i;
                }
                $scope.groupTrendData.push(dataForMember);
                $scope.groupTrendSeries.push(member.username);
            });
            for (var j = 0; j < maxLength; j++) {
                $scope.groupTrendLabels.push('');
            }

            // Pad in front for data that are shorter than maxLength
            _.forEach($scope.groupTrendData, function (series) {
                var difference = maxLength - series.length;
                for (var j = 0; j < difference; j++) {
                    series.unshift(null);
                }
            })
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


        $scope.loadGroup();
        $scope.loadRanking();
    }
]);

