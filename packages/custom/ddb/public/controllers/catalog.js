'use strict';

angular.module('mean.ddb').controller('DdbCatalogController', ['$scope', '$stateParams', '$state', '$filter', '$rootScope', 'Drink', 'MeanUser',
    function ($scope, $stateParams, $state, $filter, $rootScope, Drink, MeanUser) {

        $scope.pageSize = 25;
        $scope.currentPage = 0;
        $scope.totalResults = 10000; // Simple hack

        $scope.loadDrinks = function () {
            Drink.list($scope.search, $scope.currentPage * $scope.pageSize, $scope.pageSize).success(function (drinks) {
                $scope.drinks = drinks;
            });
        };

        $scope.$watch('currentPage', function () {
            $scope.loadDrinks();
        });

        $scope.loadDrinks();

    }
]);

