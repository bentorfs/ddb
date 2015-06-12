'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    Profile = mongoose.model('Profile'),
    _ = require('lodash'),
    moment = require('moment');

module.exports = {
    processUser: function (user) {
        Measurement.find({user: user}).sort('date').exec(function (err, measurements) {
            if (err) {
                console.error('Could not load measurement to update daily analysis: ' + err);
                return;
            }

            var analyses = updateDailyAnalysis(measurements, user);
            updateProfile(measurements, analyses, user);
        });


    }
};

function updateProfile(measurements, analyses, user) {
    if (measurements.length != analyses.length || measurements.length === 0) {
        console.error("Inequal number of measurements and analyses");
        return;
    }

    var alcPerDay = [0, 0, 0, 0, 0, 0, 0];
    var nbOfWeekDays = [0, 0, 0, 0, 0, 0, 0];
    var drinkingDays = 0;
    var highestBinge = 0;
    var highestBingeDate = null;
    var dailyAlcohol = [];
    for (var i = 0; i < measurements.length; i++) {
        alcPerDay[analyses[i].dayOfWeek] += analyses[i].todAlc;

        if (analyses[i].todAlc != 0) {
            drinkingDays++;
        }

        nbOfWeekDays[analyses[i].dayOfWeek]++;

        if (analyses[i].todAlc > highestBinge) {
            highestBinge = analyses[i].todAlc;
            highestBingeDate = analyses[i].date;
        }

        dailyAlcohol.push(analyses[i].todAlc);
    }

    var avgAlcStdev = standardDeviation(dailyAlcohol);

    var profileData = {
        totAlcMon: alcPerDay[1],
        totAlcTue: alcPerDay[2],
        totAlcWed: alcPerDay[3],
        totAlcThu: alcPerDay[4],
        totAlcFri: alcPerDay[5],
        totAlcSat: alcPerDay[6],
        totAlcSun: alcPerDay[0],

        avgAlcMon: (alcPerDay[1] / nbOfWeekDays[1]) || 0,
        avgAlcTue: (alcPerDay[2] / nbOfWeekDays[2]) || 0,
        avgAlcWed: (alcPerDay[3] / nbOfWeekDays[3]) || 0,
        avgAlcThu: (alcPerDay[4] / nbOfWeekDays[4]) || 0,
        avgAlcFri: (alcPerDay[5] / nbOfWeekDays[5]) || 0,
        avgAlcSat: (alcPerDay[6] / nbOfWeekDays[6]) || 0,
        avgAlcSun: (alcPerDay[0] / nbOfWeekDays[0]) || 0,

        avgWorkWeek: ((alcPerDay[1] + alcPerDay[2] + alcPerDay[3] + alcPerDay[4]) / (nbOfWeekDays[1] + nbOfWeekDays[2] + nbOfWeekDays[3] + nbOfWeekDays[4]) || 0),
        avgWeekend: ((alcPerDay[5] + alcPerDay[6] + alcPerDay[0]) / (nbOfWeekDays[5] + nbOfWeekDays[6] + nbOfWeekDays[0]) || 0),

        totPilsner: _.last(analyses).cumPilsner,
        totStrongbeer: _.last(analyses).cumStrongbeer,
        totWine: _.last(analyses).cumWine,
        totLiquor: _.last(analyses).cumLiquor,

        totAlcPilsner: _.last(analyses).cumAlcPilsner,
        totAlcStrongbeer: _.last(analyses).cumAlcStrongbeer,
        totAlcWine: _.last(analyses).cumAlcWine,
        totAlcLiquor: _.last(analyses).cumAlcLiquor,
        totAlc: _.last(analyses).cumAlc,

        avgPilsner: _.last(analyses).cumPilsner / measurements.length,
        avgStrongbeer: _.last(analyses).cumStrongbeer / measurements.length,
        avgWine: _.last(analyses).cumWine / measurements.length,
        avgLiquor: _.last(analyses).cumLiquor / measurements.length,

        avgAlcPilsner: _.last(analyses).cumAlcPilsner / measurements.length,
        avgAlcStrongbeer: _.last(analyses).cumAlcStrongbeer / measurements.length,
        avgAlcWine: _.last(analyses).cumAlcWine / measurements.length,
        avgAlcLiquor: _.last(analyses).cumAlcLiquor / measurements.length,
        avgAlc: _.last(analyses).cumAlc / measurements.length,

        consistencyFactor: (avgAlcStdev / (_.last(analyses).cumAlc / measurements.length)) || 0,

        activeDays: measurements.length,
        drinkingDays: drinkingDays,
        drinkingDayRate: drinkingDays / measurements.length,

        highestBinge: highestBinge,
        highestBingeDate: highestBingeDate
    };

    Profile.findOneAndUpdate({
        user: user
    }, profileData, {upsert: true}, function (err) {
        if (err) {
            console.error('Could not update profile: ' + err);
        }
    });
}

function updateDailyAnalysis(measurements, user) {
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

    return result;
}

function standardDeviation(values) {
    var avg = average(values);

    var squareDiffs = values.map(function (value) {
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });

    var avgSquareDiff = average(squareDiffs);

    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
}

function average(data) {
    var sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    var avg = sum / data.length;
    return avg;
}