'use strict';

angular.module('mean.ddb').directive('notificationItem', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<span static-include="ddb/views/templates/notifications/{{notification.type}}.html"></span>',
        controller: ['$rootScope', '$scope',
            function ($rootScope, $scope) {


            }]
    };
});

angular.module('mean.ddb').directive('staticInclude', ['$http', '$templateCache', '$compile', function ($http, $templateCache, $compile) {
    return {
        link: function (scope, element, attrs) {
            var templatePath = attrs.staticInclude;
            $http.get(templatePath, {cache: $templateCache}).success(function (response) {
                var contents = element.parent().html(response).contents();
                $compile(contents)(scope);
            });
        }
    };
}]);