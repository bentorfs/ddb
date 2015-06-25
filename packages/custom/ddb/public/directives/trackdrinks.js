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

                $scope.$watch('selectedDrink', function () {
                    if ($scope.selectedDrink) {
                        $scope.updateSizes();
                        $scope.scrollTo('select-amount');
                        $rootScope.$emit('drinkSelected');
                    }
                });

                $scope.$watch('selectedAmount', function () {
                    if ($scope.selectedAmount) {
                        $rootScope.$emit('amountSelected');
                    }
                });

                $scope.getDrinks = function (name) {
                    $scope.newDrinkName = name;
                    return Drink.list(name, 0, 20).then(function (response) {
                        return response.data;
                    });
                };

                $scope.addNewDrink = function () {
                    $scope.savingDrink = true;
                    Drink.add({
                        name: $scope.newDrinkName,
                        type: $scope.newDrinkType,
                        alc: $scope.newDrinkAlcoholContent >= 1 ? $scope.newDrinkAlcoholContent / 100 : $scope.newDrinkAlcoholContent
                    }).success(function (drink) {
                        $scope.showAdd = false;
                        $scope.newDrinkName = '';
                        $scope.newDrinkAlcoholContent = '';
                        $scope.selectedDrink = drink;
                    }).finally(function () {
                        $scope.savingDrink = false;
                    });
                };


                $scope.scrollTo = function (location) {
                    if (window.mobilecheck()) {
                        smoothScroll(document.getElementById(location), {offset: 55});
                    }
                };

                $scope.setAmount = function (amount) {
                    $scope.selectedAmount = amount;
                };

                $scope.getAmount = function () {
                    return $scope.selectedAmount;
                };

                $scope.setNewDrinkType = function (type) {
                    $scope.newDrinkType = type;
                };

                $scope.selectDrink = function (drink) {
                    $scope.selectedDrink = drink;
                };

                $scope.loadData = function () {
                    if ($scope.user._id) {
                        Profile.getFrequentDrinks($scope.user._id).success(function (data) {
                            $scope.frequentDrinks = data;
                        });
                    }
                };

                $scope.addConsumption = function () {
                    $scope.savingConsumption = true;
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
                        }
                    ).finally(function () {
                            $scope.savingConsumption = false;
                        }
                    );
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

angular.module('mean.ddb').directive('focusOnEvent', function ($timeout, $parse) {
    return {
        controller: ['$rootScope', '$element', '$attrs', function ($rootScope, $element, $attrs) {
            var event = $attrs.focusOnEvent;
            $rootScope.$on(event, function () {
                $timeout(function () {
                    $element[0].focus();
                });
            });
        }]
    };
});