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
            console.error('Could not load groups of user: ' + err);
            return;
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
    Profile.find({user: {'$in': group.members}}).populate('user').exec(function (err, profiles) {
        if (err) {
            console.error('Could not load profiles of group members: ' + err);
            return;
        }

        var groupRanking = getGroupRanking(group, profiles);

        var superCupRanking = getSuperCupRanking(groupRanking);
        groupRanking.rankingSuperCup = superCupRanking;

        GroupRanking.findOneAndUpdate({
            group: group._id
        }, groupRanking, {upsert: true}, function (err) {
            if (err) {
                console.error('Could not update group ranking: ' + err);
            }
            console.info('Updated rankings for group ' + group.name);
            if (callback) {
                callback();
            }
        });
    });
}

function getSuperCupRanking(groupRanking) {
    var scores = {};

    var majorScores = [10, 5, 3];
    var majorTrophies = ['rankingHighestBinge', 'rankingConsistencyFactor', 'rankingDrinkingDayRate', 'rankingWeekend', 'rankingWorkWeek', 'rankingSun'];
    var sideScores = [5, 3, 1];
    var sideTrophies = ['rankingLiquor', 'rankingWine', 'rankingStrongbeer', 'rankingPilsner', 'rankingSadLoner', 'rankingHappyLoner'];
    var minorScores = [3, 1, 0];
    var minorTrophies = ['rankingSat', 'rankingFri', 'rankingThu', 'rankingWed', 'rankingTue', 'rankingMon'];

    _.forEach(majorTrophies, function (trophy) {
        var trophyRanking = groupRanking[trophy];
        _.forEach(majorScores, function (score, index) {
            if (trophyRanking[index]) {
                var user = trophyRanking[index].user._id;
                var currentScore = scores[user] || 0;
                scores[user] = currentScore + score;
            }
        });
    });

    _.forEach(sideTrophies, function (trophy) {
        var trophyRanking = groupRanking[trophy];
        _.forEach(sideScores, function (score, index) {
            if (trophyRanking[index]) {
                var user = trophyRanking[index].user._id;
                var currentScore = scores[user] || 0;
                scores[user] = currentScore + score;
            }
        });
    });

    _.forEach(minorTrophies, function (trophy) {
        var trophyRanking = groupRanking[trophy];
        _.forEach(minorScores, function (score, index) {
            if (trophyRanking[index]) {
                var user = trophyRanking[index].user._id;
                var currentScore = scores[user] || 0;
                scores[user] = currentScore + score;
            }
        });
    });

    var result = [];
    _.forEach(_.keys(scores), function (user) {
        result.push({
            user: user,
            value: scores[user]
        })
    });
    return _.sortByOrder(result, 'value', false);
}

function getGroupRanking(group, profiles) {

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

