'use strict';

angular.module('mean.ddb').directive('trophyRanking', function () {
    return {
        restrict: 'E',
        scope: {
            trophyName: '@',
            trophyDescription: '@',
            ranking: '='
        },
        templateUrl: 'ddb/views/templates/trophy-ranking.html',
        controller: ['$scope', function ($scope) {



        }]
    };
});