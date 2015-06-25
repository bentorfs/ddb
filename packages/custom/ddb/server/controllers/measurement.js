'use strict';

var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    _ = require('lodash'),
    moment = require('moment'),
    rebuild = require('./../service/rebuild');

module.exports = {
    update: function (req, res, next) {
        var upsertData = req.body;
        upsertData.user = req.user;
        delete upsertData._id;
        delete upsertData.__v;

        var dateToUpdate = moment.utc(upsertData.date).startOf('day');
        if (dateToUpdate < moment.utc().subtract(60, 'days') || dateToUpdate > moment.utc().add(3, 'days')) {
            res.status(400).end();
            return;
        }
        upsertData.date = dateToUpdate.valueOf();
        upsertData.lastModifiedDate = moment.utc().valueOf();

        Measurement.findOneAndUpdate({date: dateToUpdate.valueOf(), user: req.user, isDeleted: false}, upsertData, {
            upsert: true,
            new: true
        }, function (err, updatedMeasurement) {
            if (err) {
                return next(err);
            }
            rebuild.rebuildUser(req.user._id, dateToUpdate.valueOf(), function (err) {
                if (err) {
                    return next(err);
                }
                res.json(updatedMeasurement);
            });
        });
    },
    addConsumption: function (req, res, next) {
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
                return next(err);
            }
            rebuild.rebuildUser(req.user._id, dateToUpdate.valueOf(), function (err) {
                if (err) {
                    return next(err);
                }
                res.json(updatedMeasurement);
            });
        });
    },
    removeConsumption: function (req, res, next) {
        var dateToUpdate = moment.utc(parseInt(req.params.date, 10)).startOf('day');
        Measurement.findOneAndUpdate({
            date: dateToUpdate.valueOf(),
            user: req.user,
            isDeleted: false
        }, {
            '$pull': {
                consumptions: {
                    _id: req.query.consumptionId
                }
            },
            lastModifiedDate: moment.utc().valueOf()
        }, {
            new: true
        }, function (err, updatedMeasurement) {
            if (err) {
                return next(err);
            }
            rebuild.rebuildUser(req.user._id, dateToUpdate.valueOf(), function (err) {
                if (err) {
                    return next(err);
                }
                res.json(updatedMeasurement);
            });
        });
    },
    all: function (req, res, next) {
        Measurement.find({user: req.user._id, isDeleted: false}).sort('date').exec(function (err, measurements) {
            if (err) {
                return next(err);
            } else {
                res.json(measurements);
            }
        });
    },
    get: function (req, res, next) {
        var dateToGet = moment.utc(parseInt(req.params.date, 10)).startOf('day');
        if (dateToGet > moment.utc().add(3, 'days')) {
            res.status(400).end();
            return;
        }

        backFillMeasurements(req.user, dateToGet.valueOf(), function () {
            Measurement.findOne({
                date: dateToGet.valueOf(),
                user: req.user,
                isDeleted: false
            })
                .populate('consumptions.drink')
                .exec(function (err, measurement) {
                    if (err) {
                        return next(err);
                    }
                    res.json(measurement);
                });
        });
    }
};

function backFillMeasurements(user, date, done) {
    if (user.registrationDate && (date < moment.utc(user.registrationDate, 'YYYY-MM-DD').valueOf())) {
        done();
    } else if (date < moment.utc('2015-05-07', 'YYYY-MM-DD').valueOf()) {
        done();
    } else {
        Measurement.findOne({
            date: date,
            user: user,
            isDeleted: false
        }, function (err, measurement) {
            if (err) {
                return done(err);
            }
            else if (measurement) {
                done(); // Done
            } else {
                // Create an empty measurement for this day
                console.info('Backfilling empty measurement for ' + user.name + ' on ' + moment.utc(date).format('YYYY-MM-DD'));
                Measurement.findOneAndUpdate({date: date, user: user, isDeleted: false},
                    getEmptyMeasurement(user, date),
                    {upsert: true},
                    function (err) {
                        if (err) {
                            return done(err);
                        }
                        rebuild.rebuildUser(user._id, date, function (err) {
                            if (err) {
                                return done(err);
                            }
                            // Recurse to one day earlier
                            var dayEarlier = moment.utc(date).subtract(1, 'days');
                            backFillMeasurements(user, dayEarlier, done);
                        });
                    });
            }
        });
    }
}

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
        lastModifiedDate: null
    };
}