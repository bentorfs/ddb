'use strict';

angular.module('mean.ddb').controller('DdbCatalogController', ['$scope', '$stateParams', '$state', '$filter', '$rootScope', 'Drink', 'MeanUser',
    function ($scope, $stateParams, $state, $filter, $rootScope, Drink, MeanUser) {

        $scope.loadDrinks = function () {
            Drink.list($scope.search, null).success(function (drinks) {
                $scope.drinks = drinks;
            });
        };

        $scope.loadDrinks();

    }
]);

