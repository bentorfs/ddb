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

function processUser(user) {
    Group.find({members: user}).exec(function (err, groups) {
        if (err) {
            console.error('Could not load groups of user: ' + err);
            return;
        }

        _.forEach(groups, function (group) {
            processGroup(group);
        });

    });
}

function processGroup(group) {
    Profile.find({user: {'$in': group.members}}).populate('user').exec(function (err, profiles) {
        if (err) {
            console.error('Could not load profiles of group members: ' + err);
            return;
        }

        var groupRanking = getGroupRanking(group, profiles);

        GroupRanking.findOneAndUpdate({
            group: group._id
        }, groupRanking, {upsert: true}, function (err) {
            if (err) {
                console.error('Could not update group ranking: ' + err);
            }
            console.info('Updated group ' + group.id);
        });
    });
}

function getGroupRanking(group, profiles) {

    calculateDailyGroupAnalysis(group);

    return {
        group: group,
        calculationDate: moment.utc().valueOf(),
        rankingHighestBinge: getFieldRanking(profiles, 'highestBinge', false),
        rankingConsistencyFactor: getFieldRanking(profiles, 'consistencyFactor', false),
        rankingDrinkingDayRate: getFieldRanking(profiles, 'drinkingDayRate', false),
        rankingLiquor: getFieldRanking(profiles, 'avgLiquor', false),
        rankingWine: getFieldRanking(profiles, 'avgWine', false),
        rankingStrongbeer: getFieldRanking(profiles, 'avgStrongbeer', false),
        rankingPilsner: getFieldRanking(profiles, 'avgPilsner', false),
        rankingWeekend: getFieldRanking(profiles, 'avgAlcWeekend', false),
        rankingWorkWeek: getFieldRanking(profiles, 'avgAlcWorkWeek', false),
        rankingSun: getFieldRanking(profiles, 'avgAlcSun', false),
        rankingSat: getFieldRanking(profiles, 'avgAlcSat', false),
        rankingFri: getFieldRanking(profiles, 'avgAlcFri', false),
        rankingThu: getFieldRanking(profiles, 'avgAlcThu', false),
        rankingWed: getFieldRanking(profiles, 'avgAlcWed', false),
        rankingTue: getFieldRanking(profiles, 'avgAlcTue', false),
        rankingMon: getFieldRanking(profiles, 'avgAlcMon', false)
    }
}

function getFieldRanking(profiles, fieldName, reverse) {
    var rankedProfiles = _.sortByOrder(profiles, [fieldName], reverse);
    return _.map(rankedProfiles, function (profile) {
        return {
            user: profile.user,
            value: profile[fieldName]
        }
    });
}

function calculateDailyGroupAnalysis(group) {

    DailyGroupAnalysis.remove({'_id.group': group._id}, function (err) {
        if (err) {
            console.error(err);
            return;
        }
        DailyAnalysis.aggregate([
            {$project: {date: 1, user: 1, todAlc: 1, group: {$literal: group._id}}},
            {'$match': {'user': {'$in': group.members}}},
            {
                '$group': {
                    _id: {date: '$date', group: '$group'},
                    avg: {'$avg': '$todAlc'},
                    sum: {'$sum': '$todAlc'},
                    min: {'$min': '$todAlc'},
                    max: {'$max': '$todAlc'}
                }
            },
            {'$out': 'dailygroupanalyses'}
        ]).exec(function (err, docs) {
            if (err) {
                console.log(err);
            }
        })
    });


}
