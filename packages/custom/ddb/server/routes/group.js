'use strict';

module.exports = function (Group, app, auth) {

    var group = require('../controllers/group');

    app.route('/api/group')
        .get(auth.requiresLogin, group.listGroups)
        .post(auth.requiresLogin, group.createGroup);

    app.route('/api/group/:groupId')
        .get(auth.requiresLogin, group.getGroup);

    app.route('/api/group/:groupId/invitation/:userId')
        .post(auth.requiresLogin, group.addInvitation)
        .delete(auth.requiresLogin, group.removeInvitation);

    app.route('/api/group/:groupId/member')
        .post(auth.requiresLogin, group.approveInvitation)
        .delete(auth.requiresLogin, group.leaveGroup);

    app.route('/api/invitation')
        .get(auth.requiresLogin, group.listInvitations);

    app.route('/api/group/:groupId/ranking/monthly/:date')
        .get(auth.requiresLogin, group.getMonthlyRanking);
};
