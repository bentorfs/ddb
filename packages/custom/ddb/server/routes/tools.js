'use strict';

module.exports = function (Tools, app, auth) {

    var purge = require('../controllers/purge')(Tools);

    app.route('/api/users/data')
        .delete(auth.requiresLogin, purge.purgeUser);


};
