'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    dailyanalysisGenerator = require('./dailyanalysis-generator'),
    dailygroupanalysisGenerator = require('./dailygroupanalysis-generator'),
    _ = require('lodash'),
    async = require('async'),
    moment = require('moment');


module.exports = {
    rebuildEverything: function (done) {
        rebuildAllDailyAnalyses(done);
    },
    rebuildUser: function (userId, date, done) {
        User.findById(userId, function (err, user) {
            if (err || !user) {
                console.error('Could not retrieve user with id ' + userId + ', because: ' + err);
            } else {
                async.waterfall([
                    function (callback) {
                        dailyanalysisGenerator.processUser(user, date, callback);
                    },
                    function (callback) {
                        dailygroupanalysisGenerator.processUser(user, date, callback);
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
            console.info('Rebuilding all daily analyses for user ' + user.username);
            dailyanalysisGenerator.processUser(user, null, counter);
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
            console.info('Rebuilding all daily group analyses for group ' + group.name);
            dailygroupanalysisGenerator.processGroup(group, null, counter);
        });
    });
}

function rebuildAllProfiles(done) {
    User.find({}).exec(function (err, users) {
        if (err) {
            console.error('Could not retrieve users for rebuilding profiles, because: ' + err);
            return done(err);
        }
        var counter = _.after(users.length, done);
        _.forEach(users, function (user) {
            console.log('Rebuilding profile for user ' + user.username);
            profileGenerator.processUser(user, counter);
        });
    });
}
