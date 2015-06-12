'use strict';

var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    Profile = mongoose.model('Profile'),
    _ = require('lodash'),
    async = require('async'),
    moment = require('moment');


module.exports = function () {

    return {
        purgeUser: function (req, res) {
            async.parallel(
                {
                    measurements: function (callback) {
                        Measurement.remove({user: req.user}, function (err) {
                            callback(err);
                        });
                    },
                    games: function (callback) {
                        DailyAnalysis.remove({user: req.user}, function (err) {
                            callback(err);
                        });
                    },
                    profile: function (callback) {
                        Profile.remove({user: req.user}, function (err) {
                            callback(err);
                        });
                    }
                },
                function (error, result) {
                    if (error) {
                        console.error('Failed to purge: ' + error);
                        return res.status(500).json({
                            error: 'Could not purge data for user ' + JSON.stringify(req.user)
                        });
                    }
                    res.json({});
                }
            );
        }
    };
};