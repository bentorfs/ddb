'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    moment = require('moment');

module.exports = function () {

    return {
        get: function (req, res) {
            DailyAnalysis.find({user: req.params.userId}).sort('date').exec(function (err, analyses) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: 'Cannot list the daily analysis'
                    });
                }
                res.json(analyses);
            });
        }
    };
};