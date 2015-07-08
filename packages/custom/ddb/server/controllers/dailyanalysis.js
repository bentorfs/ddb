'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    ObjectId = mongoose.Types.ObjectId,
    permissions = require('./../service/permissions'),
    _ = require('lodash'),
    moment = require('moment');

module.exports = {
    daily: function (req, res, next) {
        permissions.ifDailyAnalysisPermission(req.user, req.params.userId, function () {
            var fromDate = req.query.fromDate || moment.utc().subtract(30, 'days').valueOf();
            var toDate = req.query.toDate || moment.utc().valueOf();

            DailyAnalysis.find({
                user: req.params.userId,
                date: {
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
    },
    weekly: function (req, res, next) {
        permissions.ifDailyAnalysisPermission(req.user, req.params.userId, function () {
            DailyAnalysis.aggregate([
                {$match: {'user': ObjectId(req.params.userId), ignore: false}},
                {$project: {week: {$week: "$date"}, todAlc: 1}},
                {
                    '$group': {
                        _id: '$week',
                        totAlc: {$sum: '$todAlc'}
                    }
                },
                {$project: {_id: 0, week: "$_id", totAlc: 1}},
                {$sort: {week: 1}}
            ]).exec(function (err, weeklyAnalyses) {
                if (err) {
                    next(err);
                }
                res.json(weeklyAnalyses);
            });
        }, function () {
            res.status(401).end();
        });
    },
    monthly: function (req, res, next) {
        permissions.ifDailyAnalysisPermission(req.user, req.params.userId, function () {
            DailyAnalysis.aggregate([
                {$match: {'user': ObjectId(req.params.userId), ignore: false}},
                {$project: {month: {$month: "$date"}, todAlc: 1}},
                {
                    '$group': {
                        _id: '$month',
                        totAlc: {$sum: '$todAlc'}
                    }
                },
                {$project: {_id: 0, month: "$_id", totAlc: 1}},
                {$sort: {month: 1}}
            ]).exec(function (err, weeklyAnalyses) {
                if (err) {
                    next(err);
                }
                res.json(weeklyAnalyses);
            });
        }, function () {
            res.status(401).end();
        });
    }
};