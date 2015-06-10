'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    moment = require('moment');

module.exports = function () {

    return {
        mine: function (req, res) {
            DailyAnalysis.find({user: req.user}).sort('date').populate('user', 'name username').exec(function (err, analyses) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the daily analysis'
                    });
                }

                res.json(analyses);
            });
        }
    };
};