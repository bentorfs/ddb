'use strict';

angular.module('mean.ddb').directive('meanToken', function ($compile) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attrs) {
            if ($attrs.meanToken === '\'site-title\'') {
                var template = '<div>Drankdatabank</div>',
                    linkFn = $compile(template),
                    content = linkFn($scope);
                $element.html(content);
            }
        }
    };
});