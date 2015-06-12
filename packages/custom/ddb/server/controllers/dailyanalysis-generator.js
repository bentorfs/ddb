'use strict';

var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    Group = mongoose.model('Group'),
    DailyGroupAnalysis = mongoose.model('DailyGroupAnalysis'),
    _ = require('lodash'),
    moment = require('moment'),
    async = require('async');

module.exports = {
    processUser: function (user) {

        // Get the users groups first
        Group.find({members: user._id}, function (err, groups) {
            if (err) {
                console.error(err);
                return;
            }

            async.parallel(
                {
                    measurements: function (callback) {
                        Measurement.find({user: user}).sort('date').exec(function (err, measurements) {
                            if (err) {
                                console.error('Could not load measurement to update daily analyses: ' + err);
                            }
                            callback(err, measurements);
                        });
                    },
                    groupAnalyses: function (callback) {
                        DailyGroupAnalysis.find({'_id.group': {'$in': groups}}).sort('date').exec(function (err, dailyGroupAnalyses) {
                            if (err) {
                                console.error('Could not load group analyses to update daily user analyses: ' + err);
                            }
                            callback(err, dailyGroupAnalyses);
                        });
                    }
                },
                function (error, result) {
                    if (error) {
                        return
                    }

                    var dailyAnalyses = updateDailyAnalyses(result.measurements, user);

                    saveDailyAnalyses(dailyAnalyses, user);
                }
            );

        });
    }
};

function updateDailyAnalyses(measurements, user) {
    var result = [];
    var cumPilsner = 0, cumStrongbeer = 0, cumWine = 0, cumLiquor = 0, cumAlc = 0, todAlc = 0;
    var spreadData = [0, 0, 0, 0, 0, 0, 0];
    spreadData.average = function () {
        return spreadData.reduce(function (prev, cur) {
                return prev + cur;
            }) / spreadData.length;
    };

    var spreadIndex = 0;
    _.forEach(measurements, function (measurement) {
        cumPilsner = cumPilsner + measurement.pilsner;
        cumStrongbeer = cumStrongbeer + measurement.strongbeer;
        cumWine = cumWine + measurement.wine;
        cumLiquor = cumLiquor + measurement.liquor;


        todAlc = measurement.pilsner * 0.055 + measurement.strongbeer * 0.075 + measurement.wine * 0.125 + measurement.liquor * 0.43;
        cumAlc = cumAlc + todAlc;

        spreadData[spreadIndex % 7] = todAlc;

        var analysisData = {
            user: user,
            date: measurement.date,
            dayOfWeek: moment(measurement.date).day(),

            todAlcPilsner: measurement.pilsner * 0.055,
            todAlcStrongbeer: measurement.strongbeer * 0.075,
            todAlcWine: measurement.wine * 0.125,
            todAlcLiquor: measurement.liquor * 0.43,
            todAlc: todAlc,

            cumPilsner: cumPilsner,
            cumStrongbeer: cumStrongbeer,
            cumWine: cumWine,
            cumLiquor: cumLiquor,

            cumAlcPilsner: cumPilsner * 0.055,
            cumAlcStrongbeer: cumStrongbeer * 0.075,
            cumAlcWine: cumWine * 0.125,
            cumAlcLiquor: cumLiquor * 0.43,

            cumAlc: cumAlc,

            spreadAverage: spreadData.average()
        };
        result.push(analysisData);


        spreadIndex++;
    });

    return result;
}

function saveDailyAnalyses(dailyAnalyses, user) {
    _.forEach(dailyAnalyses, function (analysis) {
        DailyAnalysis.findOneAndUpdate({
            user: user,
            date: analysis.date
        }, analysis, {upsert: true}, function (err) {
            if (err) {
                console.log('Could not update daily analysis: ' + err);
            }
        });
    })
}