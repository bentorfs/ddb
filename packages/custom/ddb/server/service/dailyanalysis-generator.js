'use strict';

var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    Group = mongoose.model('Group'),
    DailyGroupAnalysis = mongoose.model('DailyGroupAnalysis'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    moment = require('moment'),
    async = require('async');

module.exports = {
    processUser: function (user, callback) {

        // Get the users groups first
        Group.find({members: user._id}, function (err, groups) {
            if (err) {
                console.error('Could not load groups that user ' + user.username + 'is a member of, because: ' + err);
                return;
            }
            async.parallel(
                {
                    measurements: function (callback) {
                        Measurement.find({user: user, isDeleted: false}).sort('date').exec(function (err, measurements) {
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

                    var dailyAnalyses = getDailyAnalyses(result.measurements, user);
                    calculateLonerFactor(dailyAnalyses, result.groupAnalyses);
                    saveDailyAnalyses(dailyAnalyses, user, callback);
                }
            );

        });
    }
};

function getDailyAnalyses(measurements, user) {
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
            user: new ObjectId(user._id),
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

            spreadAverage: spreadData.average(),

            groups: []
        };
        result.push(analysisData);

        spreadIndex++;
    });

    return result;
}

function saveDailyAnalyses(dailyAnalyses, user, callback) {
    console.info('Clearing daily group analyses for: ' + user.username);
    DailyAnalysis.remove({'user': user._id}, function (err) {
        if (err) {
            console.error('Failed to clear daily analyses for: ' + user.username + ', due to: ' + err);
            return;
        }
        if (dailyAnalyses.length > 0) {
            console.info('Saving ' + dailyAnalyses.length + ' new daily analyses for: ' + user.username);
            DailyAnalysis.collection.insert(dailyAnalyses, function (err) {
                if (err) {
                    console.error('Failed to save daily analyses for: ' + user.username + ', due to: ' + err);
                    return;
                }
                console.info('Successfully saved ' + dailyAnalyses.length + ' daily analyses for ' + user.username);
                callback();
            });
        } else {
            console.info('Not saving any daily analyses for ' + user.username);
        }
    });
}

function calculateLonerFactor(dailyAnalyses, dailyGroupAnalyses) {
    _.forEach(dailyAnalyses, function (dailyAnalysis) {

        var groupAnalysesForThisDay = _.filter(dailyGroupAnalyses, function (groupAnalysis) {
            var result = _.isEqual(dailyAnalysis.date, groupAnalysis._id.date);
            return result;
        });

        _.forEach(groupAnalysesForThisDay, function (groupAnalysis) {
            dailyAnalysis.groups.push(
                {
                    group: groupAnalysis._id.group,
                    lonerFactor: dailyAnalysis.todAlc - groupAnalysis.todAvgAlc
                }
            );
        })
    });
}