'use strict';

var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    _ = require('lodash'),
    moment = require('moment'),
    rebuild = require('./../service/rebuild');

module.exports = {
    update: function (req, res) {
        var upsertData = req.body;
        upsertData.user = req.user;
        delete upsertData._id;
        delete upsertData.__v;

        var dateToUpdate = moment.utc(upsertData.date).startOf('day');
        if (dateToUpdate < moment.utc().subtract(60, 'days') || dateToUpdate > moment.utc().add(3, 'days')) {
            res.status(400);
            res.json({
                error: 'Cannot add measurements on this date'
            });
            return;
        }
        upsertData.date = dateToUpdate.valueOf();
        upsertData.lastModifiedDate = moment.utc().valueOf();

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
            rebuild.rebuildUser(req.user, function () {
                res.json(updatedMeasurement);
            });
        });
    },
    addConsumption: function (req, res) {
        var newConsumption = req.body;
        newConsumption.drinkDate = moment.utc();
        var dateToUpdate = moment.utc(parseInt(req.params.date, 10)).startOf('day');
        Measurement.findOneAndUpdate({
            date: dateToUpdate.valueOf(),
            user: req.user,
            isDeleted: false
        }, {
            '$push': {consumptions: newConsumption},
            lastModifiedDate: moment.utc().valueOf()
        }, {
            new: true
        }, function (err, updatedMeasurement) {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Cannot update the measurement'
                });
            }
            rebuild.rebuildUser(req.user, _.noop);
            res.json(updatedMeasurement);
        });
    },
    removeConsumption: function (req, res) {
        var dateToUpdate = moment.utc(parseInt(req.params.date, 10)).startOf('day');
        Measurement.findOneAndUpdate({
            date: dateToUpdate.valueOf(),
            user: req.user,
            isDeleted: false
        }, {
            '$pull': {
                consumptions: {
                    date: req.query.date,
                    amount: req.query.amount,
                    drink: req.query.drink
                }
            },
            lastModifiedDate: moment.utc().valueOf()
        }, {
            new: true
        }, function (err, updatedMeasurement) {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Cannot update the measurement'
                });
            }
            rebuild.rebuildUser(req.user, _.noop);
            res.json(updatedMeasurement);
        });
    },
    get: function (req, res) {
        var dateToGet = moment.utc(parseInt(req.params.date, 10)).startOf('day');
        if (dateToGet > moment.utc().add(3, 'days')) {
            res.status(400);
            res.json({
                error: 'Cannot add measurements on this date'
            });
            return;
        }
        var upsert = true;
        if (dateToGet < moment.utc().subtract(60, 'days')) {
            // Only get, don't create
            upsert = false;
        }

        var upsertData = {
            date: dateToGet.valueOf()
        };

        Measurement.findOneAndUpdate({date: dateToGet.valueOf(), user: req.user, isDeleted: false}, upsertData, {
            upsert: true,
            new: true
        }).populate('consumptions.drink').exec(function (err, measurement) {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Cannot get the measurement'
                });
            }
            res.json(measurement);
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
                            rebuild.rebuildUser(req.user, function () {
                                res.json(measurements);
                            });
                        }
                    });
                });
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
        drinks: [],
        pilsner: 0,
        strongbeer: 0,
        wine: 0,
        liquor: 0,
        isDeleted: false,
        lastModifiedDate: moment.utc().valueOf()
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