'use strict';

angular.module('mean.ddb').controller('DdbDrinkController', ['$scope', '$stateParams', '$state', '$filter', '$rootScope', 'Drink',
    function ($scope, $stateParams, $state, $filter, $rootScope, Drink) {

        $scope.loadDrink = function () {
            Drink.get($stateParams.drinkId).success(function (drink) {
                $scope.drink = drink;
            });
        };

        $scope.loadDrink();
    }
]);

