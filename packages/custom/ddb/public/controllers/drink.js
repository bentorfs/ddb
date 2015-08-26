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

        $scope.replaceDrink = function() {
            $scope.saving = true;
            Drink.replace($scope.drink._id, $scope.replacementDrink._id).success(function (drink) {
                $scope.drink = $scope.replacementDrink;
                $scope.editMode = false;
            }).finally(function () {
                $scope.saving = false;
            });
        };

        $scope.getDrinks = function (name) {
            $scope.newDrinkName = name;
            return Drink.list(name, 0, 20).then(function (response) {
                return response.data;
            });
        };

        $scope.isOwnDrink = function () {
            return $scope.drink && $scope.drink.createdBy && ($scope.drink.createdBy === $scope.user.get()._id);
        };

        $scope.loadDrink();

        $scope.user = MeanUser;
        $rootScope.$on('loggedin', function () {
            $scope.user = MeanUser;
        });
    }
]);

