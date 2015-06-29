'use strict';

module.exports = function (DailyAnalysis, app, auth) {

    var dailyAnalysis = require('../controllers/dailyanalysis');

    app.route('/api/analysis/daily/:userId')
        .get(auth.requiresLogin, dailyAnalysis.daily);

    app.route('/api/analysis/weekly/:userId')
        .get(auth.requiresLogin, dailyAnalysis.weekly);

    app.route('/api/analysis/monthly/:userId')
        .get(auth.requiresLogin, dailyAnalysis.monthly);
};
