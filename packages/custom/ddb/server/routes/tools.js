'use strict';

module.exports = function (Tools, app, auth) {

    var purge = require('../controllers/purge')(Tools);
    var rebuild = require('../controllers/rebuild')(Tools);

    app.route('/api/users/data')
        .delete(auth.requiresLogin, purge.purgeUser);

    app.route('/api/rebuild')
        .post(auth.requiresLogin, rebuild.rebuild);


};
