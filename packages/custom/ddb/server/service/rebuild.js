'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    dailyanalysisGenerator = require('./dailyanalysis-generator'),
    dailygroupanalysisGenerator = require('./dailygroupanalysis-generator'),
    profileGenerator = require('./profile-generator'),
    grouprankingGenerator = require('./groupranking-generator'),
    _ = require('lodash'),
    async = require('async'),
    moment = require('moment');


module.exports = {
    rebuildEverything: function () {
        rebuildAllDailyAnalyses();
    },
    rebuildUser: function (user) {
        dailyanalysisGenerator.processUser(user, function () {
            profileGenerator.processUser(user, function () {
                dailygroupanalysisGenerator.processUser(user, function () {
                    grouprankingGenerator.processUser(user);
                });
            });
        });
    }
};

function rebuildAllDailyAnalyses() {
    User.find({}).exec(function (err, users) {
        if (err) {
            console.error('Could not retrieve users for rebuilding daily analyses, because: ' + err)
        }
        var counter = _.after(users.length, rebuildAllDailyGroupAnalyses);
        _.forEach(users, function (user) {
            console.log('Rebuilding all daily analyses for user ' + user.username);
            dailyanalysisGenerator.processUser(user, counter);
        });
    });
}

function rebuildAllDailyGroupAnalyses() {
    Group.find({}).exec(function (err, groups) {
        if (err) {
            console.error('Could not retrieve groups for rebuilding daily group analyses, because: ' + err)
        }
        var counter = _.after(groups.length, rebuildAllProfiles);
        _.forEach(groups, function (group) {
            console.log('Rebuilding all daily group analyses for group ' + group.name);
            dailygroupanalysisGenerator.processGroup(group, counter);
        });
    });
}

function rebuildAllProfiles() {
    User.find({}).exec(function (err, users) {
        if (err) {
            console.error('Could not retrieve users for rebuilding profiles, because: ' + err)
        }
        var counter = _.after(users.length, rebuildAllGroupRankings);
        _.forEach(users, function (user) {
            console.log('Rebuilding profile for user ' + user.username);
            profileGenerator.processUser(user, counter);
        });
    });
}

function rebuildAllGroupRankings() {
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