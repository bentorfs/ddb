'use strict';

/* jshint -W098 */
angular.module('mean.ddb').controller('DdbProfileController', ['$scope', 'Global', 'Profile', 'DailyAnalysis', 'MeanUser',
    function ($scope, Global, Profile, DailyAnalysis, MeanUser) {

        $scope.user = MeanUser;

        Profile.query(function (profile) {
            $scope.typeLabels = ["Pils", "Zwaar Bier", "Wijn", "Sterke Drank"];
            $scope.typeProfileData = [[profile[0].totPilsnerAlc, profile[0].totStrongbeerAlc, profile[0].totWineAlc, profile[0].totLiquorAlc]];
        });

        DailyAnalysis.query(function (dailyAnalyses) {
            $scope.dailyAnalyses = dailyAnalyses;

            $scope.spreadAverageDataOptions = {showScale: false, pointDot: false, pointHitDetectionRadius: 1};
            $scope.spreadAverageLabels = [];
            $scope.spreadAverageSeries = ['Series A'];
            $scope.spreadAverageData = [
                []
            ];

            $scope.cumulativeTrendDataOptions = {showScale: false, pointDot: false, pointHitDetectionRadius: 1};
            $scope.cumulativeTrendLabels = [];
            $scope.cumulativeTrendSeries = ['Series A'];
            $scope.cumulativeTrendData = [
                []
            ];

            angular.forEach(dailyAnalyses, function (analysis) {
                var dateString = moment.utc(analysis.date, 'YYYY-MM-DD hh:mm:ss').format('MM/DD');
                $scope.spreadAverageLabels.push(dateString);
                $scope.spreadAverageData[0].push(analysis.spreadAverage);

                $scope.cumulativeTrendLabels.push(dateString);
                $scope.cumulativeTrendData[0].push(analysis.totalCum);
            });

        });

    }
]);

