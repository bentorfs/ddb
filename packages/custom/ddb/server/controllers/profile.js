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
        mine: function (req, res) {
            Profile.findOne({user: req.user}).exec(function (err, profile) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        error: 'Cannot retrieve the profile'
                    });
                }

                res.json([profile]);
            });
        }
    };
};