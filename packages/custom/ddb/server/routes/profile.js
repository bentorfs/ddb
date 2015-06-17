'use strict';

module.exports = function (Profile, app, auth) {

    var profile = require('../controllers/profile');

    app.route('/api/profile/:userId')
        .get(auth.requiresLogin, profile.getUser);

    app.route('/api/profile/:userId/drinks/frequent')
        .get(auth.requiresLogin, profile.getFrequentDrinks);

};
