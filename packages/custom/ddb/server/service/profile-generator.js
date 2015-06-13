'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    Profile = mongoose.model('Profile'),
    _ = require('lodash'),
    moment = require('moment');

module.exports = {
    processUser: function (user, callback) {
        DailyAnalysis.find({user: user}).sort('date').exec(function (err, analyses) {
            if (err) {
                console.error('Could not load daily analyses to update profile for user: ' + user.username + ', because: ' + err);
                return;
            }

            if (analyses.length > 0) {
                console.info('Updating profile for user ' + user.username);
                updateProfile(analyses, user, callback);
            } else {
                console.info('Skipping profile update for user ' + user.username + ', because there are no daily analyses');
            }

        });
    }
};

function updateProfile(analyses, user, callback) {
    var alcPerDay = [0, 0, 0, 0, 0, 0, 0];
    var nbOfWeekDays = [0, 0, 0, 0, 0, 0, 0];
    var drinkingDays = 0;
    var highestBinge = 0;
    var highestBingeDate = null;
    var dailyAlcohol = [];
    var groups = {};
    for (var i = 0; i < analyses.length; i++) {
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

        _.forEach(analyses[i].groups, function (group) {
            if (!groups[group.group]) {
                groups[group.group] = {happyLonerFactor: 0, sadLonerFactor: 0}
            }

            if (group.lonerFactor < 0) {
                groups[group.group].sadLonerFactor += Math.abs(group.lonerFactor);
            } else if (group.lonerFactor > 0) {
                groups[group.group].happyLonerFactor += group.lonerFactor;
            }
        });
    }

    var groupData = [];
    _.forEach(_.keys(groups), function (key) {
        groupData.push(
            {
                group: key,
                sadLonerFactor: groups[key].sadLonerFactor,
                happyLonerFactor: groups[key].happyLonerFactor
            }
        );
    });

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

        avgAlcWorkWeek: ((alcPerDay[1] + alcPerDay[2] + alcPerDay[3] + alcPerDay[4]) / (nbOfWeekDays[1] + nbOfWeekDays[2] + nbOfWeekDays[3] + nbOfWeekDays[4]) || 0),
        avgAlcWeekend: ((alcPerDay[5] + alcPerDay[6] + alcPerDay[0]) / (nbOfWeekDays[5] + nbOfWeekDays[6] + nbOfWeekDays[0]) || 0),

        totPilsner: _.last(analyses).cumPilsner,
        totStrongbeer: _.last(analyses).cumStrongbeer,
        totWine: _.last(analyses).cumWine,
        totLiquor: _.last(analyses).cumLiquor,

        totAlcPilsner: _.last(analyses).cumAlcPilsner,
        totAlcStrongbeer: _.last(analyses).cumAlcStrongbeer,
        totAlcWine: _.last(analyses).cumAlcWine,
        totAlcLiquor: _.last(analyses).cumAlcLiquor,
        totAlc: _.last(analyses).cumAlc,

        avgPilsner: _.last(analyses).cumPilsner / analyses.length,
        avgStrongbeer: _.last(analyses).cumStrongbeer / analyses.length,
        avgWine: _.last(analyses).cumWine / analyses.length,
        avgLiquor: _.last(analyses).cumLiquor / analyses.length,

        avgAlcPilsner: _.last(analyses).cumAlcPilsner / analyses.length,
        avgAlcStrongbeer: _.last(analyses).cumAlcStrongbeer / analyses.length,
        avgAlcWine: _.last(analyses).cumAlcWine / analyses.length,
        avgAlcLiquor: _.last(analyses).cumAlcLiquor / analyses.length,
        avgAlc: _.last(analyses).cumAlc / analyses.length,

        consistencyFactor: (avgAlcStdev / (_.last(analyses).cumAlc / analyses.length)) || 0,

        activeDays: analyses.length,
        drinkingDays: drinkingDays,
        drinkingDayRate: drinkingDays / analyses.length,

        highestBinge: highestBinge,
        highestBingeDate: highestBingeDate,

        groups: groupData
    };

    Profile.findOneAndUpdate({
        user: user
    }, profileData, {upsert: true}, function (err) {
        if (err) {
            console.error('Could not update profile for user: ' + user.username + ', because: ' + err);
            return;
        }
        console.info('Successfully saved updated profile for user ' + user.username);
        callback();
    });
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