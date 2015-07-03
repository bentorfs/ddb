'use strict';

var mongoose = require('mongoose'),
    Notification = mongoose.model('Notification'),
    moment = require('moment'),
    _ = require('lodash');

module.exports = {
    raiseGroupInvitationNotification: function (user, group) {
        var newNotification = new Notification();
        newNotification.creationDate = moment.utc().valueOf();
        newNotification.read = false;
        newNotification.user = user;
        newNotification.targetState = 'managegroups';
        newNotification.type = 'group.invitation';
        newNotification.data = {group: group};
        newNotification.save(function (err) {
            if (err) {
                console.error("Could not save notification: " + err);
            }
        })
    }
};

