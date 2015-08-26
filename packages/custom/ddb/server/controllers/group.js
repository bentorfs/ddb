'use strict';

var mongoose = require('mongoose'),
    Group = mongoose.model('Group'),
    MonthlyGroupRanking = mongoose.model('MonthlyGroupRanking'),
    Measurement = mongoose.model('Measurement'),
    Drink = mongoose.model('Drink'),
    permissions = require('./../service/permissions'),
    _ = require('lodash'),
    moment = require('moment'),
    notificationGenerator = require('./../service/notification-generator'),
    async = require('async');

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
            res.json(group);
        });

        _.forEach(group.invitations, function (invitation) {
            notificationGenerator.raiseGroupInvitationNotification(invitation, {
                type: 'groupInvitation',
                title: 'You are invited to join the group ' + group.name
            });
        })
    },
    getGroup: function (req, res, next) {
        permissions.ifGroupPermission(req.user, req.params.groupId, function () {
            getGroup(req.params.groupId, function (err, group) {
                if (err) {
                    return next(err);
                }
                if (!group) {
                    return res.status(404).end();
                }
                getFrequentDrinks(group.members, function (err, frequentDrinks) {
                    if (err) {
                        return next(err);
                    }
                    var returnObject = group.toJSON();
                    returnObject.frequentDrinks = frequentDrinks;
                    res.json(returnObject);
                });
            });
        }, function () {
            res.status(401).end();
        });
    },
    getMonthlyRanking: function (req, res, next) {
        permissions.ifGroupPermission(req.user, req.params.groupId, function () {
            getMonthlyGroupRanking(req.params.groupId, parseInt(req.params.date, 10), function (err, ranking) {
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
                res.status(200).end();
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
                res.status(200).end();
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
                }, function (err, group) {
                    if (err) {
                        return next(err);
                    }
                    notificationGenerator.raiseGroupInvitationNotification(req.params.userId, group);
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

function getGroup(groupId, callback) {
    Group.findById(groupId).populate('members', 'username').populate('invitations', 'username').exec(function (err, doc) {
        if (err) {
            return callback(err);
        }
        callback(null, doc);
    });
}

function getMonthlyGroupRanking(groupId, date, callback) {
    MonthlyGroupRanking.findOne({group: groupId, date: moment.utc(date).startOf('month').valueOf()})
        .populate('trophies.ranking.user', 'username')
        .populate('supercup.user', 'username')
        .exec(function (err, ranking) {
            if (err) {
                return callback(err);
            }
            callback(null, ranking);
        });
}

function getFrequentDrinks(users, callback) {
    var userIdList = _.pluck(users, '_id');
    Measurement.aggregate([
        {$match: {'user': {$in: userIdList}}},
        {$project: {consumptions: 1}},
        {$unwind: "$consumptions"},
        {
            '$group': {
                _id: {'_id': '$_id'},
                uniqueDrinks: {$addToSet: "$consumptions.drink"}
            }
        },
        {$unwind: "$uniqueDrinks"},
        {
            '$group': {
                _id: '$uniqueDrinks',
                nbDays: {$sum: 1}
            }
        },
        {$project: {_id: 0, drink: "$_id", nbDays: 1}},
        {$sort: {nbDays: -1}},
        {$limit: 5}
    ]).exec(function (err, frequentDrinks) {
        if (err) {
            callback(err);
        }
        Drink.populate(frequentDrinks, {path: "drink"}, function (err, docs) {
            if (err) {
                return callback(err);
            }
            callback(null, docs);
        });
    });
}