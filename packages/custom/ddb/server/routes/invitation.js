'use strict';

module.exports = function (Group, app, auth) {

    var group = require('../controllers/group')(Group);

    app.route('/api/invitation')
        .get(auth.requiresLogin, group.listInvitations);

    app.route('/api/invitation/:groupId')
        .post(auth.requiresLogin, group.approveInvitation)
        .delete(auth.requiresLogin, group.rejectInvitation);
};
