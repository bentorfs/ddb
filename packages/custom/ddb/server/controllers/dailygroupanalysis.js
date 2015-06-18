'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    DailyGroupAnalysis = mongoose.model('DailyGroupAnalysis'),
    ObjectId = mongoose.Types.ObjectId,
    permissions = require('./../service/permissions'),
    _ = require('lodash'),
    moment = require('moment');

module.exports = {
    all: function (req, res) {
        permissions.ifGroupPermission(req.user, req.params.groupId, function () {
            DailyGroupAnalysis.find({'group': req.params.groupId}).sort('date').exec(function (err, groupanalyses) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: 'Cannot list the daily group analysis'
                    });
                }
                res.json(groupanalyses);
            });
        }, function () {
            res.status(401);
        });
    }
};