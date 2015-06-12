'use strict';

module.exports = function (Profile, app, auth) {

    var profile = require('../controllers/profile')(Profile);

    app.route('/api/profile/:userId')
        .get(auth.requiresLogin, profile.get);
};
