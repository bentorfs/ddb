'use strict';

angular.module('mean.ddb').directive('trackDrinks', function () {
    return {
        restrict: 'E',
        scope: {
            date: '=',
            onSave: '='
        },
        templateUrl: 'ddb/views/templates/track-drinks.html',
        controller: ['$rootScope', '$scope', 'smoothScroll', 'MeanUser', 'Measurement', 'Drink', 'Profile',
            function ($rootScope, $scope, smoothScroll, MeanUser, Measurement, Drink, Profile) {

                $scope.allSizes = {
                    'beer': [25, 33, 50, 100],
                    'wine': [12, 17.5, 25, 75],
                    'liquor': [2.5, 4.5]
                };
                $scope.sizes = $scope.allSizes['beer'];

                $scope.updateSizes = function () {
                    if ($scope.selectedDrink.type) {
                        $scope.sizes = $scope.allSizes[$scope.selectedDrink.type];
                    } else {
                        $scope.sizes = $scope.allSizes['beer'];
                    }
                };

                $scope.getDrinks = function (name) {
                    $scope.newDrinkName = name;
                    return Drink.list(name).then(function (response) {
                        return response.data;
                    });
                };

                $scope.addNewDrink = function () {
                    Drink.add({
                        name: $scope.newDrinkName,
                        alc: $scope.newDrinkAlcoholContent
                    }).success(function (drink) {
                        $scope.showAdd = false;
                        $scope.newDrinkName = '';
                        $scope.newDrinkAlcoholContent = '';
                        $scope.selectedDrink = drink;
                    })
                };

                $scope.onDrinkSelect = function () {
                    $scope.scrollTo('select-amount');
                    $scope.updateSizes();
                };

                $scope.scrollTo = function (location) {
                    smoothScroll(document.getElementById(location), {offset: 55});
                };

                $scope.setAmount = function (amount) {
                    $scope.selectedAmount = amount;
                };

                $scope.getAmount = function () {
                    return $scope.selectedAmount;
                };

                $scope.selectDrink = function (drink) {
                    $scope.selectedDrink = drink;
                    $scope.updateSizes();
                };

                $scope.loadData = function () {
                    if ($scope.user._id) {
                        Profile.getFrequentDrinks($scope.user._id).success(function (data) {
                            $scope.frequentDrinks = data;
                        });
                    }
                };

                $scope.addConsumption = function () {
                    Measurement.addConsumption($scope.date, {
                            drink: $scope.selectedDrink._id,
                            amount: $scope.selectedAmount
                        }
                    ).success(function (data) {
                            $scope.selectedDrink = null;
                            $scope.selectedAmount = null;
                            $scope.newDrinkName = null;
                            $scope.loadData();
                            $scope.onSave();
                        });
                };

                $scope.user = MeanUser.get();
                $rootScope.$on('loggedin', function () {
                    $scope.user = MeanUser.get();
                    $scope.loadData();
                });
                $scope.loadData();


            }]
    };
});