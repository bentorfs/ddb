'use strict';

module.exports = function (Tools, app, auth) {

    var purge = require('../controllers/purge');
    var rebuild = require('../service/rebuild');

    app.route('/api/users/data')
        .delete(auth.requiresLogin, purge.purgeUser);

    app.route('/api/rebuild')
        .post(auth.requiresLogin, function (req, res) {
            rebuild.rebuildEverything();
            res.json({});
        });


};
