'use strict';

var mongoose = require('mongoose'),
    DailyAnalysis = mongoose.model('DailyAnalysis'),
    DailyGroupAnalysis = mongoose.model('DailyGroupAnalysis'),
    Group = mongoose.model('Group'),
    GroupRanking = mongoose.model('GroupRanking'),
    Profile = mongoose.model('Profile'),
    _ = require('lodash'),
    moment = require('moment');

module.exports = {
    processUser: processUser,
    processGroup: processGroup
};

function processUser(user, callback) {
    Group.find({members: user}).exec(function (err, groups) {
        if (err) {
           return callback(err);
        }
        if (groups.length > 0) {
            var counter = _.after(groups.length, callback);
            _.forEach(groups, function (group) {
                processGroup(group, counter);
            });
        } else {
            callback();
        }

    });
}

function processGroup(group, callback) {
    console.info('Generating new daily group analyses for: ' + group.name);
    DailyAnalysis.aggregate([
        {$project: {date: 1, user: 1, todAlc: 1, group: {$literal: group._id}}},
        {'$match': {'user': {'$in': group.members}}},
        {
            '$group': {
                _id: {date: '$date', group: '$group'},
                todAvgAlc: {'$avg': '$todAlc'},
                todSumAlc: {'$sum': '$todAlc'},
                todMinAlc: {'$min': '$todAlc'},
                todMaxAlc: {'$max': '$todAlc'}
            }
        }
    ]).exec(function (err, dailygroupanalyses) {
        if (err) {
            console.error('Failed to generate daily group analyses for: ' + group.name + ', due to: ' + err);
            return callback(err);
        }

        if (dailygroupanalyses.length > 0) {
            console.info('Updating ' + dailygroupanalyses.length + ' daily group analyses for ' + group.name);
            var counter = _.after(dailygroupanalyses.length, function () {
                console.info('Successfully updated ' + dailygroupanalyses.length + ' daily group analyses for ' + group.name);
                callback();
            });
            _.forEach(dailygroupanalyses, function (dailyGroupAnalysis) {
                dailyGroupAnalysis.group = dailyGroupAnalysis._id.group;
                dailyGroupAnalysis.date = dailyGroupAnalysis._id.date;
                delete dailyGroupAnalysis._id;
                DailyGroupAnalysis.findOneAndUpdate({
                    group: dailyGroupAnalysis.group,
                    date: dailyGroupAnalysis.date
                }, dailyGroupAnalysis, {upsert: true}, function (err) {
                    if (err) {
                        console.error('Failed to updated daily group analysis for: ' + group.name + ', due to: ' + err);
                        return;
                    }
                    counter();
                });

            });
        } else {
            console.info('Not saving any daily group analyses for ' + group.name);
            callback();
        }
    });
}