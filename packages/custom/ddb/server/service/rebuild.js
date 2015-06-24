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
    rebuildEverything: function (done) {
        rebuildAllDailyAnalyses(done);
    },
    rebuildUser: function (userId, done) {
        User.findById(userId, function (err, user) {
            if (err || !user) {
                console.error('Could not retrieve user with id ' + userId + ', because: ' + err);
            } else {
                async.waterfall([
                    function (callback) {
                        dailyanalysisGenerator.processUser(user, callback);
                    },
                    function (callback) {
                        profileGenerator.processUser(user, callback);
                    },
                    function (callback) {
                        dailygroupanalysisGenerator.processUser(user, callback);
                    },
                    function (callback) {
                        grouprankingGenerator.processUser(user, callback);
                    }
                ], function (err) {
                    done(err);
                });
            }
        });
    }
};

function rebuildAllDailyAnalyses(done) {
    User.find({}).exec(function (err, users) {
        if (err) {
            console.error('Could not retrieve users for rebuilding daily analyses, because: ' + err);
            return done(err);
        }
        var counter = _.after(users.length, function () {
            rebuildAllDailyGroupAnalyses(done);
        });
        _.forEach(users, function (user) {
            console.log('Rebuilding all daily analyses for user ' + user.username);
            dailyanalysisGenerator.processUser(user, counter);
        });
    });
}

function rebuildAllDailyGroupAnalyses(done) {
    Group.find({}).exec(function (err, groups) {
        if (err) {
            console.error('Could not retrieve groups for rebuilding daily group analyses, because: ' + err);
            return done(err);
        }
        var counter = _.after(groups.length, function () {
            rebuildAllProfiles(done);
        });
        _.forEach(groups, function (group) {
            console.log('Rebuilding all daily group analyses for group ' + group.name);
            dailygroupanalysisGenerator.processGroup(group, counter);
        });
    });
}

function rebuildAllProfiles(done) {
    User.find({}).exec(function (err, users) {
        if (err) {
            console.error('Could not retrieve users for rebuilding profiles, because: ' + err);
            return done(err);
        }
        var counter = _.after(users.length, function () {
            rebuildAllGroupRankings(done);
        });
        _.forEach(users, function (user) {
            console.log('Rebuilding profile for user ' + user.username);
            profileGenerator.processUser(user, counter);
        });
    });
}

function rebuildAllGroupRankings(done) {
    Group.find({}).exec(function (err, groups) {
        if (err) {
            console.error('Could not retrieve groups for rebuilding rankings, because: ' + err);
            return done(err);
        }
        var counter = _.after(groups.length, done);
        _.forEach(groups, function (group) {
            console.log('Rebuilding rankings for group ' + group.name);
            grouprankingGenerator.processGroup(group, counter);
        });
    });
}