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
    rebuildEverything: function (req, res) {
        rebuild.rebuildEverything(function () {
            res.status(200).end();
        });
    },
    rebuildUser: function (req, res) {
        permissions.ifUserToolsPermission(req.user, req.params.userId, function () {
            rebuild.rebuildUser(req.params.userId, function () {
                res.status(200).end();
            });
        }, function () {
            res.status(401).end();
        });
    },
    purgeUser: function (req, res) {
        permissions.ifUserToolsPermission(req.user, req.params.userId, function () {
            var userId = req.params.userId;
            async.parallel(
                {
                    measurements: function (callback) {
                        Measurement.where({user: userId}).setOptions({multi: true}).remove(function (err) {
                            if (err) {
                                console.error(err);
                            }
                            callback();
                        });
                    },
                    dailyanalyses: function (callback) {
                        DailyAnalysis.where({user: userId}).setOptions({multi: true}).remove(function (err) {
                            if (err) {
                                console.error(err);
                            }
                            callback();
                        });
                    },
                    profile: function (callback) {
                        Profile.where({user: userId}).setOptions({multi: true}).remove(function (err) {
                            if (err) {
                                console.error(err);
                            }
                            callback();
                        });
                    },
                    user: function (callback) {
                        User.where({_id: userId}).setOptions({multi: true}).remove(function (err) {
                            if (err) {
                                console.error(err);
                            }
                            callback();
                        });
                    },
                    groups: function (callback) {
                        // TODO: this is broken
                        Group.where(
                            {
                                $or: [{members: userId}, {invitations: userId}]
                            }).update(
                            {
                                '$pull': {invitations: userId, members: userId}
                            }).exec(function (err) {
                                if (err) {
                                    console.error(err);
                                }
                                callback();
                            });
                    }
                },
                function (error, result) {
                    if (error) {
                        console.error(err);
                        return res.status(500).end();
                    }
                    res.status(200).end();
                }
            );
        }, function () {
            res.status(401).end();
        });
    }
};