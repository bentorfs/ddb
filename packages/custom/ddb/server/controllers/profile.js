'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Profile = mongoose.model('Profile'),
    permissions = require('./../service/permissions'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    moment = require('moment');

module.exports = function () {

    return {
        get: function (req, res) {
            Profile.findOne({user: req.params.userId}).exec(function (err, profile) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        error: 'Cannot retrieve profile for user'
                    });
                }
                if (profile) {
                    permissions.ifProfilePermission(req.user, profile, function () {
                        res.json([profile]);
                    }, function () {
                        res.status(401).json({error: 'You are not allowed to see this profile'})
                    });
                } else {
                    res.status(404).json({error: 'Profile does not exist'})
                }
            });
        }
    };
};