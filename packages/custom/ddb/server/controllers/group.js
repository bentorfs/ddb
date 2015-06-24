'use strict';

var mongoose = require('mongoose'),
    Group = mongoose.model('Group'),
    GroupRanking = mongoose.model('GroupRanking'),
    permissions = require('./../service/permissions'),
    _ = require('lodash'),
    moment = require('moment'),
    grouprankingGenerator = require('./../service/groupranking-generator');

module.exports = {
    listGroups: function (req, res, next) {
        Group.find({members: req.user._id}, function (err, groups) {
            if (err) {
                return next(err);
            }
            res.json(groups);
        });
    },
    createGroup: function (req, res, next) {
        var group = new Group(req.body);
        if (!group.name) {
            res.status(400).end();
            return;
        }
        group.members = [req.user._id];
        group.creationDate = moment.utc().valueOf();
        group.save(function (err) {
            if (err) {
                return next(err);
            }
            grouprankingGenerator.processGroup(group, function () {
                res.json(group);
            });
        });
    },
    getGroup: function (req, res, next) {
        permissions.ifGroupPermission(req.user, req.params.groupId, function () {
            Group.findById(req.params.groupId).populate('members', 'username').populate('invitations', 'username').exec(function (err, doc) {
                if (err) {
                    return next(err);
                }
                if (!doc) {
                    return res.status(404).end();
                }
                res.json(doc);
            });
        }, function () {
            res.status(401).end();
        });
    },
    getRanking: function (req, res, next) {
        permissions.ifGroupPermission(req.user, req.params.groupId, function () {
            GroupRanking.findOne({group: req.params.groupId})
                .populate('rankingHighestBinge.user', 'username')
                .populate('rankingConsistencyFactor.user', 'username')
                .populate('rankingDrinkingDayRate.user', 'username')
                .populate('rankingLiquor.user', 'username')
                .populate('rankingWine.user', 'username')
                .populate('rankingStrongbeer.user', 'username')
                .populate('rankingPilsner.user', 'username')
                .populate('rankingWeekend.user', 'username')
                .populate('rankingWorkWeek.user', 'username')
                .populate('rankingSun.user', 'username')
                .populate('rankingSat.user', 'username')
                .populate('rankingFri.user', 'username')
                .populate('rankingThu.user', 'username')
                .populate('rankingWed.user', 'username')
                .populate('rankingTue.user', 'username')
                .populate('rankingMon.user', 'username')
                .populate('rankingHappyLoner.user', 'username')
                .populate('rankingSadLoner.user', 'username')
                .populate('rankingSuperCup.user', 'username')
                .exec(function (err, ranking) {
                    if (err) {
                        return next(err);
                    }
                    if (!ranking) {
                        return res.status(404).end();
                    }
                    res.json(ranking);
                });
        }, function () {
            res.status(401).end();
        });
    },
    listInvitations: function (req, res, next) {
        Group.find({invitations: req.user._id}, function (err, groups) {
            if (err) {
                return next(err);
            }
            res.json(groups);
        });
    },
    approveInvitation: function (req, res, next) {
        Group.findOneAndUpdate({_id: req.params.groupId}, {
                '$pull': {invitations: req.user._id},
                '$addToSet': {members: req.user._id}
            },
            {new: true},
            function (err, group) {
                if (err) {
                    return next(err);
                }
                if (!group) {
                    return res.status(404).end();
                }
                grouprankingGenerator.processGroup(group, function () {
                    res.status(200).end();
                });
            });
    },
    leaveGroup: function (req, res, next) {
        // This is both for leaving a group, and rejecting an invitation to it
        Group.findOneAndUpdate(
            {
                _id: req.params.groupId
            },
            {
                '$pull': {invitations: req.user._id, members: req.user._id}
            },
            {new: true},
            function (err, group) {
                if (err) {
                    return next(err);
                }
                if (!group) {
                    return res.status(404).end();
                }
                grouprankingGenerator.processGroup(group, function () {
                    res.status(200).end();
                });
            });
    },
    addInvitation: function (req, res, next) {
        permissions.ifGroupPermission(req.user, req.params.groupId, function () {
            Group.findOneAndUpdate(
                {
                    _id: req.params.groupId,
                    members: {$ne: req.params.userId}
                },
                {
                    '$addToSet': {invitations: req.params.userId}
                }, function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.status(200).end();
                });
        }, function () {
            res.status(401).end();
        });
    },
    removeInvitation: function (req, res, next) {
        permissions.ifGroupPermission(req.user, req.params.groupId, function () {
            Group.findOneAndUpdate(
                {
                    _id: req.params.groupId
                },
                {
                    '$pull': {invitations: req.params.userId}
                },
                function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.status(200).end();
                });
        }, function () {
            res.status(401).end();
        });
    }
};