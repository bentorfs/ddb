'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Group = mongoose.model('Group'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    moment = require('moment');

module.exports = function () {

    return {
        listGroups: function (req, res) {
            Group.find({members: req.user._id}, function (err, groups) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        error: 'Cannot list the groups'
                    });
                }
                res.json(groups);
            });
        },
        createGroup: function (req, res) {
            var group = new Group(req.body);
            var upsertData = group.toObject();
            group.members = [req.user._id];
            group.creationDate = moment.utc().valueOf();
            group.save();
            res.json(group);
        },
        getGroup: function (req, res) {
            Group.findById(req.params.groupId).populate('members', 'username').populate('invitations', 'username').exec(function (err, doc) {
                if (err || !doc) {
                    console.log(err);
                    return res.status(500).json({
                        error: 'Cannot retrieve the group'
                    });
                }
                res.json(doc);
            });
        },
        listInvitations: function (req, res) {
            Group.find({invitations: req.user._id}, function (err, groups) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        error: 'Cannot list the invitations'
                    });
                }
                res.json(groups);
            });
        },
        approveInvitation: function (req, res) {
            Group.findOneAndUpdate({_id: req.params.groupId}, {
                '$pull': {invitations: req.user._id},
                '$push': {members: req.user._id}
            }, function (err) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        error: 'Cannot accept the invitation'
                    });
                }
                res.json({});
            });
        },
        rejectInvitation: function (req, res) {
            Group.findOneAndUpdate({_id: req.params.groupId}, {'$pull': {invitations: req.user._id}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        error: 'Cannot reject the invitation'
                    });
                }
                res.json({});
            });
        }
    };
};