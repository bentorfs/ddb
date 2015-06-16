'use strict';

var mongoose = require('mongoose'),
    Group = mongoose.model('Group'),
    _ = require('lodash');

module.exports = {
    ifProfilePermission: function (requestUser, targetUserId, authorizedCallback, forbiddenCallback) {
        if (targetUserId === requestUser._id) {
            authorizedCallback();
        } else {
            // See if there is a common group
            Group.find({members: {'$all': [targetUserId, requestUser._id]}}, function (err, groups) {
                if (err) {
                    console.error('Could not check profile permission, because of error: ' + err);
                    forbiddenCallback()
                }
                else if (!groups || groups.length === 0) {
                    console.error('User ' + requestUser.username + ' has no permission to see profile of user ' + targetUserId);
                    forbiddenCallback()
                } else {
                    authorizedCallback();
                }
            });
        }
    },
    ifDailyAnalysisPermission: function (requestUser, targetUserId, authorizedCallback, forbiddenCallback) {
        if (targetUserId === requestUser._id) {
            authorizedCallback();
        } else {
            // See if there is a common group
            Group.find({members: {'$all': [targetUserId, requestUser._id]}}, function (err, groups) {
                if (err) {
                    console.error('Could not check daily analyses permission, because of error: ' + err);
                    forbiddenCallback()
                }
                else if (!groups || groups.length === 0) {
                    console.error('User ' + requestUser.username + ' has no permission to see daily analyses of user ' + targetUserId);
                    forbiddenCallback()
                } else {
                    authorizedCallback();
                }
            });
        }
    },
    ifGroupPermission: function (requestUser, groupId, authorizedCallback, forbiddenCallback) {
        // See if the user is a member
        Group.find({'_id': groupId, members: requestUser._id}, function (err, groups) {
            if (err) {
                console.error('Could not check group permission, because of error: ' + err);
                forbiddenCallback()
            }
            else if (!groups || groups.length === 0) {
                console.error('User ' + requestUser.username + ' has no permission to see group ' + groupId);
                forbiddenCallback()
            } else {
                authorizedCallback();
            }
        });
    }
};

