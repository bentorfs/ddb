'use strict';

var mongoose = require('mongoose'),
    Measurement = mongoose.model('Measurement'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    Profile = mongoose.model('Profile'),
    _ = require('lodash'),
    moment = require('moment');


module.exports = function () {

    return {
        purgeUser: function (req, res) {
            Measurement.remove({user: req.user}, function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Could not delete measurement data for user ' + JSON.stringify(req.user)
                    });
                }
                console.log('Deleted all measurement data for user ' + JSON.stringify(req.user));
            });

            DailyAnalysis.remove({user: req.user}, function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Could not delete analysis data for user ' + JSON.stringify(req.user)
                    });
                }
                console.log('Deleted all analysis data for user ' + JSON.stringify(req.user));
            });

            Profile.remove({user: req.user}, function (err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Could not delete profile data for user ' + JSON.stringify(req.user)
                    });
                }
                console.log('Deleted all profile data for user ' + JSON.stringify(req.user));
            });

            res.json({});
        }
    };
};