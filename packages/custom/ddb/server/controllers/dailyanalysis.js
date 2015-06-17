'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    ObjectId = mongoose.Types.ObjectId,
    permissions = require('./../service/permissions'),
    _ = require('lodash'),
    moment = require('moment');

module.exports = {
    all: function (req, res) {
        permissions.ifDailyAnalysisPermission(req.user, req.params.userId, function () {
            DailyAnalysis.find({user: req.params.userId}).sort('date').exec(function (err, analyses) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: 'Cannot list the daily analysis'
                    });
                }
                res.json(analyses);
            });
        }, function () {
            res.status(401);
        });
    }
};