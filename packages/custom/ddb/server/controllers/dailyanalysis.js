'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    ObjectId = mongoose.Types.ObjectId,
    permissions = require('./../service/permissions'),
    _ = require('lodash'),
    moment = require('moment');

module.exports = {
    all: function (req, res, next) {
        permissions.ifDailyAnalysisPermission(req.user, req.params.userId, function () {
            var fromDate = req.query.fromDate || moment.utc().subtract(30, 'days').valueOf();
            var toDate = req.query.toDate || moment.utc().valueOf();

            DailyAnalysis.find({
                user: req.params.userId, date: {
                    $gte: fromDate,
                    $lte: toDate
                }
            }).sort('date').exec(function (err, analyses) {
                if (err) {
                    return next(err);
                }
                res.json(analyses);
            });
        }, function () {
            res.status(401).end();
        });
    }
};