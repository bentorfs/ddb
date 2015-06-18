'use strict';

module.exports = function (Measurements, app, auth) {

    var measurements = require('../controllers/measurement');

    app.route('/api/measurement')
        .get(auth.requiresLogin, measurements.all);

    app.route('/api/measurement/:date')
        .get(auth.requiresLogin, measurements.get);

    app.route('/api/measurement')
        .post(auth.requiresLogin, measurements.update);

    app.route('/api/measurement/:date/consumptions')
        .post(auth.requiresLogin, measurements.addConsumption)
        .delete(auth.requiresLogin, measurements.removeConsumption);

};
