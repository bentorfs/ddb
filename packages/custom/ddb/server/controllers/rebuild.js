'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    dailyanalysisGenerator = require('./../service/dailyanalysis-generator'),
    profileGenerator = require('./../service/profile-generator'),
    grouprankingGenerator = require('./../service/groupranking-generator'),
    _ = require('lodash'),
    async = require('async'),
    moment = require('moment');


module.exports = function () {

    return {
        rebuild: function (req, res) {

            User.find({}).exec(function (err, users) {
                if (err || !users) return res.send(null);

                _.forEach(users, function (user) {
                    console.log('Rebuilding for user ' + user.username);
                    dailyanalysisGenerator.processUser(user, function () {
                        profileGenerator.processUser(user);
                        grouprankingGenerator.processUser(user);
                    });
                });

                res.json({});

            });

        }
    };
};