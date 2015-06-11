'use strict';

module.exports = function (Group, app, auth) {

    var group = require('../controllers/group')(Group);

    app.route('/api/group')
        .get(auth.requiresLogin, group.listGroups)
        .post(auth.requiresLogin, group.createGroup);

    app.route('/api/group/:groupId')
        .get(auth.requiresLogin, group.getGroup);
};
