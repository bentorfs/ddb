'use strict';

var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    _ = require('lodash'),
    moment = require('moment'),
    rebuild = require('./../service/rebuild');

module.exports = {
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

        Measurement.findOneAndUpdate({date: dateToUpdate.valueOf(), user: req.user, isDeleted: false}, upsertData, {
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
            rebuild.rebuildUser(req.user);
        });
    },
    all: function (req, res) {
        var user = req.user;

        Measurement.find({user: req.user, isDeleted: false}).sort('date').exec(function (err, measurements) {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Cannot retrieve measurements'
                });
            }

            var today = moment.utc().startOf('day');
            var toSave = [];
            var nbSaved = measurements.length;
            if (nbSaved === 0) {
                var firstEntry = getEmptyMeasurement(req.user, today);
                toSave.push(firstEntry);
            } else {
                var currentDay = moment.utc(measurements[0].date).startOf('day');
                var i = 1;
                while (currentDay < today) {
                    currentDay.add(1, 'days');
                    if (nbSaved > i) {
                        while (currentDay < moment.utc(measurements[i].date)) {
                            toSave.push(getEmptyMeasurement(req.user, currentDay));
                            currentDay.add(1, 'days');
                        }
                        i++;
                    } else {
                        toSave.push(getEmptyMeasurement(req.user, currentDay));
                    }
                }
            }
            if (toSave.length > 0) {
                saveMeasurements(req.user, toSave, function () {
                    Measurement.find({
                        user: req.user,
                        isDeleted: false
                    }).sort('date').exec(function (err, measurements) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                error: 'Cannot list the measurements'
                            });
                        } else {
                            res.json(measurements);
                        }
                    });
                });
                rebuild.rebuildUser(req.user);
            } else {
                res.json(measurements);
            }
        });
    }
};

function getEmptyMeasurement(user, date) {
    return {
        user: user._id,
        date: date.valueOf(),
        pilsner: 0,
        strongbeer: 0,
        wine: 0,
        liquor: 0,
        isDeleted: false
    };
}

function saveMeasurements(user, measurements, callback) {
    Measurement.create(measurements, function (err) {
        if (err) {
            console.error('Failed to save measurements for: ' + user.username + ', due to: ' + err);
        } else {
            console.info('Successfully saved ' + measurements.length + ' measurements for ' + user.username);
        }
        callback();
    });
}