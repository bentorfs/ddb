'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    Measurement = mongoose.model('Measurement'),
    _ = require('lodash'),
    async = require('async'),
    moment = require('moment');

module.exports = {
    processAll: function (done) {
        User.find({}, function (err, users) {
            if (err) {
                return done(err);
            }
            var counter = _.after(users.length, done);
            _.forEach(users, function (user) {
                generateMeasurementsForUser(user, counter);
            })
        });
    },
    processUser: generateMeasurementsForUser
};

function generateMeasurementsForUser(user, done) {
    Measurement.find({user: user, isDeleted: false}).sort('date').exec(function (err, measurements) {
        if (err) {
            return done(err);
        }
        var today = moment.utc().startOf('day');
        var toSave = [];
        var nbSaved = measurements.length;
        if (nbSaved === 0) {
            var firstEntry = getEmptyMeasurement(user, today);
            toSave.push(firstEntry);
        } else {
            var currentDay = moment.utc(measurements[0].date).startOf('day');
            var i = 1;
            while (currentDay < today) {
                currentDay.add(1, 'days');
                if (nbSaved > i) {
                    while (currentDay < moment.utc(measurements[i].date)) {
                        toSave.push(getEmptyMeasurement(user, currentDay));
                        currentDay.add(1, 'days');
                    }
                    i++;
                } else {
                    toSave.push(getEmptyMeasurement(user, currentDay));
                }
            }
        }
        if (toSave.length > 0) {
            saveMeasurements(user, toSave, function (err) {
                if (err) {
                    done(err);
                } else {
                    done(null, toSave);
                }
            });
        } else {
            done(null, []);
        }
    });
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
        lastModifiedDate: moment.utc().valueOf()
    };
}

function saveMeasurements(user, measurements, callback) {
    Measurement.create(measurements, function (err) {
        if (err) {
            console.error('Failed to save MISSING measurements for: ' + user.username + ', due to: ' + err);
            callback(err);
        } else {
            console.info('Successfully saved ' + measurements.length + ' MISSING measurements for ' + user.username);
            callback();
        }
    });
}
