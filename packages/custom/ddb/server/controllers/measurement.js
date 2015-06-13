'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    _ = require('lodash'),
    moment = require('moment'),
    dailyanalysisGenerator = require('./../service/dailyanalysis-generator'),
    dailygroupanalysisGenerator = require('./../service/dailygroupanalysis-generator'),
    profileGenerator = require('./../service/profile-generator'),
    grouprankingGenerator = require('./../service/groupranking-generator');

module.exports = function () {

    var createEmptyMeasurement = function (user, date) {
        var measurementData = {
            user: user,
            date: date,
            pilsner: 0,
            strongbeer: 0,
            wine: 0,
            liquor: 0
        };
        var emptyMeasurement = new Measurement(measurementData);
        emptyMeasurement.save(emptyMeasurement);
        return emptyMeasurement;
    };

    var updateStatistics = function (user) {
        dailyanalysisGenerator.processUser(user, function () {
            dailygroupanalysisGenerator.processUser(user, function () {
                profileGenerator.processUser(user, function () {
                    grouprankingGenerator.processUser(user);
                });
            });
        });
    };

    return {
        update: function (req, res) {
            var measurement = new Measurement(req.body);
            measurement.user = req.user;
            var upsertData = measurement.toObject();
            delete upsertData._id;
            delete upsertData.__v;

            var dateToUpdate = moment.utc(measurement.date).startOf('day');
            if (dateToUpdate < moment.utc('2015-01-01 00:00:00', 'YYYY-MM-DD hh:mm:ss')) {
                return res.status(403).json({
                    error: 'Cannot add measurements on this date'
                });
            }

            Measurement.findOneAndUpdate({date: dateToUpdate.valueOf(), user: req.user}, upsertData, {
                upsert: true,
                new: true
            }, function (err, updatedMeasurement) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: 'Cannot update the measurement'
                    });
                }
                res.send(updatedMeasurement);
                updateStatistics(req.user);
            });
        },
        all: function (req, res) {
            var user = req.user;

            Measurement.find({user: req.user}).sort('date').exec(function (err, measurements) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the measurements'
                    });
                }

                var today = moment.utc().startOf('day');
                var nbSaved = measurements.length;
                if (nbSaved === 0) {
                    var firstEntry = createEmptyMeasurement(req.user, today);
                    res.json([firstEntry]);
                } else {
                    var addedRecord = false;
                    var currentDay = moment.utc(measurements[0].date).startOf('day');
                    var i = 1;
                    while (currentDay < today) {
                        currentDay.add(1, 'days');

                        if (nbSaved > i) {
                            while (currentDay < moment.utc(measurements[i].date)) {
                                measurements.push(createEmptyMeasurement(req.user, currentDay));
                                addedRecord = true;
                                currentDay.add(1, 'days');
                            }
                            i++;
                        } else {
                            measurements.push(createEmptyMeasurement(req.user, currentDay));
                            addedRecord = true;
                        }
                    }
                    res.json(measurements);
                    if (addedRecord) {
                        updateStatistics(req.user);
                    }
                }
            });
        }
    };
};