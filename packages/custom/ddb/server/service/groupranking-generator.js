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
        rankingConsistencyFactor: getFieldRanking(profiles, 'consistencyFactor', true),
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
        rankingMon: getFieldRanking(profiles, 'avgAlcMon', false),
        rankingSadLoner: getGroupFieldRanking(profiles, group, 'sadLonerFactor', false),
        rankingHappyLoner: getGroupFieldRanking(profiles, group, 'happyLonerFactor', false)
    }
}

function getFieldRanking(profiles, fieldName, reverse) {
    var rankedProfiles = _.sortByOrder(_.filter(profiles, function (profile) {
        return profile[fieldName]
    }), [fieldName], reverse);
    return _.map(rankedProfiles, function (profile) {
        return {
            user: profile.user,
            value: profile[fieldName]
        }
    });
}

function getGroupFieldRanking(profiles, targetGroup, fieldName, reverse) {
    var rankedProfiles = _.sortByOrder(profiles, function (profile) {
        var rightGroup = _.find(profile.groups, function (aGroup) {
            return _.isEqual(aGroup.group, targetGroup._id);
        });
        if (rightGroup) {
            return rightGroup[fieldName];
        } else {
            return 0;
        }
    }, reverse);

    return _.map(rankedProfiles, function (profile) {
        var rightGroup = _.find(profile.groups, function (aGroup) {
            return _.isEqual(aGroup.group, targetGroup._id);
        });
        return {
            user: profile.user,
            value: rightGroup ? rightGroup[fieldName] : 0
        }
    });
}

function calculateDailyGroupAnalysis(group) {

    console.info('Generating daily group analyses for: ' + group.name);

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
                    todAvgAlc: {'$avg': '$todAlc'},
                    todSumAlc: {'$sum': '$todAlc'},
                    todMinAlc: {'$min': '$todAlc'},
                    todMaxAlc: {'$max': '$todAlc'}
                }
            }
        ]).exec(function (err, dailygroupanalyses) {
            if (err) {
                console.error(err);
                return
            }
            console.info('Generated ' + dailygroupanalyses.length + ' daily group analyses for ' + group.name);
            DailyGroupAnalysis.collection.insert(dailygroupanalyses);
        })
    });


}
