'use strict';

var mongoose = require('mongoose'),
    Profile = mongoose.model('Profile'),
    permissions = require('./../service/permissions'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    moment = require('moment');

module.exports = {
    get: function (req, res) {
        permissions.ifProfilePermission(req.user, req.params.userId, function () {
            Profile.findOne({user: req.params.userId}).exec(function (err, profile) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: 'Cannot retrieve profile for user'
                    });
                }
                if (profile) {
                    res.json([profile]);
                } else {
                    res.status(404).json({error: 'Profile does not exist'})
                }
            });
        }, function () {
            res.status(401).json({error: 'You are not allowed to see this data'})
        });
    }
};