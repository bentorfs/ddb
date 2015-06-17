'use strict';

angular.module('mean.ddb').controller('DdbNewsController', ['$rootScope', '$scope', 'MeanUser', 'Measurement', 'Drink', 'Profile',
    function ($rootScope, $scope, MeanUser, Measurement, Drink, Profile) {

        $scope.getDrinks = function (name) {
            $scope.newDrinkName = name;
            return Drink.list(name).then(function (response) {
                return response.data;
            });
        };

        $scope.addNewDrink = function () {
            Drink.add({
                name: $scope.newDrinkName,
                alcoholContent: $scope.newDrinkAlcoholContent
            }).success(function (drink) {
                $scope.showAdd = false;
                $scope.newDrinkName = '';
                $scope.newDrinkAlcoholContent = '';
                $scope.selectedDrink = drink;
            })
        };

        $scope.setAmount = function (amount) {
            $scope.selectedAmount = amount;
        };

        $scope.getAmount = function () {
            return $scope.selectedAmount;
        };

        $scope.selectDrink = function (drink) {
            $scope.selectedDrink = drink;
        };

        $scope.loadData = function () {
            if ($scope.user._id) {
                Profile.getFrequentDrinks($scope.user._id).success(function (data) {
                    $scope.frequentDrinks = data;
                });
                Measurement.get(moment().valueOf()).success(function (data) {
                    $scope.measurement = data;
                });
            }
        };

        $scope.addConsumption = function () {
            Measurement.addConsumption(moment().valueOf(), {
                    drink: $scope.selectedDrink._id,
                    amount: $scope.selectedAmount
                }
            ).success(function (data) {
                    $scope.selectedDrink = null;
                    $scope.selectedAmount = null;
                    $scope.loadData();
                });
        };

        $scope.removeConsumption = function (consumption) {
            Measurement.removeConsumption(moment().valueOf(), consumption
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

