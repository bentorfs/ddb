'use strict';

var mongoose = require('mongoose'),
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

    var rankingHighestBinge = getBingeRanking(profiles);

    return {
        group: group,
        calculationDate: moment.utc().valueOf(),
        rankingHighestBinge: rankingHighestBinge
    }
}

function getBingeRanking(profiles) {
    var rankedProfiles = _.sortByOrder(profiles, ['highestBinge'], false);
    var result = [];
    _.forEach(rankedProfiles, function (profile) {
        result.push(
            {
                user: profile.user,
                value: profile.highestBinge
            }
        )
    });
    return result;
}