'use strict';

module.exports = function (Measurements, app, auth) {

    var measurements = require('../controllers/measurement')(Measurements);

    app.route('/api/measurement')
        .get(auth.requiresLogin, measurements.all);

    app.route('/api/measurement')
        .post(auth.requiresLogin, measurements.update);

};
