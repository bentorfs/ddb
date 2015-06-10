'use strict';

/* jshint -W098 */
angular.module('mean.ddb').controller('DdbProfileController', ['$scope', 'Global', 'Profile', 'DailyAnalysis', 'MeanUser',
    function ($scope, Global, Profile, DailyAnalysis, MeanUser) {

        $scope.user = MeanUser;

        Profile.query(function (profile) {
            $scope.typeLabels = ["Pils", "Zwaar Bier", "Wijn", "Sterke Drank"];
            $scope.typeProfileData = [[profile[0].totAlcPilsner, profile[0].totAlcStrongbeer, profile[0].totAlcWine, profile[0].totAlcLiquor]];

            $scope.weekLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            $scope.weekProfileData = [[profile[0].totAlcMon, profile[0].totAlcTue, profile[0].totAlcWed, profile[0].totAlcThu, profile[0].totAlcFri, profile[0].totAlcSat, profile[0].totAlcSun]];

            $scope.profile = profile[0];
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
                $scope.cumulativeTrendData[0].push(analysis.cumAlc);
            });

        });

    }
]);

