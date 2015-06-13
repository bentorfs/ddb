'use strict';

var mongoose = require('mongoose'),
    Group = mongoose.model('Group'),
    _ = require('lodash');

module.exports = {
    ifProfilePermission: function (user, profile, authorizedCallback, forbiddenCallback) {
        if (JSON.stringify(profile.user) === JSON.stringify(user._id)) {
            authorizedCallback();
        } else {
            // See if there is a common group
            Group.find({members: {'$all': [user._id, profile.user]}}, function (err, groups) {
                if (err) {
                    console.error('Could not check profile permission, because of error: ' + err);
                    forbiddenCallback()
                }
                else if (!groups || groups.length === 0) {
                    console.error('User ' + user.username + ' has no permission to see profile of user ' + profile.user);
                    forbiddenCallback()
                } else {
                    authorizedCallback();
                }
            });
        }
    }
};

