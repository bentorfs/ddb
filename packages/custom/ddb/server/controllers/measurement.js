'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    _ = require('lodash'),
    moment = require('moment'),
    dataprocessor = require('./dataprocessor');

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

    return {
        update: function (req, res) {
            var measurement = new Measurement(req.body);
            measurement.user = req.user;
            var upsertData = measurement.toObject();
            delete upsertData._id;
            delete upsertData.__v;

            Measurement.findByIdAndUpdate(measurement.id, upsertData, {
                upsert: true,
                new: true
            }, function (err, updatedMeasurement) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        error: 'Cannot update the measurement'
                    });
                }
                res.send(updatedMeasurement);
                dataprocessor.processUser(req.user);
            });
        },
        all: function (req, res) {
            var user = req.user;

            // Todo: check if the user is a buddy

            Measurement.find({user: req.user}).sort('date').populate('user', 'name username').exec(function (err, measurements) {
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
                    var currentDay = moment.utc(measurements[0].date).startOf('day');
                    var i = 1;
                    while (currentDay < today) {
                        currentDay.add(1, 'days');

                        if (nbSaved > i) {
                            while (currentDay < moment.utc(measurements[i].date)) {
                                measurements.push(createEmptyMeasurement(req.user, currentDay));
                                currentDay.add(1, 'days');
                            }
                            i++;
                        } else {
                            measurements.push(createEmptyMeasurement(req.user, currentDay));
                        }
                    }
                    res.json(measurements);
                    dataprocessor.processUser(req.user);
                }
            });
        }
    };
};