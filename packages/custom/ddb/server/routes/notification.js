'use strict';

module.exports = function (Notification, app, auth) {

    var notification = require('../controllers/notification');

    app.route('/api/notification')
        .get(auth.requiresLogin, notification.all);

    app.route('/api/notification/:notificationId')
        .delete(auth.requiresLogin, notification.markAsRead);

};
