'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', 'Menus', 'MeanUser', '$state', '$anchorScroll', 'Group',
    function ($scope, $rootScope, Menus, MeanUser, $state, $anchorScroll, Group) {

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

        $rootScope.$on('beerkeeper.groups.update', function () {
            $scope.updateGroups();
        });

        $rootScope.$on('$stateChangeSuccess', function () {
            $anchorScroll(top);
        });

        var vm = this;

        vm.menus = {};
        vm.hdrvars = {
            authenticated: MeanUser.loggedin,
            user: MeanUser.user,
            isAdmin: MeanUser.isAdmin
        };

        // Default hard coded menu items for main menu
        var defaultMainMenu = [];

        // Query menus added by modules. Only returns menus that user is allowed to see.
        function queryMenu(name, defaultMenu) {

            Menus.query({
                name: name,
                defaultMenu: defaultMenu
            }, function (menu) {
                vm.menus[name] = menu;
            });
        }

        // Query server for menus and check permissions
        queryMenu('main', defaultMainMenu);
        queryMenu('account', []);


        $scope.isCollapsed = false;

        $rootScope.$on('loggedin', function () {
            vm.hdrvars = {
                authenticated: MeanUser.loggedin,
                user: MeanUser.user,
                isAdmin: MeanUser.isAdmin
            };

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
            queryMenu('main', defaultMainMenu);
            $state.go('home');
        });

    }
]);
