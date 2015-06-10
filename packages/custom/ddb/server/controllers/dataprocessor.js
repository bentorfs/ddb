'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    _ = require('lodash'),
    moment = require('moment');

module.exports = {
    processUser: function (user) {
        Measurement.find({user: user}).sort('date').exec(function (err, measurements) {
            if (err) {
                console.log('Could not load measurement to update daily analysis: ' + err);
                return;
            }

            updateDailyAnalysis(measurements, user);
            //updateProfile(measurements, user);
        });


    }
};

function updateDailyAnalysis(measurements, user) {
    var pilsnerCum = 0, strongbeerCum = 0, wineCum = 0, liquorCum = 0, totalCum = 0, alcToday = 0;
    var spreadData = [0, 0, 0, 0, 0, 0, 0];
    spreadData.average = function () {
        return spreadData.reduce(function (prev, cur) {
                return prev + cur;
            }) / spreadData.length;
    };

    var spreadIndex = 0;
    _.forEach(measurements, function (measurement) {
        pilsnerCum = pilsnerCum + measurement.pilsner;
        strongbeerCum = strongbeerCum + measurement.strongbeer;
        wineCum = wineCum + measurement.wine;
        liquorCum = liquorCum + measurement.liquor;
        alcToday = measurement.pilsner * 0.055 + measurement.strongbeer * 0.075 + measurement.wine * 0.125 + measurement.liquor * 0.43;
        totalCum = totalCum + alcToday;

        spreadData[spreadIndex % 7] = alcToday;

        var analysisData = {
            user: user,
            date: measurement.date,
            dayOfWeek: moment(measurement.date).day(),

            pilsnerAlc: measurement.pilsner * 0.055,
            strongbeerAlc: measurement.strongbeer * 0.075,
            wineAlc: measurement.wine * 0.125,
            liquorAlc: measurement.liquor * 0.43,
            totalAlc: alcToday,

            pilsnerCum: pilsnerCum,
            strongbeerCum: strongbeerCum,
            wineCum: wineCum,
            liquorCum: liquorCum,
            totalCum: totalCum,

            spreadAverage: spreadData.average()
        };

        DailyAnalysis.findOneAndUpdate({
            user: user,
            date: measurement.date
        }, analysisData, {upsert: true}, function (err) {
            if (err) {
                console.log('Could not update daily analysis: ' + err);
            }
        });

        spreadIndex++;
    });
}