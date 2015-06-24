'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Measurement = mongoose.model('Measurement'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    Group = mongoose.model('Group'),
    Profile = mongoose.model('Profile'),
    permissions = require('./../service/permissions'),
    rebuild = require('../service/rebuild'),
    _ = require('lodash'),
    async = require('async'),
    moment = require('moment');


module.exports = {
    rebuildEverything: function (req, res, next) {
        rebuild.rebuildEverything(function (err) {
            if (err) {
                return next(err);
            }
            res.status(200).end();
        });
    },
    rebuildUser: function (req, res, next) {
        permissions.ifUserToolsPermission(req.user, req.params.userId, function () {
            rebuild.rebuildUser(req.params.userId, null, function (err) {
                if (err) {
                    return next(err);
                }
                res.status(200).end();
            });
        }, function () {
            res.status(401).end();
        });
    },
    purgeUser: function (req, res, next) {
        permissions.ifUserToolsPermission(req.user, req.params.userId, function () {
            var userId = req.params.userId;
            async.parallel(
                {
                    measurements: function (callback) {
                        Measurement.where({user: userId}).setOptions({multi: true}).remove(function (err) {
                            callback(err);
                        });
                    },
                    dailyanalyses: function (callback) {
                        DailyAnalysis.where({user: userId}).setOptions({multi: true}).remove(function (err) {
                            callback(err);
                        });
                    },
                    profile: function (callback) {
                        Profile.where({user: userId}).setOptions({multi: true}).remove(function (err) {
                            callback(err);
                        });
                    },
                    user: function (callback) {
                        User.where({_id: userId}).setOptions({multi: true}).remove(function (err) {
                            callback(err);
                        });
                    },
                    groups: function (callback) {
                        Group.update(
                            {$or: [{members: userId}, {invitations: userId}]},
                            {'$pull': {members: userId, invitations: userId}},
                            {multi: true},
                            function (err) {
                                callback(err);
                            }
                        );
                    }
                },
                function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    res.status(200).end();
                }
            );
        }, function () {
            res.status(401).end();
        });
    }
};