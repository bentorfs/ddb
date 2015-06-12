'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Profile = mongoose.model('Profile'),
    User = mongoose.model('User'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    moment = require('moment');

module.exports = function () {

    return {
        get: function (req, res) {
            Profile.findOne({user: req.params.userId}).exec(function (err, profile) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        error: 'Cannot retrieve profile for user'
                    });
                }

                res.json([profile]);
            });
        }
    };
};