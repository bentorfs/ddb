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
            console.error('Could not load groups that user ' + user.username + 'is a member of, because: ' + err);
            return;
        }
        var counter = _.after(groups.length, callback);
        _.forEach(groups, function (group) {
            processGroup(group, counter);
        });
    });
}

function processGroup(group, callback) {
    console.info('Clearing daily group analyses for: ' + group.name);
    DailyGroupAnalysis.remove({'_id.group': group._id}, function (err) {
        if (err) {
            console.error('Failed to clear daily group analyses for: ' + group.name + ', due to: ' + err);
            return;
        }
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
                return
            }
            if (dailygroupanalyses.length > 0) {
                console.info('Saving ' + dailygroupanalyses.length + ' daily group analyses for ' + group.name);
                DailyGroupAnalysis.collection.insert(dailygroupanalyses, function (err) {
                    if (err) {
                        console.error('Failed to save daily group analyses for: ' + group.name + ', due to: ' + err);
                        return
                    }
                    console.info('Successfully saved ' + dailygroupanalyses.length + ' daily group analyses for ' + group.name);
                    callback();
                });
            } else {
                console.info('Not saving any daily group analyses for ' + group.name);
            }
        })
    });


}