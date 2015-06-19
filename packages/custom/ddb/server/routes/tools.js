'use strict';

module.exports = function (Tools, app, auth) {

    var tools = require('../controllers/tools');

    app.route('/api/users/:userId')
        .delete(auth.requiresLogin, tools.purgeUser);

    app.route('/api/tools/rebuild/user/:userId')
        .post(auth.requiresLogin, tools.rebuildUser);

    app.route('/api/tools/rebuild')
        .post(auth.requiresAdmin, tools.rebuildEverything);

};
