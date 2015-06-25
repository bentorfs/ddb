'use strict';

angular.module('mean.ddb').controller('DdbDrinkController', ['$scope', '$stateParams', '$state', '$filter', '$rootScope', 'Drink', 'MeanUser',
    function ($scope, $stateParams, $state, $filter, $rootScope, Drink, MeanUser) {

        $scope.loadDrink = function () {
            Drink.get($stateParams.drinkId).success(function (drink) {
                $scope.drink = drink;
                $scope.topDrinkers = drink.topDrinkers;
            });
        };

        $scope.saveDrink = function () {
            $scope.saving = true;
            Drink.update($scope.drink._id, $scope.drink).success(function (drink) {
                $scope.drink = drink;
                $scope.editMode = false;
            }).finally(function () {
                $scope.saving = false;
            });
        };

        $scope.isOwnDrink = function () {
            return $scope.drink && $scope.drink.createdBy && ($scope.drink.createdBy === $scope.user._id);
        };

        $scope.loadDrink();

        $scope.user = MeanUser.get();
        $rootScope.$on('loggedin', function () {
            $scope.user = MeanUser.get();;
        });
    }
]);

