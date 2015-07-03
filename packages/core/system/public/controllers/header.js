'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', 'MeanUser', '$state', '$anchorScroll', 'Group', 'Notification',
    function ($scope, $rootScope, MeanUser, $state, $anchorScroll, Group, Notification) {

        $scope.isActive = function (state) {
            return state === $state.$current.name;
        };

        $scope.collapse = function () {
            $scope.navCollapsed = true;
        };

        $scope.updateGroups = function () {
            Group.listGroups().then(function (groups) {
                $scope.groups = groups.data;
            });
        };

        $scope.followNotification = function (notification) {
            $state.go(notification.targetState, notification.targetStateParameters);
            Notification.markAsRead(notification._id);
            $scope.updateNotifications();
        };

        $rootScope.$on('beerkeeper.groups.update', function () {
            $scope.updateGroups();
        });

        $rootScope.$on('$stateChangeSuccess', function () {
            $anchorScroll(top);
        });

        $scope.updateNotifications = function () {
            Notification.listNotifications().then(function (notifications) {
                $scope.notifications = notifications.data;
            });
        };
        $scope.updateNotifications();

        var vm = this;

        vm.menus = {};
        vm.hdrvars = {
            authenticated: MeanUser.loggedin,
            user: MeanUser.user,
            isAdmin: MeanUser.isAdmin
        };

        // Default hard coded menu items for main menu
        var defaultMainMenu = [];

        $scope.isCollapsed = false;

        $rootScope.$on('loggedin', function () {
            vm.hdrvars = {
                authenticated: MeanUser.loggedin,
                user: MeanUser.user,
                isAdmin: MeanUser.isAdmin
            };
            $scope.updateNotifications();
            $scope.updateGroups();
        });

        vm.logout = function () {
            MeanUser.logout();
        };

        $rootScope.$on('logout', function () {
            vm.hdrvars = {
                authenticated: false,
                user: {},
                isAdmin: false
            };
            $state.go('home');
        });

    }
]);
