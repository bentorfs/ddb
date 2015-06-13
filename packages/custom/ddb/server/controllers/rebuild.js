'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    dailyanalysisGenerator = require('./../service/dailyanalysis-generator'),
    dailygroupanalysisGenerator = require('./../service/dailygroupanalysis-generator'),
    profileGenerator = require('./../service/profile-generator'),
    grouprankingGenerator = require('./../service/groupranking-generator'),
    _ = require('lodash'),
    async = require('async'),
    moment = require('moment');


module.exports = function () {

    return {
        rebuild: function (req, res) {
            rebuildDailyAnalyses();
            res.json({});
        }
    };
};

function rebuildDailyAnalyses() {
    User.find({}).exec(function (err, users) {
        if (err) {
            console.error('Could not retrieve users for rebuilding daily analyses, because: ' + err)
        }
        var counter = _.after(users.length, rebuildDailyGroupAnalyses);
        _.forEach(users, function (user) {
            console.log('Rebuilding all daily analyses for user ' + user.username);
            dailyanalysisGenerator.processUser(user, counter);
        });
    });
}

function rebuildDailyGroupAnalyses() {
    Group.find({}).exec(function (err, groups) {
        if (err) {
            console.error('Could not retrieve groups for rebuilding daily group analyses, because: ' + err)
        }
        var counter = _.after(groups.length, rebuildProfiles);
        _.forEach(groups, function (group) {
            console.log('Rebuilding all daily group analyses for group ' + group.name);
            dailygroupanalysisGenerator.processGroup(group, counter);
        });
    });
}

function rebuildProfiles() {
    User.find({}).exec(function (err, users) {
        if (err) {
            console.error('Could not retrieve users for rebuilding profiles, because: ' + err)
        }
        var counter = _.after(users.length, rebuildGroupRankings);
        _.forEach(users, function (user) {
            console.log('Rebuilding profile for user ' + user.username);
            profileGenerator.processUser(user, counter);
        });
    });
}

function rebuildGroupRankings() {
    Group.find({}).exec(function (err, groups) {
        if (err) {
            console.error('Could not retrieve groups for rebuilding rankings, because: ' + err)
        }
        _.forEach(groups, function (group) {
            console.log('Rebuilding rankings for group ' + group.name);
            grouprankingGenerator.processGroup(group);
        });
    });
}